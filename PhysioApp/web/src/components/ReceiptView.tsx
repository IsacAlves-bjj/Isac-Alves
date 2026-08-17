import { useEffect, useState } from "react";
import { api, ApiError } from "../api/client";
import type { Receipt, StaffUser } from "../api/types";
import { LoadState } from "./LoadState";
import { formatCurrency, formatDate, formatDateTime } from "../utils/format";
import { PAYMENT_METHOD_LABELS } from "../api/types";

// Emite (ou recupera, se já existir) o recibo de uma conta a receber paga
// e mostra um layout pronto para impressão via window.print() — ver a
// regra @media print em index.css (.printable-area).
export function ReceiptView({ transactionId }: { transactionId: string }) {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [issuer, setIssuer] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [receiptData, me] = await Promise.all([
          api.post<Receipt>(`/finance/transactions/${transactionId}/receipt`),
          api.get<StaffUser>("/auth/me"),
        ]);
        setReceipt(receiptData);
        setIssuer(me);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Erro ao emitir recibo.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [transactionId]);

  return (
    <LoadState loading={loading} error={error}>
      {receipt && (
        <div>
          <div className="printable-area receipt">
            <header className="receipt-header">
              <strong>{issuer?.name ?? "Fisioterapeuta"}</strong>
              {issuer?.document && <span>{issuer.document}</span>}
            </header>
            <h2 style={{ marginTop: 16 }}>Recibo Nº {receipt.number}</h2>
            <p>
              Recebi de <strong>{receipt.transaction.patient?.name ?? "—"}</strong> a quantia de{" "}
              <strong>{formatCurrency(receipt.transaction.amount)}</strong> referente a{" "}
              <strong>{receipt.transaction.description}</strong>, pago via{" "}
              {receipt.transaction.paymentMethod ? PAYMENT_METHOD_LABELS[receipt.transaction.paymentMethod] : "—"}
              {receipt.transaction.paidAt ? ` em ${formatDate(receipt.transaction.paidAt)}` : ""}.
            </p>
            <p className="muted small" style={{ marginTop: 24 }}>
              Recibo emitido em {formatDateTime(receipt.issuedAt)}.
            </p>
          </div>

          <button type="button" className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => window.print()}>
            Imprimir / salvar como PDF
          </button>
        </div>
      )}
    </LoadState>
  );
}
