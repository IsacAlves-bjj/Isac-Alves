import { useState } from "react";
import type { FormEvent } from "react";
import { ApiError } from "../api/client";
import type { Patient } from "../api/types";
import { localDateTimeToISO } from "../utils/format";

export interface AppointmentFormValues {
  patientId: string;
  startsAt: string;
  endsAt: string;
  location?: string;
  notes?: string;
}

const LOCATIONS = ["Consultório", "Domiciliar", "Teleconsulta"];

// Usado tanto na Agenda (paciente escolhido em um <select>) quanto na ficha
// do paciente (paciente fixo, vindo da própria tela) — daí o patientId ser
// opcional: quando ausente, mostramos o seletor.
export function AppointmentForm({
  patients,
  fixedPatient,
  defaultStart,
  onSubmit,
  submitLabel = "Agendar",
}: {
  patients?: Patient[];
  fixedPatient?: Patient;
  defaultStart?: string;
  onSubmit: (values: AppointmentFormValues) => Promise<void>;
  submitLabel?: string;
}) {
  const [patientId, setPatientId] = useState(fixedPatient?.id ?? "");
  const [startsAt, setStartsAt] = useState(defaultStart ?? "");
  const [duration, setDuration] = useState(50);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!patientId) {
      setError("Selecione um paciente.");
      return;
    }
    if (!startsAt) {
      setError("Informe a data/hora do agendamento.");
      return;
    }
    setSubmitting(true);
    try {
      const start = new Date(startsAt);
      const end = new Date(start.getTime() + duration * 60_000);
      await onSubmit({
        patientId,
        startsAt: localDateTimeToISO(startsAt),
        endsAt: end.toISOString(),
        location: location || undefined,
        notes: notes || undefined,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao criar agendamento.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      {fixedPatient ? (
        <div className="field">
          <span className="label">Paciente</span>
          <div className="static-value">{fixedPatient.name}</div>
        </div>
      ) : (
        <label className="field">
          <span className="label">Paciente *</span>
          <select className="input" required value={patientId} onChange={(e) => setPatientId(e.target.value)}>
            <option value="">Selecione...</option>
            {patients?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="form-grid">
        <label className="field">
          <span className="label">Data e hora *</span>
          <input
            className="input"
            type="datetime-local"
            required
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="label">Duração (min)</span>
          <input
            className="input"
            type="number"
            min={15}
            step={5}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </label>
        <label className="field">
          <span className="label">Local</span>
          <select className="input" value={location} onChange={(e) => setLocation(e.target.value)}>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span className="label">Observações</span>
        <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}
