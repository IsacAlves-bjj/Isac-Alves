import { useState } from "react";
import type { FormEvent } from "react";
import { ApiError } from "../api/client";
import type { TreatmentPlan } from "../api/types";
import { isoToLocalDateInput } from "../utils/format";

export interface TreatmentPlanFormValues {
  goal: string;
  careLine: string;
  startDate?: string;
  sessionsPlanned?: number;
}

// Criar um novo plano desativa o anterior no backend (mantém histórico) —
// por isso este formulário serve tanto para o primeiro plano quanto para
// revisar/atualizar a linha de cuidado ao longo do tratamento.
export function TreatmentPlanForm({
  initial,
  onSubmit,
}: {
  initial?: TreatmentPlan;
  onSubmit: (values: TreatmentPlanFormValues) => Promise<void>;
}) {
  const [goal, setGoal] = useState(initial?.goal ?? "");
  const [careLine, setCareLine] = useState(initial?.careLine ?? "");
  const [startDate, setStartDate] = useState(
    initial?.startDate ? isoToLocalDateInput(initial.startDate) : isoToLocalDateInput(new Date().toISOString())
  );
  const [sessionsPlanned, setSessionsPlanned] = useState(
    initial?.sessionsPlanned ? String(initial.sessionsPlanned) : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        goal,
        careLine,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        sessionsPlanned: sessionsPlanned ? Number(sessionsPlanned) : undefined,
      });
      if (!initial) {
        setGoal("");
        setCareLine("");
        setSessionsPlanned("");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao salvar plano de tratamento.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <label className="field">
        <span className="label">Objetivo do paciente *</span>
        <input className="input" required value={goal} onChange={(e) => setGoal(e.target.value)} />
      </label>

      <label className="field">
        <span className="label">Linha de cuidado *</span>
        <textarea className="input" rows={3} required value={careLine} onChange={(e) => setCareLine(e.target.value)} />
      </label>

      <div className="form-grid">
        <label className="field">
          <span className="label">Início do tratamento</span>
          <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label className="field field-narrow">
          <span className="label">Sessões previstas</span>
          <input
            className="input"
            type="number"
            min={1}
            value={sessionsPlanned}
            onChange={(e) => setSessionsPlanned(e.target.value)}
          />
        </label>
      </div>

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Salvando..." : initial ? "Atualizar plano" : "Iniciar plano de tratamento"}
      </button>
    </form>
  );
}
