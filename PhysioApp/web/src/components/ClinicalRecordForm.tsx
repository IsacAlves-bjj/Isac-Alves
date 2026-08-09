import { useState } from "react";
import type { FormEvent } from "react";
import { ApiError } from "../api/client";
import type { Appointment } from "../api/types";
import { formatDateTime } from "../utils/format";

export interface ClinicalRecordFormValues {
  appointmentId: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  painScore?: number;
}

// Evolução SOAP: só faz sentido vincular a um agendamento que ainda não
// tem prontuário registrado (appointmentId é @unique no ClinicalRecord).
export function ClinicalRecordForm({
  availableAppointments,
  onSubmit,
}: {
  availableAppointments: Appointment[];
  onSubmit: (values: ClinicalRecordFormValues) => Promise<void>;
}) {
  const [appointmentId, setAppointmentId] = useState("");
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [painScore, setPainScore] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!appointmentId) {
      setError("Selecione o agendamento correspondente a esta evolução.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        appointmentId,
        subjective,
        objective,
        assessment,
        plan,
        painScore: painScore ? Number(painScore) : undefined,
      });
      setAppointmentId("");
      setSubjective("");
      setObjective("");
      setAssessment("");
      setPlan("");
      setPainScore("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao salvar evolução.");
    } finally {
      setSubmitting(false);
    }
  }

  if (availableAppointments.length === 0) {
    return (
      <p className="muted">
        Não há agendamentos sem evolução registrada. Crie um novo agendamento na Agenda para
        registrar uma nova sessão.
      </p>
    );
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <label className="field">
        <span className="label">Agendamento *</span>
        <select className="input" required value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)}>
          <option value="">Selecione...</option>
          {availableAppointments.map((appt) => (
            <option key={appt.id} value={appt.id}>
              {formatDateTime(appt.startsAt)}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="label">S — Subjetivo (relato do paciente) *</span>
        <textarea className="input" required rows={2} value={subjective} onChange={(e) => setSubjective(e.target.value)} />
      </label>

      <label className="field">
        <span className="label">O — Objetivo (achados do exame físico) *</span>
        <textarea className="input" required rows={2} value={objective} onChange={(e) => setObjective(e.target.value)} />
      </label>

      <label className="field">
        <span className="label">A — Avaliação (evolução do quadro) *</span>
        <textarea className="input" required rows={2} value={assessment} onChange={(e) => setAssessment(e.target.value)} />
      </label>

      <label className="field">
        <span className="label">P — Plano (conduta para próxima sessão) *</span>
        <textarea className="input" required rows={2} value={plan} onChange={(e) => setPlan(e.target.value)} />
      </label>

      <label className="field field-narrow">
        <span className="label">Dor hoje (0-10)</span>
        <input
          className="input"
          type="number"
          min={0}
          max={10}
          value={painScore}
          onChange={(e) => setPainScore(e.target.value)}
        />
      </label>

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Salvando..." : "Registrar evolução"}
      </button>
    </form>
  );
}
