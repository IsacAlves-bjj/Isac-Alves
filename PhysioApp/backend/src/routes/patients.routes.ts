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
        examRequests: { orderBy: { requestedAt: "desc" } },
        feedbacks: { orderBy: { createdAt: "desc" } },
        lead: true,
      },
    });
    if (!patient) throw new AppError("Paciente não encontrado", 404);

    // Número de sessões: previstas (do plano ativo) vs realizadas (contagem
    // de evoluções registradas) — calculado aqui para não duplicar essa
    // lógica em cada tela do painel.
    const activePlan = patient.treatmentPlans.find((p) => p.active) ?? patient.treatmentPlans[0] ?? null;
    const sessionsCompleted = patient.clinicalRecords.length;

    res.json({
      ...patient,
      sessionsSummary: {
        planned: activePlan?.sessionsPlanned ?? null,
        completed: sessionsCompleted,
        startDate: activePlan?.startDate ?? null,
      },
    });
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

const treatmentPlanSchema = z.object({
  goal: z.string().min(1),
  careLine: z.string().min(1),
  startDate: z.string().datetime().optional(),
  sessionsPlanned: z.number().int().positive().optional(),
});

// Cria um novo plano de tratamento ativo para o paciente, desativando o
// anterior (se houver) — mantém o histórico em vez de sobrescrever.
patientsRouter.post(
  "/:id/treatment-plan",
  asyncHandler(async (req, res) => {
    const data = treatmentPlanSchema.parse(req.body);

    await prisma.treatmentPlan.updateMany({
      where: { patientId: req.params.id, active: true },
      data: { active: false },
    });

    const plan = await prisma.treatmentPlan.create({
      data: {
        patientId: req.params.id,
        goal: data.goal,
        careLine: data.careLine,
        sessionsPlanned: data.sessionsPlanned,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
      },
    });
    res.status(201).json(plan);
  })
);
