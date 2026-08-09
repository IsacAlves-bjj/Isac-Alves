import { useEffect, useState } from "react";
import { api, ApiError } from "../../api/client";
import type { CashSession, Supplier, Transaction } from "../../api/types";
import { LoadState } from "../../components/LoadState";
import { TransactionForm } from "../../components/TransactionForm";
import type { TransactionFormValues } from "../../components/TransactionForm";
import { PayTransactionForm } from "../../components/PayTransactionForm";
import { Modal } from "../../components/Modal";
import { TransactionStatusBadge } from "../../components/Badge";
import { formatCurrency, formatDate } from "../../utils/format";
import type { PaymentMethod } from "../../api/types";

export function PayablesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [cashSessionId, setCashSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [txs, sups, current] = await Promise.all([
        api.get<Transaction[]>("/finance/transactions?type=PAYABLE"),
        api.get<Supplier[]>("/finance/suppliers"),
        api.get<CashSession | null>("/finance/cash-sessions/current"),
      ]);
      setTransactions(txs);
      setSuppliers(sups);
      setCashSessionId(current?.id ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar contas a pagar.");
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
        <p>Despesas com fornecedores.</p>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Lançar conta
        </button>
      </div>

      <LoadState loading={loading} error={error} onRetry={load} empty={transactions.length === 0} emptyMessage="Nenhuma conta a pagar lançada.">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Fornecedor</th>
                <th>Descrição</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.supplier?.name ?? "—"}</td>
                  <td>{t.description}</td>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LoadState>

      {suppliers.length === 0 && !loading && (
        <p className="muted small">Cadastre um fornecedor antes de lançar uma conta a pagar.</p>
      )}

      {showForm && (
        <Modal title="Nova conta a pagar" onClose={() => setShowForm(false)}>
          <TransactionForm type="PAYABLE" suppliers={suppliers} onSubmit={handleCreate} />
        </Modal>
      )}

      {payingId && (
        <Modal title="Registrar pagamento" onClose={() => setPayingId(null)}>
          <PayTransactionForm cashSessionId={cashSessionId} onSubmit={handlePay} />
        </Modal>
      )}
    </div>
  );
}
