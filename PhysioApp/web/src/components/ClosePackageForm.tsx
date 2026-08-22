import { useState } from "react";
import type { FormEvent } from "react";
import { ApiError } from "../api/client";
import type { PriceListItem } from "../api/types";
import { isoToLocalDateInput } from "../utils/format";

export interface ClosePackageFormValues {
  goal: string;
  careLine: string;
  startDate?: string;
  sessionsPlanned: number;
  price?: number;
}

// Ação comercial de fechar um pacote de sessões: registra o plano de
// tratamento e, se um valor for informado, já lança a conta a receber —
// ver POST /patients/:id/close-package no backend.
export function ClosePackageForm({
  priceListItems,
  onSubmit,
}: {
  priceListItems?: PriceListItem[];
  onSubmit: (values: ClosePackageFormValues) => Promise<void>;
}) {
  const [goal, setGoal] = useState("");
  const [careLine, setCareLine] = useState("");
  const [startDate, setStartDate] = useState(isoToLocalDateInput(new Date().toISOString()));
  const [sessionsPlanned, setSessionsPlanned] = useState("8");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Selecionar um item da tabela de preços preenche o valor do pacote —
  // continua editável depois, é só um atalho.
  function handlePriceItemChange(id: string) {
    const item = priceListItems?.find((i) => i.id === id);
    if (item) setPrice(String(item.price));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        goal,
        careLine,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        sessionsPlanned: Number(sessionsPlanned),
        price: price ? Number(price) : undefined,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao fechar pacote.");
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

      {priceListItems && priceListItems.filter((i) => i.active).length > 0 && (
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

      <div className="form-grid">
        <label className="field">
          <span className="label">Início do tratamento</span>
          <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label className="field field-narrow">
          <span className="label">Sessões do pacote *</span>
          <input
            className="input"
            type="number"
            min={1}
            required
            value={sessionsPlanned}
            onChange={(e) => setSessionsPlanned(e.target.value)}
          />
        </label>
        <label className="field field-narrow">
          <span className="label">Valor do pacote (R$)</span>
          <input className="input" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
        </label>
      </div>
      <p className="muted small">
        Se um valor for informado, uma conta a receber é lançada automaticamente em Financeiro.
      </p>

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Fechando..." : "Fechar pacote"}
      </button>
    </form>
  );
}
