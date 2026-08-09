import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { AppError } from "../utils/AppError";
import { requireAuth, requireStaff } from "../middleware/auth";

export const clinicalRecordsRouter = Router();

clinicalRecordsRouter.use(requireAuth, requireStaff);

const recordSchema = z.object({
  patientId: z.string(),
  appointmentId: z.string(),
  subjective: z.string().min(1),
  objective: z.string().min(1),
  assessment: z.string().min(1),
  plan: z.string().min(1),
  painScore: z.number().min(0).max(10).optional(),
});

clinicalRecordsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = recordSchema.parse(req.body);
    if (req.auth?.kind !== "staff") throw new AppError("Acesso restrito à equipe", 403);

    const record = await prisma.clinicalRecord.create({
      data: { ...data, authorId: req.auth.sub },
    });

    await prisma.appointment.update({
      where: { id: data.appointmentId },
      data: { status: "REALIZADO" },
    });

    res.status(201).json(record);
  })
);

clinicalRecordsRouter.get(
  "/patient/:patientId",
  asyncHandler(async (req, res) => {
    const records = await prisma.clinicalRecord.findMany({
      where: { patientId: req.params.patientId },
      include: { author: { select: { name: true } }, appointment: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(records);
  })
);
