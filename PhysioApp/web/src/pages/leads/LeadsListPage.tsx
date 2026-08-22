import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import type { Lead, LeadStatus } from "../../api/types";
import { LoadState } from "../../components/LoadState";
import { LeadPriorityBadge, LeadStatusBadge } from "../../components/Badge";
import { formatDate } from "../../utils/format";

const STATUS_FILTERS: { value: LeadStatus | "TODOS"; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "NOVO", label: "Novos" },
  { value: "EM_REVISAO", label: "Em revisão" },
  { value: "AGENDADO", label: "Agendados" },
  { value: "DESCARTADO", label: "Descartados" },
];

export function LeadsListPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "TODOS">("TODOS");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const query = statusFilter === "TODOS" ? "" : `?status=${statusFilter}`;
      const data = await api.get<Lead[]>(`/leads${query}`);
      setLeads(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar leads.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  return (
    <div>
      <header className="page-header">
        <h1>Leads / Triagens</h1>
        <p>Pré-triagens recebidas pelo app, priorizadas por atenção clínica.</p>
      </header>

      <div className="filter-bar">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`chip${statusFilter === f.value ? " chip-active" : ""}`}
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <LoadState loading={loading} error={error} onRetry={load} empty={leads.length === 0} emptyMessage="Nenhum lead encontrado.">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Queixa</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Recebido em</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className={lead.priority === "ATENCAO_CLINICA" ? "row-danger" : undefined}>
                  <td>
                    <Link to={`/leads/${lead.id}`} className="table-link">
                      {lead.name}
                    </Link>
                    <div className="muted small">{lead.phone}</div>
                  </td>
                  <td>{lead.category.title}</td>
                  <td className="ellipsis">{lead.chiefComplaint ?? "—"}</td>
                  <td>
                    <LeadPriorityBadge priority={lead.priority} />
                  </td>
                  <td>
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td>{formatDate(lead.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LoadState>
    </div>
  );
}
