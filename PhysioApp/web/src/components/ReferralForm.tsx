import { useState } from "react";
import type { FormEvent } from "react";
import { ApiError } from "../api/client";

export interface ReferralFormValues {
  specialty: string;
  reason?: string;
}

export function ReferralForm({ onSubmit }: { onSubmit: (values: ReferralFormValues) => Promise<void> }) {
  const [specialty, setSpecialty] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ specialty, reason: reason || undefined });
      setSpecialty("");
      setReason("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao registrar encaminhamento.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}
      <label className="field">
        <span className="label">Encaminhar para *</span>
        <input
          className="input"
          required
          placeholder="Ex.: Ortopedista, Nutricionista"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
        />
      </label>
      <label className="field">
        <span className="label">Motivo</span>
        <textarea className="input" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
      </label>
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Registrando..." : "Registrar encaminhamento"}
      </button>
    </form>
  );
}
