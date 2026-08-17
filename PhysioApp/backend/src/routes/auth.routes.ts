import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { User } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { AppError } from "../utils/AppError";
import { requireAuth, signPatientToken, signStaffToken } from "../middleware/auth";

export const authRouter = Router();

// Projeção pública do usuário da equipe — nunca inclui passwordHash.
// Centralizado aqui porque login, GET /me e PATCH /me retornam o mesmo formato.
function serializeStaffUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    document: user.document,
    avatarUrl: user.avatarUrl,
    priceTableUrl: user.priceTableUrl,
    priceTableName: user.priceTableName,
    priceTableUpdatedAt: user.priceTableUpdatedAt,
  };
}

// --- Login da fisioterapeuta/equipe (painel web) --------------------

const staffLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post(
  "/staff/login",
  asyncHandler(async (req, res) => {
    const { email, password } = staffLoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("Credenciais inválidas", 401);

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new AppError("Credenciais inválidas", 401);

    const token = signStaffToken(user.id, user.role as "ADMIN" | "FISIOTERAPEUTA");
    res.json({ token, user: serializeStaffUser(user) });
  })
);

// --- Identificação do paciente no app (telefone + código) -----------
// Em dev, o "código" é fixo (PATIENT_OTP_DEV). Em produção, o passo
// /otp/request dispararia um SMS real — o hook já está isolado aqui.

const otpRequestSchema = z.object({ phone: z.string().min(8) });
const otpVerifySchema = z.object({ phone: z.string().min(8), code: z.string().min(4) });

authRouter.post(
  "/patient/otp/request",
  asyncHandler(async (req, res) => {
    const { phone } = otpRequestSchema.parse(req.body);
    // TODO(integração futura): disparar SMS real via provedor (ex.: Twilio/Zenvia).
    console.log(`[OTP] Código de verificação para ${phone}: ${process.env.PATIENT_OTP_DEV ?? "123456"}`);
    res.json({ sent: true });
  })
);

// --- Perfil da equipe (dados usados como emitente nos recibos) ------

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (req.auth?.kind !== "staff") throw new AppError("Acesso restrito à equipe", 403);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.auth.sub } });
    res.json(serializeStaffUser(user));
  })
);

const updateMeSchema = z.object({
  name: z.string().min(1).optional(),
  document: z.string().optional(),
  // Data URL (base64) — sem serviço de storage próprio ainda, o arquivo
  // fica guardado direto no banco. Limites generosos o bastante para uma
  // foto de perfil comprimida no navegador, ou um PDF/imagem de tabela de
  // preços de poucas páginas.
  avatarUrl: z.string().max(2_000_000).optional(),
  priceTableUrl: z.string().max(6_000_000).optional(),
  priceTableName: z.string().max(200).optional(),
});

authRouter.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (req.auth?.kind !== "staff") throw new AppError("Acesso restrito à equipe", 403);
    const data = updateMeSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.auth.sub },
      data: {
        ...data,
        priceTableUpdatedAt: data.priceTableUrl ? new Date() : undefined,
      },
    });
    res.json(serializeStaffUser(user));
  })
);

authRouter.post(
  "/patient/otp/verify",
  asyncHandler(async (req, res) => {
    const { phone, code } = otpVerifySchema.parse(req.body);
    const expected = process.env.PATIENT_OTP_DEV ?? "123456";
    if (code !== expected) throw new AppError("Código inválido", 401);

    let patient = await prisma.patient.findFirst({ where: { phone } });
    if (!patient) {
      // Paciente ainda não tem cadastro (nunca enviou lead nem foi
      // cadastrado manualmente) — cria um registro mínimo, que a
      // fisioterapeuta completa depois.
      patient = await prisma.patient.create({ data: { name: "Paciente", phone } });
    }

    const token = signPatientToken(patient.id);
    res.json({ token, patient });
  })
);
