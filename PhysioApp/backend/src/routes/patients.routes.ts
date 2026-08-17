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
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  comorbidities: z.string().optional(),
  preferredLocation: z.enum(["Consultório", "Domiciliar", "Teleconsulta"]).optional(),
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
        referrals: { orderBy: { requestedAt: "desc" } },
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

// Desativa o plano ativo anterior (se houver) e cria um novo — reaproveitado
// tanto por POST /treatment-plan quanto por POST /close-package, que além
// do plano também fecha o lançamento financeiro do pacote.
async function createActiveTreatmentPlan(
  patientId: string,
  data: z.infer<typeof treatmentPlanSchema>
) {
  await prisma.treatmentPlan.updateMany({
    where: { patientId, active: true },
    data: { active: false },
  });

  return prisma.treatmentPlan.create({
    data: {
      patientId,
      goal: data.goal,
      careLine: data.careLine,
      sessionsPlanned: data.sessionsPlanned,
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
    },
  });
}

// Cria um novo plano de tratamento ativo para o paciente, desativando o
// anterior (se houver) — mantém o histórico em vez de sobrescrever.
patientsRouter.post(
  "/:id/treatment-plan",
  asyncHandler(async (req, res) => {
    const data = treatmentPlanSchema.parse(req.body);
    const plan = await createActiveTreatmentPlan(req.params.id, data);
    res.status(201).json(plan);
  })
);

const closePackageSchema = treatmentPlanSchema.extend({
  sessionsPlanned: z.number().int().positive(), // obrigatório ao fechar pacote
  price: z.number().positive().optional(), // se informado, já lança a conta a receber
});

// "Fechar pacote": registra o plano de tratamento (nº de sessões) e, se um
// valor for informado, já lança a conta a receber correspondente — a ação
// comercial de fechar um pacote com o paciente em um único passo.
patientsRouter.post(
  "/:id/close-package",
  asyncHandler(async (req, res) => {
    const data = closePackageSchema.parse(req.body);
    const plan = await createActiveTreatmentPlan(req.params.id, data);

    let transaction = null;
    if (data.price) {
      transaction = await prisma.transaction.create({
        data: {
          type: "RECEIVABLE",
          description: `Pacote ${data.sessionsPlanned} sessões`,
          amount: data.price,
          dueDate: plan.startDate ?? new Date(),
          patientId: req.params.id,
        },
      });
    }

    res.status(201).json({ plan, transaction });
  })
);
