import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";

// Rotas públicas de catálogo: o app do paciente carrega isto antes de
// mostrar as "caixinhas" e o questionário. Sem autenticação — é conteúdo
// não sensível (perguntas, não respostas).
export const triageRouter = Router();

triageRouter.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const categories = await prisma.triageCategory.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
    res.json(categories);
  })
);

triageRouter.get(
  "/questions",
  asyncHandler(async (req, res) => {
    const categoryKey = req.query.category as string | undefined;

    const orConditions = [
      { categoryId: null as string | null }, // perguntas gerais, sempre incluídas
      ...(categoryKey ? [{ category: { key: categoryKey } }] : []),
    ];

    const questions = await prisma.triageQuestion.findMany({
      where: { active: true, OR: orConditions },
      orderBy: [{ section: "asc" }, { order: "asc" }],
    });
    res.json(questions);
  })
);
