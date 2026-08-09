import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { AppError } from "../utils/AppError";
import { requireAuth, requireStaff } from "../middleware/auth";
import {
  buildClinicalSummary,
  computePriority,
  suggestCareLine,
} from "../utils/treatmentSuggestion";

export const leadsRouter = Router();

const answerSchema = z.object({
  questionId: z.string(),
  value: z.string(),
});

const createLeadSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional(),
  source: z.string().optional(),
  categoryKey: z.string(),
  chiefComplaint: z.string().optional(),
  painScore: z.number().min(0).max(10).optional(),
  goal: z.string().optional(),
  city: z.string().optional(),
  preferredTimes: z.string().optional(),
  answers: z.array(answerSchema).default([]),
});

// POST /leads — endpoint público consumido pelo app do paciente ao final
// da triagem (a "caixinha"). Não exige autenticação: é o primeiro contato.
leadsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = createLeadSchema.parse(req.body);

    const category = await prisma.triageCategory.findUnique({
      where: { key: data.categoryKey },
    });
    if (!category) throw new AppError("Categoria de triagem inválida", 400);

    const questionIds = data.answers.map((a) => a.questionId);
    const questions = questionIds.length
      ? await prisma.triageQuestion.findMany({ where: { id: { in: questionIds } } })
      : [];
    const hasRedFlag = questions.some((q) => {
      if (!q.isRedFlag) return false;
      const answer = data.answers.find((a) => a.questionId === q.id);
      return answer?.value?.toLowerCase() === "sim" || answer?.value?.toLowerCase() === "true";
    });

    const isOtherOrIncomplete = category.key === "outro" || !data.chiefComplaint;

    const suggestionInput = {
      categoryTitle: category.title,
      categoryKey: category.key,
      chiefComplaint: data.chiefComplaint ?? null,
      painScore: data.painScore ?? null,
      hasRedFlag,
      isOtherOrIncomplete,
    };

    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        source: data.source,
        categoryId: category.id,
        chiefComplaint: data.chiefComplaint,
        painScore: data.painScore,
        goal: data.goal,
        city: data.city,
        preferredTimes: data.preferredTimes,
        clinicalSummary: buildClinicalSummary(suggestionInput),
        suggestedCare: suggestCareLine(suggestionInput),
        priority: computePriority(hasRedFlag, isOtherOrIncomplete),
        answers: {
          create: data.answers.map((a) => ({
            questionId: a.questionId,
            value: a.value,
          })),
        },
      },
      include: { category: true, answers: { include: { question: true } } },
    });

    res.status(201).json(lead);
  })
);

// Todas as rotas abaixo são do painel (equipe autenticada).
leadsRouter.use(requireAuth, requireStaff);

leadsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;
    const leads = await prisma.lead.findMany({
      where: status ? { status: status as never } : undefined,
      include: { category: true },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
    res.json(leads);
  })
);

leadsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: { category: true, answers: { include: { question: true } }, patient: true },
    });
    if (!lead) throw new AppError("Lead não encontrado", 404);
    res.json(lead);
  })
);

const updateStatusSchema = z.object({
  status: z.enum(["NOVO", "EM_REVISAO", "AGENDADO", "DESCARTADO"]),
});

leadsRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const { status } = updateStatusSchema.parse(req.body);
    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(lead);
  })
);

// Converte um lead em paciente definitivo (mantém o vínculo para
// histórico). Idempotente: se já existe paciente vinculado, retorna ele.
leadsRouter.post(
  "/:id/convert",
  asyncHandler(async (req, res) => {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: { patient: true },
    });
    if (!lead) throw new AppError("Lead não encontrado", 404);
    if (lead.patient) {
      return res.json(lead.patient);
    }

    const patient = await prisma.patient.create({
      data: {
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        leadId: lead.id,
        notes: lead.clinicalSummary,
      },
    });

    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: "AGENDADO" },
    });

    if (lead.suggestedCare) {
      await prisma.treatmentPlan.create({
        data: {
          patientId: patient.id,
          goal: lead.goal ?? "Definir com o paciente na avaliação",
          careLine: lead.suggestedCare,
        },
      });
    }

    res.status(201).json(patient);
  })
);
