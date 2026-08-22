import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth, requireStaff } from "../middleware/auth";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth, requireStaff);

dashboardRouter.get(
  "/summary",
  asyncHandler(async (_req, res) => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const in7Days = new Date(startOfDay);
    in7Days.setDate(in7Days.getDate() + 7);

    const [
      pendingLeads,
      attentionLeads,
      todayAppointments,
      openCashSession,
      upcomingReceivables,
      upcomingPayables,
    ] = await Promise.all([
      prisma.lead.count({ where: { status: { in: ["NOVO", "EM_REVISAO"] } } }),
      prisma.lead.count({ where: { priority: "ATENCAO_CLINICA", status: { not: "DESCARTADO" } } }),
      prisma.appointment.findMany({
        where: { startsAt: { gte: startOfDay, lt: endOfDay } },
        include: { patient: true },
        orderBy: { startsAt: "asc" },
      }),
      prisma.cashSession.findFirst({ where: { closedAt: null } }),
      prisma.transaction.findMany({
        where: { type: "RECEIVABLE", status: "PENDING", dueDate: { lte: in7Days } },
        include: { patient: true },
        orderBy: { dueDate: "asc" },
      }),
      prisma.transaction.findMany({
        where: { type: "PAYABLE", status: "PENDING", dueDate: { lte: in7Days } },
        include: { supplier: true },
        orderBy: { dueDate: "asc" },
      }),
    ]);

    res.json({
      pendingLeads,
      attentionLeads,
      todayAppointments,
      cashOpen: Boolean(openCashSession),
      cashSessionId: openCashSession?.id ?? null,
      upcomingReceivables,
      upcomingPayables,
      upcomingReceivablesTotal: upcomingReceivables.reduce((s, t) => s + t.amount, 0),
      upcomingPayablesTotal: upcomingPayables.reduce((s, t) => s + t.amount, 0),
    });
  })
);
