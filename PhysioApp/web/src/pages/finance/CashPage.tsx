import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, ApiError } from "../../api/client";
import type { CashSession, MonthlyFinanceSummary } from "../../api/types";
import { LoadState } from "../../components/LoadState";
import { formatCurrency, formatDateTime } from "../../utils/format";

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

export function CashPage() {
  const [current, setCurrent] = useState<CashSession | null>(null);
  const [history, setHistory] = useState<CashSession[]>([]);
  const [monthSummary, setMonthSummary] = useState<MonthlyFinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [openingBalance, setOpeningBalance] = useState("0");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [cur, sessions, summary] = await Promise.all([
        api.get<CashSession | null>("/finance/cash-sessions/current"),
        api.get<CashSession[]>("/finance/cash-sessions"),
        api.get<MonthlyFinanceSummary>("/finance/summary/month"),
      ]);
      setCurrent(cur);
      setHistory(sessions);
      setMonthSummary(summary);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar o caixa.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleOpen(event: FormEvent) {
    event.preventDefault();
    setActionError(null);
    setBusy(true);
    try {
      await api.post("/finance/cash-sessions/open", { openingBalance: Number(openingBalance) });
      await load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Erro ao abrir caixa.");
    } finally {
      setBusy(false);
    }
  }

  async function handleClose() {
    if (!current) return;
    setActionError(null);
    setBusy(true);
    try {
      await api.post(`/finance/cash-sessions/${current.id}/close`);
      await load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Erro ao fechar caixa.");
    } finally {
      setBusy(false);
    }
  }

  const paidIn =
    current?.transactions?.filter((t) => t.type === "RECEIVABLE" && t.status === "PAID").reduce((s, t) => s + t.amount, 0) ?? 0;
  const paidOut =
    current?.transactions?.filter((t) => t.type === "PAYABLE" && t.status === "PAID").reduce((s, t) => s + t.amount, 0) ?? 0;

  return (
    <div>
      <LoadState loading={loading} error={error} onRetry={load}>
        {actionError && <div className="alert alert-error">{actionError}</div>}

        {monthSummary && (
          <section className="card">
            <h2>Resumo de {MONTH_LABEL_FORMATTER.format(new Date(`${monthSummary.month}-01T12:00:00`))}</h2>
            <div className="stat-grid stat-grid-money">
              <div className="stat-card stat-card-success">
                <span className="stat-value">{formatCurrency(monthSummary.revenue)}</span>
                <span className="stat-label">Faturamento do mês · {monthSummary.receivablesCount} recebimento(s)</span>
              </div>
              <div className="stat-card stat-card-danger">
                <span className="stat-value">{formatCurrency(monthSummary.expenses)}</span>
                <span className="stat-label">Despesas do mês · {monthSummary.payablesCount} pagamento(s)</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{formatCurrency(monthSummary.net)}</span>
                <span className="stat-label">Resultado do mês</span>
              </div>
            </div>
            <p className="muted small">
              Particular: {formatCurrency(monthSummary.revenueParticular)} · Convênio:{" "}
              {formatCurrency(monthSummary.revenueConvenio)}
            </p>
            <p className="muted small">
              Conta pelo dia em que a conta foi efetivamente paga, não pela data de vencimento.
            </p>
          </section>
        )}

        {current ? (
          <section className="card">
            <div className="card-title-row">
              <h2>Caixa aberto</h2>
              <span className="badge badge-success">Aberto desde {formatDateTime(current.openedAt)}</span>
            </div>
            <div className="stat-grid">
              <div className="stat-card">
                <span className="stat-value">{formatCurrency(current.openingBalance)}</span>
                <span className="stat-label">Saldo de abertura</span>
              </div>
              <div className="stat-card stat-card-success">
                <span className="stat-value">{formatCurrency(paidIn)}</span>
                <span className="stat-label">Recebido no período</span>
              </div>
              <div className="stat-card stat-card-danger">
                <span className="stat-value">{formatCurrency(paidOut)}</span>
                <span className="stat-label">Pago no período</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{formatCurrency(current.openingBalance + paidIn - paidOut)}</span>
                <span className="stat-label">Saldo projetado</span>
              </div>
            </div>
            <button type="button" className="btn btn-danger" disabled={busy} onClick={handleClose}>
              Fechar caixa
            </button>
          </section>
        ) : (
          <section className="card">
            <h2>Nenhum caixa aberto</h2>
            <form className="form" onSubmit={handleOpen}>
              <label className="field field-narrow">
                <span className="label">Saldo inicial</span>
                <input
                  className="input"
                  type="number"
                  min={0}
                  step="0.01"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                />
              </label>
              <button type="submit" className="btn btn-primary" disabled={busy}>
                Abrir caixa
              </button>
            </form>
          </section>
        )}

        <section className="card">
          <h2>Histórico de caixas</h2>
          {history.length === 0 ? (
            <p className="muted">Nenhum caixa registrado ainda.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Aberto em</th>
                    <th>Fechado em</th>
                    <th>Saldo inicial</th>
                    <th>Saldo final</th>
                    <th>Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((session) => (
                    <tr key={session.id}>
                      <td>{formatDateTime(session.openedAt)}</td>
                      <td>{session.closedAt ? formatDateTime(session.closedAt) : "—"}</td>
                      <td>{formatCurrency(session.openingBalance)}</td>
                      <td>{session.closingBalance !== null ? formatCurrency(session.closingBalance) : "—"}</td>
                      <td>{session.openedBy?.name ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </LoadState>
    </div>
  );
}
