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

// --- Tabela de preços padrão -------------------------------------------
// Lista de serviços/pacotes com valor de referência, usada para preencher
// rápido o valor ao lançar conta a receber ou fechar pacote (ver
// PriceListItem no schema — não é vinculada à transação em si).

const priceListItemSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  active: z.boolean().optional(),
});

financeRouter.get(
  "/price-list",
  asyncHandler(async (_req, res) => {
    res.json(await prisma.priceListItem.findMany({ orderBy: { name: "asc" } }));
  })
);

financeRouter.post(
  "/price-list",
  asyncHandler(async (req, res) => {
    const data = priceListItemSchema.parse(req.body);
    res.status(201).json(await prisma.priceListItem.create({ data }));
  })
);

financeRouter.patch(
  "/price-list/:id",
  asyncHandler(async (req, res) => {
    const data = priceListItemSchema.partial().parse(req.body);
    res.json(await prisma.priceListItem.update({ where: { id: req.params.id }, data }));
  })
);

financeRouter.delete(
  "/price-list/:id",
  asyncHandler(async (req, res) => {
    await prisma.priceListItem.delete({ where: { id: req.params.id } });
    res.status(204).end();
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
  billingType: z.enum(["PARTICULAR", "CONVENIO"]).optional(), // só RECEIVABLE
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

    // Se não vier explícito, herda o tipo de cobrança padrão do paciente —
    // mas fica registrado no lançamento, não recalculado depois, para o
    // histórico não mudar se o paciente trocar de convênio.
    let billingType = data.billingType;
    if (data.type === "RECEIVABLE" && !billingType && data.patientId) {
      const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
      billingType = (patient?.billingType as "PARTICULAR" | "CONVENIO" | undefined) ?? "PARTICULAR";
    }

    const transaction = await prisma.transaction.create({
      data: { ...data, billingType, dueDate: new Date(data.dueDate) },
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

    try {
      await prisma.receipt.upsert({
        where: { transactionId: transaction.id },
        update: {},
        create: { transactionId: transaction.id },
      });
    } catch (err) {
      // P2002 (unique constraint) pode acontecer mesmo dentro de um
      // upsert sob concorrência real (ex.: StrictMode do React chamando o
      // efeito duas vezes, ou duplo clique) — outra requisição já criou o
      // recibo entre o SELECT e o INSERT deste upsert. Não é erro de
      // verdade: o recibo existe, é só buscar e devolver.
      const isUniqueConstraintError =
        typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "P2002";
      if (!isUniqueConstraintError) throw err;
    }

    const payload = await buildReceiptPayload(transaction.id);
    res.status(201).json(payload);
  })
);

// --- Resumo do mês (faturamento e despesas) -----------------------------
// Contabiliza pela data de pagamento (paidAt), não pela data de vencimento
// — é o que efetivamente entrou/saiu do caixa no mês, não o que estava
// previsto. ?month=YYYY-MM para consultar um mês específico; sem o
// parâmetro, usa o mês corrente.

financeRouter.get(
  "/summary/month",
  asyncHandler(async (req, res) => {
    const monthParam = req.query.month as string | undefined;
    const reference = monthParam ? new Date(`${monthParam}-01T00:00:00.000Z`) : new Date();
    if (isNaN(reference.getTime())) throw new AppError("Mês inválido, use o formato YYYY-MM", 400);

    const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
    const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 1);

    const [receivablesPaid, payablesPaid] = await Promise.all([
      prisma.transaction.findMany({
        where: { type: "RECEIVABLE", status: "PAID", paidAt: { gte: start, lt: end } },
      }),
      prisma.transaction.findMany({
        where: { type: "PAYABLE", status: "PAID", paidAt: { gte: start, lt: end } },
      }),
    ]);

    const revenue = receivablesPaid.reduce((sum, t) => sum + t.amount, 0);
    const expenses = payablesPaid.reduce((sum, t) => sum + t.amount, 0);
    const revenueParticular = receivablesPaid
      .filter((t) => t.billingType !== "CONVENIO")
      .reduce((sum, t) => sum + t.amount, 0);
    const revenueConvenio = receivablesPaid
      .filter((t) => t.billingType === "CONVENIO")
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      month: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`,
      revenue,
      expenses,
      net: revenue - expenses,
      receivablesCount: receivablesPaid.length,
      payablesCount: payablesPaid.length,
      revenueParticular,
      revenueConvenio,
    });
  })
);

// --- Exportação de planilha (para o contador) ----------------------------
// Lista todas as contas (receber + pagar) com vencimento no mês, uma linha
// por lançamento — o contador decide o que fazer com pendentes vs pagos,
// por isso não filtra por status como o resumo do mês (que só soma pagos).

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "Pix",
  cartao_credito: "Cartão de crédito",
  cartao_debito: "Cartão de débito",
  transferencia: "Transferência",
};

const BILLING_TYPE_LABELS: Record<string, string> = {
  PARTICULAR: "Particular",
  CONVENIO: "Convênio",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  OVERDUE: "Vencido",
  CANCELLED: "Cancelado",
};

function csvField(value: string): string {
  if (/[",\n;]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function formatDateBR(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

financeRouter.get(
  "/export/month",
  asyncHandler(async (req, res) => {
    const monthParam = req.query.month as string | undefined;
    const reference = monthParam ? new Date(`${monthParam}-01T00:00:00.000Z`) : new Date();
    if (isNaN(reference.getTime())) throw new AppError("Mês inválido, use o formato YYYY-MM", 400);

    const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
    const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 1);
    const monthLabel = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;

    const transactions = await prisma.transaction.findMany({
      where: { dueDate: { gte: start, lt: end } },
      include: { patient: true, supplier: true },
      orderBy: { dueDate: "asc" },
    });

    const header = [
      "Data de vencimento",
      "Tipo",
      "Descrição",
      "Paciente/Fornecedor",
      "Cobrança",
      "Forma de pagamento",
      "Status",
      "Data de pagamento",
      "Valor (R$)",
    ];

    const rows = transactions.map((t) =>
      [
        formatDateBR(t.dueDate),
        t.type === "RECEIVABLE" ? "Receita" : "Despesa",
        t.description,
        t.patient?.name ?? t.supplier?.name ?? "",
        t.billingType ? BILLING_TYPE_LABELS[t.billingType] ?? t.billingType : "",
        t.paymentMethod ? PAYMENT_METHOD_LABELS[t.paymentMethod] ?? t.paymentMethod : "",
        STATUS_LABELS[t.status] ?? t.status,
        formatDateBR(t.paidAt),
        t.amount.toFixed(2).replace(".", ","),
      ].map(csvField)
    );

    // BOM UTF-8 no início — sem isso o Excel abre acentos/ç quebrados.
    const csv = "﻿" + [header, ...rows].map((line) => line.join(";")).join("\r\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="physioapp-financeiro-${monthLabel}.csv"`);
    res.send(csv);
  })
);
