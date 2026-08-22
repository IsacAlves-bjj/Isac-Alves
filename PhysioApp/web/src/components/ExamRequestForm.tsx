import { useState } from "react";
import type { FormEvent } from "react";
import { ApiError } from "../api/client";

export interface ExamRequestFormValues {
  description: string;
}

export function ExamRequestForm({ onSubmit }: { onSubmit: (values: ExamRequestFormValues) => Promise<void> }) {
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ description });
      setDescription("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao solicitar exame.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}
      <label className="field">
        <span className="label">Exame solicitado *</span>
        <input
          className="input"
          required
          placeholder="Ex.: Ressonância de joelho direito"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Solicitando..." : "Solicitar exame"}
      </button>
    </form>
  );
}
