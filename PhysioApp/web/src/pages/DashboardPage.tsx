import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../api/client";
import type { DashboardSummary } from "../api/types";
import { LoadState } from "../components/LoadState";
import { AppointmentStatusBadge } from "../components/Badge";
import { formatCurrency, formatDate, formatTime } from "../utils/format";

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<DashboardSummary>("/dashboard/summary");
      setSummary(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar o dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Visão geral do consultório hoje, {formatDate(new Date().toISOString())}.</p>
      </header>

      <LoadState loading={loading} error={error} onRetry={load}>
        {summary && (
          <>
            <div className="stat-grid">
              <Link to="/leads" className="stat-card">
                <span className="stat-value">{summary.pendingLeads}</span>
                <span className="stat-label">Leads pendentes</span>
              </Link>
              <Link to="/leads" className="stat-card stat-card-danger">
                <span className="stat-value">{summary.attentionLeads}</span>
                <span className="stat-label">Atenção clínica</span>
              </Link>
              <Link to="/agenda" className="stat-card">
                <span className="stat-value">{summary.todayAppointments.length}</span>
                <span className="stat-label">Agendamentos hoje</span>
              </Link>
              <Link to="/financeiro/caixa" className={`stat-card ${summary.cashOpen ? "stat-card-success" : "stat-card-warning"}`}>
                <span className="stat-value">{summary.cashOpen ? "Aberto" : "Fechado"}</span>
                <span className="stat-label">Caixa</span>
              </Link>
            </div>

            <div className="stat-grid stat-grid-money">
              <Link to="/financeiro/receber" className="stat-card stat-card-success">
                <span className="stat-value">{formatCurrency(summary.upcomingReceivablesTotal)}</span>
                <span className="stat-label">A receber (7 dias) · {summary.upcomingReceivables.length} contas</span>
              </Link>
              <Link to="/financeiro/pagar" className="stat-card stat-card-danger">
                <span className="stat-value">{formatCurrency(summary.upcomingPayablesTotal)}</span>
                <span className="stat-label">A pagar (7 dias) · {summary.upcomingPayables.length} contas</span>
              </Link>
            </div>

            <div className="panel-grid">
              <section className="card">
                <h2>Agenda de hoje</h2>
                {summary.todayAppointments.length === 0 ? (
                  <p className="muted">Nenhum agendamento para hoje.</p>
                ) : (
                  <ul className="simple-list">
                    {summary.todayAppointments.map((appt) => (
                      <li key={appt.id}>
                        <span className="simple-list-time">{formatTime(appt.startsAt)}</span>
                        <span className="simple-list-main">{appt.patient?.name ?? "Paciente"}</span>
                        <AppointmentStatusBadge status={appt.status} />
                      </li>
                    ))}
                  </ul>
                )}
                <Link to="/agenda" className="card-link">
                  Ver agenda completa →
                </Link>
              </section>

              <section className="card">
                <h2>Contas a receber (próx. 7 dias)</h2>
                {summary.upcomingReceivables.length === 0 ? (
                  <p className="muted">Nenhuma conta a vencer.</p>
                ) : (
                  <ul className="simple-list">
                    {summary.upcomingReceivables.slice(0, 6).map((t) => (
                      <li key={t.id}>
                        <span className="simple-list-time">{formatDate(t.dueDate)}</span>
                        <span className="simple-list-main">{t.patient?.name ?? t.description}</span>
                        <span>{formatCurrency(t.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link to="/financeiro/receber" className="card-link">
                  Ver contas a receber →
                </Link>
              </section>

              <section className="card">
                <h2>Contas a pagar (próx. 7 dias)</h2>
                {summary.upcomingPayables.length === 0 ? (
                  <p className="muted">Nenhuma conta a vencer.</p>
                ) : (
                  <ul className="simple-list">
                    {summary.upcomingPayables.slice(0, 6).map((t) => (
                      <li key={t.id}>
                        <span className="simple-list-time">{formatDate(t.dueDate)}</span>
                        <span className="simple-list-main">{t.supplier?.name ?? t.description}</span>
                        <span>{formatCurrency(t.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link to="/financeiro/pagar" className="card-link">
                  Ver contas a pagar →
                </Link>
              </section>
            </div>
          </>
        )}
      </LoadState>
    </div>
  );
}
