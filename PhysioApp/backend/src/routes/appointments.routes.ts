import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { AppError } from "../utils/AppError";
import { requireAuth, requireStaff } from "../middleware/auth";

export const appointmentsRouter = Router();

// GET /appointments/me — usado pelo app do paciente (autenticado como
// paciente, não como equipe), por isso fica antes do requireStaff.
appointmentsRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (req.auth?.kind !== "patient") throw new AppError("Acesso restrito ao paciente", 403);
    const appointments = await prisma.appointment.findMany({
      where: { patientId: req.auth.sub },
      orderBy: { startsAt: "asc" },
    });
    res.json(appointments);
  })
);

appointmentsRouter.use(requireAuth, requireStaff);

const appointmentSchema = z.object({
  patientId: z.string(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

appointmentsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { from, to } = req.query as { from?: string; to?: string };
    const appointments = await prisma.appointment.findMany({
      where: {
        startsAt: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      include: { patient: true },
      orderBy: { startsAt: "asc" },
    });
    res.json(appointments);
  })
);

appointmentsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = appointmentSchema.parse(req.body);
    const appointment = await prisma.appointment.create({
      data: {
        patientId: data.patientId,
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt),
        location: data.location,
        notes: data.notes,
      },
    });
    res.status(201).json(appointment);
  })
);

const statusSchema = z.object({
  status: z.enum(["AGENDADO", "CONFIRMADO", "REALIZADO", "FALTOU", "CANCELADO"]),
});

appointmentsRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const { status } = statusSchema.parse(req.body);
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(appointment);
  })
);

// Dispara a confirmação do agendamento para o paciente. Hoje registra
// apenas o horário do envio (confirmationSentAt) e loga no console —
// TODO(integração futura): disparo real por SMS/WhatsApp, como o OTP
// em auth.routes.ts.
appointmentsRouter.post(
  "/:id/send-confirmation",
  asyncHandler(async (req, res) => {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: { patient: true },
    });
    if (!appointment) throw new AppError("Agendamento não encontrado", 404);

    console.log(
      `[Confirmação] Enviando para ${appointment.patient.name} (${appointment.patient.phone}) — sessão em ${appointment.startsAt.toISOString()}`
    );

    const updated = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { confirmationSentAt: new Date() },
    });
    res.json(updated);
  })
);
