import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { AppError } from "../utils/AppError";
import { requireAuth, requireStaff } from "../middleware/auth";

export const patientsRouter = Router();

patientsRouter.use(requireAuth, requireStaff);

const patientSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional(),
  birthDate: z.string().datetime().optional(),
  document: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

patientsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const search = req.query.search as string | undefined;
    const patients = await prisma.patient.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { phone: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { name: "asc" },
    });
    res.json(patients);
  })
);

patientsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = patientSchema.parse(req.body);
    const patient = await prisma.patient.create({
      data: { ...data, birthDate: data.birthDate ? new Date(data.birthDate) : undefined },
    });
    res.status(201).json(patient);
  })
);

patientsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        appointments: { orderBy: { startsAt: "desc" } },
        clinicalRecords: { orderBy: { createdAt: "desc" } },
        treatmentPlans: { orderBy: { createdAt: "desc" } },
        transactions: { orderBy: { dueDate: "desc" } },
        lead: true,
      },
    });
    if (!patient) throw new AppError("Paciente não encontrado", 404);
    res.json(patient);
  })
);

patientsRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = patientSchema.partial().parse(req.body);
    const patient = await prisma.patient.update({
      where: { id: req.params.id },
      data: { ...data, birthDate: data.birthDate ? new Date(data.birthDate) : undefined },
    });
    res.json(patient);
  })
);
