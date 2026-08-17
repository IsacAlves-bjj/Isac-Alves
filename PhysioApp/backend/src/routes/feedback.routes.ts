import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth, requireStaff } from "../middleware/auth";

// Feedback de satisfação do paciente, registrado pela fisioterapeuta
// (ex.: relato verbal ao final de uma sessão) — não é dado clínico,
// por isso fica separado do prontuário (ClinicalRecord).
export const feedbackRouter = Router();

feedbackRouter.use(requireAuth, requireStaff);

const createSchema = z.object({
  patientId: z.string(),
  appointmentId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

feedbackRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);
    const feedback = await prisma.patientFeedback.create({ data });
    res.status(201).json(feedback);
  })
);

feedbackRouter.get(
  "/patient/:patientId",
  asyncHandler(async (req, res) => {
    const feedbacks = await prisma.patientFeedback.findMany({
      where: { patientId: req.params.patientId },
      orderBy: { createdAt: "desc" },
    });
    res.json(feedbacks);
  })
);
