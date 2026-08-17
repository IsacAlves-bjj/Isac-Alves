import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth, requireStaff } from "../middleware/auth";

export const examRequestsRouter = Router();

examRequestsRouter.use(requireAuth, requireStaff);

const createSchema = z.object({
  patientId: z.string(),
  appointmentId: z.string().optional(),
  description: z.string().min(1),
});

examRequestsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);
    const examRequest = await prisma.examRequest.create({ data });
    res.status(201).json(examRequest);
  })
);

examRequestsRouter.get(
  "/patient/:patientId",
  asyncHandler(async (req, res) => {
    const examRequests = await prisma.examRequest.findMany({
      where: { patientId: req.params.patientId },
      orderBy: { requestedAt: "desc" },
    });
    res.json(examRequests);
  })
);

const receiveSchema = z.object({
  resultNotes: z.string().optional(),
});

// Marca um exame como recebido — a fisioterapeuta usa isto quando o
// paciente traz o resultado, com um resumo opcional do laudo.
examRequestsRouter.patch(
  "/:id/receive",
  asyncHandler(async (req, res) => {
    const { resultNotes } = receiveSchema.parse(req.body);
    const examRequest = await prisma.examRequest.update({
      where: { id: req.params.id },
      data: { status: "RECEBIDO", resultNotes, resultReceivedAt: new Date() },
    });
    res.json(examRequest);
  })
);
