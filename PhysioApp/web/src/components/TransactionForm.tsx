import { useState } from "react";
import type { FormEvent } from "react";
import { ApiError } from "../api/client";
import { BILLING_TYPE_LABELS } from "../api/types";
import type { BillingType, Patient, PriceListItem, Supplier, TransactionType } from "../api/types";
import { localDateTimeToISO } from "../utils/format";

export interface TransactionFormValues {
  type: TransactionType;
  description: string;
  amount: number;
  dueDate: string;
  patientId?: string;
  supplierId?: string;
  billingType?: BillingType;
}

const BILLING_TYPES = Object.keys(BILLING_TYPE_LABELS) as BillingType[];

// Conta a receber exige paciente; conta a pagar exige fornecedor (regra do
// backend em finance.routes.ts) — o formulário só mostra o seletor relevante.
export function TransactionForm({
  type,
  patients,
  suppliers,
  priceListItems,
  onSubmit,
}: {
  type: TransactionType;
  patients?: Patient[];
  suppliers?: Supplier[];
  priceListItems?: PriceListItem[];
  onSubmit: (values: TransactionFormValues) => Promise<void>;
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [patientId, setPatientId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [billingType, setBillingType] = useState<BillingType>("PARTICULAR");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Ao escolher o paciente, sugere o tipo de cobrança cadastrado nele —
  // a fisioterapeuta ainda pode trocar antes de lançar (ex.: consulta
  // avulsa particular de um paciente que normalmente usa convênio).
  function handlePatientChange(id: string) {
    setPatientId(id);
    const patient = patients?.find((p) => p.id === id);
    if (patient) setBillingType(patient.billingType);
  }

  // Selecionar um item da tabela de preços preenche descrição e valor —
  // continuam editáveis depois, é só um atalho para não digitar de novo.
  function handlePriceItemChange(id: string) {
    const item = priceListItems?.find((i) => i.id === id);
    if (!item) return;
    setDescription(item.name);
    setAmount(String(item.price));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (type === "RECEIVABLE" && !patientId) {
      setError("Selecione o paciente da conta a receber.");
      return;
    }
    if (type === "PAYABLE" && !supplierId) {
      setError("Selecione o fornecedor da conta a pagar.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        type,
        description,
        amount: Number(amount),
        dueDate: localDateTimeToISO(dueDate),
        patientId: type === "RECEIVABLE" ? patientId : undefined,
        supplierId: type === "PAYABLE" ? supplierId : undefined,
        billingType: type === "RECEIVABLE" ? billingType : undefined,
      });
      setDescription("");
      setAmount("");
      setDueDate("");
      setPatientId("");
      setSupplierId("");
      setBillingType("PARTICULAR");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao lançar conta.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      {type === "RECEIVABLE" ? (
        <div className="form-grid">
          <label className="field">
            <span className="label">Paciente *</span>
            <select className="input" required value={patientId} onChange={(e) => handlePatientChange(e.target.value)}>
              <option value="">Selecione...</option>
              {patients?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="label">Cobrança</span>
            <select className="input" value={billingType} onChange={(e) => setBillingType(e.target.value as BillingType)}>
              {BILLING_TYPES.map((bt) => (
                <option key={bt} value={bt}>
                  {BILLING_TYPE_LABELS[bt]}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <label className="field">
          <span className="label">Fornecedor *</span>
          <select className="input" required value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
            <option value="">Selecione...</option>
            {suppliers?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {type === "RECEIVABLE" && priceListItems && priceListItems.filter((i) => i.active).length > 0 && (
        <label className="field">
          <span className="label">Serviço (tabela de preços)</span>
          <select className="input" defaultValue="" onChange={(e) => handlePriceItemChange(e.target.value)}>
            <option value="">Preencher manualmente...</option>
            {priceListItems.filter((i) => i.active).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} — {item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="field">
        <span className="label">Descrição *</span>
        <input className="input" required value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>

      <div className="form-grid">
        <label className="field">
          <span className="label">Valor (R$) *</span>
          <input className="input" type="number" required min={0.01} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <label className="field">
          <span className="label">Vencimento *</span>
          <input className="input" type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
      </div>

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Salvando..." : "Lançar conta"}
      </button>
    </form>
  );
}
