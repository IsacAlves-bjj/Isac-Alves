import { useState } from "react";
import type { FormEvent } from "react";
import { ApiError } from "../api/client";
import { PAYMENT_METHOD_LABELS } from "../api/types";
import type { PaymentMethod } from "../api/types";

const METHODS = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[];

export function PayTransactionForm({
  cashSessionId,
  onSubmit,
}: {
  cashSessionId: string | null;
  onSubmit: (paymentMethod: PaymentMethod) => Promise<void>;
}) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(paymentMethod);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao registrar pagamento.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}
      {!cashSessionId && (
        <div className="alert alert-warning">
          Não há caixa aberto — o pagamento será registrado sem baixa em nenhuma sessão de caixa.
        </div>
      )}
      <label className="field">
        <span className="label">Forma de pagamento</span>
        <select className="input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {PAYMENT_METHOD_LABELS[m]}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Registrando..." : "Confirmar pagamento"}
      </button>
    </form>
  );
}
