import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth, requireStaff } from "../middleware/auth";

// Encaminhamento do paciente a outro profissional/especialidade (ex.:
// ortopedista, nutricionista) — mesmo padrão de exam-requests, mas para
// referência externa em vez de exame.
export const referralsRouter = Router();

referralsRouter.use(requireAuth, requireStaff);

const createSchema = z.object({
  patientId: z.string(),
  specialty: z.string().min(1),
  reason: z.string().optional(),
});

referralsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);
    const referral = await prisma.referral.create({ data });
    res.status(201).json(referral);
  })
);

referralsRouter.get(
  "/patient/:patientId",
  asyncHandler(async (req, res) => {
    const referrals = await prisma.referral.findMany({
      where: { patientId: req.params.patientId },
      orderBy: { requestedAt: "desc" },
    });
    res.json(referrals);
  })
);

const completeSchema = z.object({
  notes: z.string().optional(),
});

referralsRouter.patch(
  "/:id/complete",
  asyncHandler(async (req, res) => {
    const { notes } = completeSchema.parse(req.body);
    const referral = await prisma.referral.update({
      where: { id: req.params.id },
      data: { status: "REALIZADO", notes },
    });
    res.json(referral);
  })
);
