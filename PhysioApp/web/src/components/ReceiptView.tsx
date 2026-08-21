import { useEffect, useState } from "react";
import { api, ApiError } from "../api/client";
import type { Receipt, StaffUser } from "../api/types";
import { LoadState } from "./LoadState";
import { formatCurrency, formatDate, formatDateTime } from "../utils/format";
import { valorPorExtenso } from "../utils/valorExtenso";
import { PAYMENT_METHOD_LABELS } from "../api/types";

// Emite (ou recupera, se já existir) o recibo de uma conta a receber paga e
// mostra um layout formal, pronto para impressão via window.print() — ver a
// regra @media print em index.css (.printable-area). Valor por extenso é
// convenção tradicional em recibos formais brasileiros.
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
          <div className="printable-area receipt receipt-formal">
            <header className="receipt-formal-header">
              <div>
                <strong className="receipt-formal-issuer">{issuer?.name ?? "Fisioterapeuta"}</strong>
                {issuer?.document && <div className="muted small">CPF/CNPJ: {issuer.document}</div>}
              </div>
              <div className="receipt-formal-box">
                <span className="receipt-formal-box-label">Recibo nº</span>
                <span className="receipt-formal-box-value">{receipt.number}</span>
              </div>
            </header>

            <div className="receipt-formal-value">
              <span>Valor</span>
              <strong>{formatCurrency(receipt.transaction.amount)}</strong>
            </div>

            <p className="receipt-formal-body">
              Recebi de <strong>{receipt.transaction.patient?.name ?? "—"}</strong>
              {receipt.transaction.patient?.document ? `, CPF ${receipt.transaction.patient.document},` : ""} a
              quantia de <strong>{formatCurrency(receipt.transaction.amount)}</strong> (
              <em>{valorPorExtenso(receipt.transaction.amount)}</em>), referente a{" "}
              <strong>{receipt.transaction.description}</strong>, pago via{" "}
              {receipt.transaction.paymentMethod ? PAYMENT_METHOD_LABELS[receipt.transaction.paymentMethod] : "—"}
              {receipt.transaction.paidAt ? ` em ${formatDate(receipt.transaction.paidAt)}` : ""}. Para clareza e
              validade, firmo o presente recibo.
            </p>

            <div className="receipt-formal-signature">
              <div className="receipt-formal-signature-line" />
              <strong>{issuer?.name ?? "Fisioterapeuta"}</strong>
              {issuer?.document && <span className="muted small">{issuer.document}</span>}
            </div>

            <p className="muted small receipt-formal-footer">
              Recibo emitido em {formatDateTime(receipt.issuedAt)} pelo PhysioApp.
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
