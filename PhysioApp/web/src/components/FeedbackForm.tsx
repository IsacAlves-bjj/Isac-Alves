import { useState } from "react";
import type { FormEvent } from "react";
import { ApiError } from "../api/client";

export interface FeedbackFormValues {
  rating: number;
  comment?: string;
}

const RATING_OPTIONS = [1, 2, 3, 4, 5];

export function FeedbackForm({ onSubmit }: { onSubmit: (values: FeedbackFormValues) => Promise<void> }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ rating, comment: comment || undefined });
      setComment("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao registrar feedback.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}
      <label className="field">
        <span className="label">Satisfação relatada pelo paciente</span>
        <div className="badge-row">
          {RATING_OPTIONS.map((n) => (
            <button
              type="button"
              key={n}
              className={n === rating ? "chip chip-active" : "chip"}
              onClick={() => setRating(n)}
            >
              {n} {"★".repeat(n)}
            </button>
          ))}
        </div>
      </label>
      <label className="field">
        <span className="label">Comentário</span>
        <textarea className="input" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
      </label>
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Salvando..." : "Registrar feedback"}
      </button>
    </form>
  );
}
