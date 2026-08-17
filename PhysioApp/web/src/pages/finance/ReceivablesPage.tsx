import { useEffect, useState } from "react";
import { api, ApiError } from "../../api/client";
import type { CashSession, Patient, Transaction } from "../../api/types";
import { LoadState } from "../../components/LoadState";
import { TransactionForm } from "../../components/TransactionForm";
import type { TransactionFormValues } from "../../components/TransactionForm";
import { PayTransactionForm } from "../../components/PayTransactionForm";
import { ReceiptView } from "../../components/ReceiptView";
import { Modal } from "../../components/Modal";
import { Badge, TransactionStatusBadge } from "../../components/Badge";
import { formatCurrency, formatDate } from "../../utils/format";
import { BILLING_TYPE_LABELS } from "../../api/types";
import type { PaymentMethod } from "../../api/types";

export function ReceivablesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [cashSessionId, setCashSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [txs, pts, current] = await Promise.all([
        api.get<Transaction[]>("/finance/transactions?type=RECEIVABLE"),
        api.get<Patient[]>("/patients"),
        api.get<CashSession | null>("/finance/cash-sessions/current"),
      ]);
      setTransactions(txs);
      setPatients(pts);
      setCashSessionId(current?.id ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar contas a receber.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(values: TransactionFormValues) {
    await api.post("/finance/transactions", values);
    setShowForm(false);
    await load();
  }

  async function handlePay(paymentMethod: PaymentMethod) {
    if (!payingId) return;
    await api.post(`/finance/transactions/${payingId}/pay`, {
      paymentMethod,
      cashSessionId: cashSessionId ?? undefined,
    });
    setPayingId(null);
    await load();
  }

  return (
    <div>
      <div className="page-header page-header-actions">
        <p>Valores a receber de pacientes.</p>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Lançar conta
        </button>
      </div>

      <LoadState loading={loading} error={error} onRetry={load} empty={transactions.length === 0} emptyMessage="Nenhuma conta a receber lançada.">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Descrição</th>
                <th>Cobrança</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.patient?.name ?? "—"}</td>
                  <td>{t.description}</td>
                  <td>
                    {t.billingType && (
                      <Badge tone={t.billingType === "CONVENIO" ? "info" : "neutral"}>
                        {BILLING_TYPE_LABELS[t.billingType]}
                      </Badge>
                    )}
                  </td>
                  <td>{formatDate(t.dueDate)}</td>
                  <td>{formatCurrency(t.amount)}</td>
                  <td>
                    <TransactionStatusBadge status={t.status} />
                  </td>
                  <td>
                    {t.status === "PENDING" && (
                      <button type="button" className="btn btn-secondary btn-small" onClick={() => setPayingId(t.id)}>
                        Marcar como pago
                      </button>
                    )}
                    {t.status === "PAID" && (
                      <button type="button" className="btn btn-secondary btn-small" onClick={() => setReceiptId(t.id)}>
                        Emitir recibo
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LoadState>

      {showForm && (
        <Modal title="Nova conta a receber" onClose={() => setShowForm(false)}>
          <TransactionForm type="RECEIVABLE" patients={patients} onSubmit={handleCreate} />
        </Modal>
      )}

      {payingId && (
        <Modal title="Registrar pagamento" onClose={() => setPayingId(null)}>
          <PayTransactionForm cashSessionId={cashSessionId} onSubmit={handlePay} />
        </Modal>
      )}

      {receiptId && (
        <Modal title="Recibo" onClose={() => setReceiptId(null)}>
          <ReceiptView transactionId={receiptId} />
        </Modal>
      )}
    </div>
  );
}
