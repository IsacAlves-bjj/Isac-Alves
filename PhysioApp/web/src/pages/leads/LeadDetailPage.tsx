import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import type { Lead, LeadStatus, Patient } from "../../api/types";
import { LoadState } from "../../components/LoadState";
import { LeadPriorityBadge, LeadStatusBadge } from "../../components/Badge";
import { formatDateTime } from "../../utils/format";

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "NOVO", label: "Novo" },
  { value: "EM_REVISAO", label: "Em revisão" },
  { value: "AGENDADO", label: "Agendado" },
  { value: "DESCARTADO", label: "Descartado" },
];

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Lead>(`/leads/${id}`);
      setLead(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar o lead.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function changeStatus(status: LeadStatus) {
    if (!id) return;
    setBusy(true);
    setActionError(null);
    try {
      const updated = await api.patch<Lead>(`/leads/${id}/status`, { status });
      setLead((prev) => (prev ? { ...prev, status: updated.status } : prev));
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Erro ao mudar status.");
    } finally {
      setBusy(false);
    }
  }

  async function convertToPatient() {
    if (!id) return;
    setBusy(true);
    setActionError(null);
    try {
      const patient = await api.post<Patient>(`/leads/${id}/convert`);
      navigate(`/pacientes/${patient.id}`);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Erro ao converter lead em paciente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <header className="page-header">
        <Link to="/leads" className="back-link">
          ← Leads
        </Link>
        <h1>{lead ? lead.name : "Detalhe do lead"}</h1>
      </header>

      <LoadState loading={loading} error={error} onRetry={load}>
        {lead && (
          <div className="detail-grid">
            <div className="detail-main">
              <section className="card">
                <div className="card-title-row">
                  <h2>Resumo clínico automático</h2>
                  <div className="badge-row">
                    <LeadPriorityBadge priority={lead.priority} />
                    <LeadStatusBadge status={lead.status} />
                  </div>
                </div>
                <p>{lead.clinicalSummary ?? "Sem resumo automático disponível."}</p>
              </section>

              <section className="card">
                <h2>Sugestão de linha de cuidado</h2>
                <p>{lead.suggestedCare ?? "Sem sugestão automática — avaliar manualmente."}</p>
              </section>

              <section className="card">
                <h2>Respostas da triagem</h2>
                {!lead.answers || lead.answers.length === 0 ? (
                  <p className="muted">Sem respostas registradas.</p>
                ) : (
                  <dl className="qa-list">
                    {lead.answers.map((answer) => (
                      <div key={answer.id} className={answer.question.isRedFlag ? "qa-item qa-item-flag" : "qa-item"}>
                        <dt>
                          {answer.question.text}
                          {answer.question.isRedFlag && <span className="flag-tag">red flag</span>}
                        </dt>
                        <dd>{answer.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </section>
            </div>

            <div className="detail-side">
              <section className="card">
                <h2>Contato</h2>
                <dl className="info-list">
                  <div>
                    <dt>Telefone</dt>
                    <dd>{lead.phone}</dd>
                  </div>
                  <div>
                    <dt>E-mail</dt>
                    <dd>{lead.email ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Origem</dt>
                    <dd>{lead.source ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Categoria</dt>
                    <dd>{lead.category.title}</dd>
                  </div>
                  <div>
                    <dt>Dor (EVA)</dt>
                    <dd>{lead.painScore ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Objetivo</dt>
                    <dd>{lead.goal ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Cidade</dt>
                    <dd>{lead.city ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Preferência de horário</dt>
                    <dd>{lead.preferredTimes ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Recebido em</dt>
                    <dd>{formatDateTime(lead.createdAt)}</dd>
                  </div>
                </dl>
              </section>

              <section className="card">
                <h2>Ações</h2>
                {actionError && <div className="alert alert-error">{actionError}</div>}

                <label className="field">
                  <span className="label">Status</span>
                  <select
                    className="input"
                    value={lead.status}
                    disabled={busy}
                    onChange={(e) => changeStatus(e.target.value as LeadStatus)}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>

                {lead.patient ? (
                  <Link to={`/pacientes/${lead.patient.id}`} className="btn btn-primary btn-block">
                    Ver ficha do paciente
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    disabled={busy}
                    onClick={convertToPatient}
                  >
                    Converter em paciente
                  </button>
                )}
              </section>
            </div>
          </div>
        )}
      </LoadState>
    </div>
  );
}
