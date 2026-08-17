import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { AppError } from "../utils/AppError";
import { requireAuth, requireStaff } from "../middleware/auth";

export const financeRouter = Router();

financeRouter.use(requireAuth, requireStaff);

// --- Fornecedores -----------------------------------------------------

const supplierSchema = z.object({
  name: z.string().min(2),
  category: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  notes: z.string().optional(),
});

financeRouter.get(
  "/suppliers",
  asyncHandler(async (_req, res) => {
    res.json(await prisma.supplier.findMany({ orderBy: { name: "asc" } }));
  })
);

financeRouter.post(
  "/suppliers",
  asyncHandler(async (req, res) => {
    const data = supplierSchema.parse(req.body);
    res.status(201).json(await prisma.supplier.create({ data }));
  })
);

// --- Caixa (abertura/fechamento) --------------------------------------

const openCashSchema = z.object({ openingBalance: z.number().min(0) });

financeRouter.get(
  "/cash-sessions",
  asyncHandler(async (_req, res) => {
    const sessions = await prisma.cashSession.findMany({
      include: { transactions: true, openedBy: { select: { name: true } } },
      orderBy: { openedAt: "desc" },
    });
    res.json(sessions);
  })
);

financeRouter.get(
  "/cash-sessions/current",
  asyncHandler(async (_req, res) => {
    const session = await prisma.cashSession.findFirst({
      where: { closedAt: null },
      include: { transactions: true },
      orderBy: { openedAt: "desc" },
    });
    res.json(session);
  })
);

financeRouter.post(
  "/cash-sessions/open",
  asyncHandler(async (req, res) => {
    if (req.auth?.kind !== "staff") throw new AppError("Acesso restrito à equipe", 403);
    const existingOpen = await prisma.cashSession.findFirst({ where: { closedAt: null } });
    if (existingOpen) throw new AppError("Já existe um caixa aberto", 409);

    const { openingBalance } = openCashSchema.parse(req.body);
    const session = await prisma.cashSession.create({
      data: { openedById: req.auth.sub, openingBalance },
    });
    res.status(201).json(session);
  })
);

financeRouter.post(
  "/cash-sessions/:id/close",
  asyncHandler(async (req, res) => {
    const cashSession = await prisma.cashSession.findUnique({
      where: { id: req.params.id },
      include: { transactions: true },
    });
    if (!cashSession) throw new AppError("Sessão de caixa não encontrada", 404);
    if (cashSession.closedAt) throw new AppError("Sessão de caixa já fechada", 409);

    const paidIn = cashSession.transactions
      .filter((t) => t.type === "RECEIVABLE" && t.status === "PAID")
      .reduce((sum, t) => sum + t.amount, 0);
    const paidOut = cashSession.transactions
      .filter((t) => t.type === "PAYABLE" && t.status === "PAID")
      .reduce((sum, t) => sum + t.amount, 0);

    const closed = await prisma.cashSession.update({
      where: { id: req.params.id },
      data: {
        closedAt: new Date(),
        closingBalance: cashSession.openingBalance + paidIn - paidOut,
      },
    });
    res.json(closed);
  })
);

// --- Transações (contas a receber / pagar) -----------------------------

const transactionSchema = z.object({
  type: z.enum(["RECEIVABLE", "PAYABLE"]),
  description: z.string().min(1),
  amount: z.number().positive(),
  dueDate: z.string().datetime(),
  patientId: z.string().optional(),
  appointmentId: z.string().optional(),
  supplierId: z.string().optional(),
});

financeRouter.get(
  "/transactions",
  asyncHandler(async (req, res) => {
    const { type, status } = req.query as { type?: string; status?: string };
    const transactions = await prisma.transaction.findMany({
      where: {
        type: type as never,
        status: status as never,
      },
      include: { patient: true, supplier: true },
      orderBy: { dueDate: "asc" },
    });
    res.json(transactions);
  })
);

financeRouter.post(
  "/transactions",
  asyncHandler(async (req, res) => {
    const data = transactionSchema.parse(req.body);
    if (data.type === "RECEIVABLE" && !data.patientId) {
      throw new AppError("Conta a receber precisa de um paciente vinculado", 400);
    }
    if (data.type === "PAYABLE" && !data.supplierId) {
      throw new AppError("Conta a pagar precisa de um fornecedor vinculado", 400);
    }

    const transaction = await prisma.transaction.create({
      data: { ...data, dueDate: new Date(data.dueDate) },
    });
    res.status(201).json(transaction);
  })
);

const paySchema = z.object({
  paymentMethod: z.enum(["dinheiro", "pix", "cartao_credito", "cartao_debito", "transferencia"]),
  cashSessionId: z.string().optional(),
});

financeRouter.post(
  "/transactions/:id/pay",
  asyncHandler(async (req, res) => {
    const { paymentMethod, cashSessionId } = paySchema.parse(req.body);
    const transaction = await prisma.transaction.update({
      where: { id: req.params.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paymentMethod,
        cashSessionId,
      },
    });
    res.json(transaction);
  })
);

// --- Recibos ------------------------------------------------------------
// Um recibo só existe para uma conta a receber já paga. Emitir de novo
// retorna o mesmo recibo (mesma data de emissão) em vez de criar outro.

async function buildReceiptPayload(transactionId: string) {
  const receipt = await prisma.receipt.findUnique({
    where: { transactionId },
    include: {
      transaction: { include: { patient: true } },
    },
  });
  if (!receipt) return null;

  return {
    id: receipt.id,
    number: receipt.id.slice(-6).toUpperCase(),
    issuedAt: receipt.issuedAt,
    transaction: receipt.transaction,
  };
}

financeRouter.get(
  "/transactions/:id/receipt",
  asyncHandler(async (req, res) => {
    const payload = await buildReceiptPayload(req.params.id);
    if (!payload) throw new AppError("Recibo ainda não emitido para esta conta", 404);
    res.json(payload);
  })
);

financeRouter.post(
  "/transactions/:id/receipt",
  asyncHandler(async (req, res) => {
    const transaction = await prisma.transaction.findUnique({ where: { id: req.params.id } });
    if (!transaction) throw new AppError("Conta não encontrada", 404);
    if (transaction.type !== "RECEIVABLE") throw new AppError("Recibo só se aplica a contas a receber", 400);
    if (transaction.status !== "PAID") throw new AppError("Só é possível emitir recibo de uma conta já paga", 400);

    await prisma.receipt.upsert({
      where: { transactionId: transaction.id },
      update: {},
      create: { transactionId: transaction.id },
    });

    const payload = await buildReceiptPayload(transaction.id);
    res.status(201).json(payload);
  })
);
