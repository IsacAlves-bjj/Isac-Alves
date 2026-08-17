import { useState } from "react";
import type { FormEvent } from "react";
import { ApiError } from "../api/client";
import type { Patient } from "../api/types";
import { isoToLocalDateInput } from "../utils/format";

export interface PatientFormValues {
  name: string;
  phone: string;
  email?: string;
  birthDate?: string;
  document?: string;
  address?: string;
  notes?: string;
  weight?: number;
  height?: number;
  comorbidities?: string;
  preferredLocation?: "Consultório" | "Domiciliar" | "Teleconsulta";
}

const LOCATIONS = ["Consultório", "Domiciliar", "Teleconsulta"] as const;

// Formulário reaproveitado no cadastro (PatientsListPage → novo) e na edição
// da ficha (PatientDetailPage) — mesmos campos, muda só o submit.
export function PatientForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Patient;
  submitLabel: string;
  onSubmit: (values: PatientFormValues) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [birthDate, setBirthDate] = useState(initial?.birthDate ? isoToLocalDateInput(initial.birthDate) : "");
  const [document, setDocument] = useState(initial?.document ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [weight, setWeight] = useState(initial?.weight != null ? String(initial.weight) : "");
  const [height, setHeight] = useState(initial?.height != null ? String(initial.height) : "");
  const [comorbidities, setComorbidities] = useState(initial?.comorbidities ?? "");
  const [preferredLocation, setPreferredLocation] = useState(initial?.preferredLocation ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        name,
        phone,
        email: email || undefined,
        birthDate: birthDate ? new Date(birthDate).toISOString() : undefined,
        document: document || undefined,
        address: address || undefined,
        notes: notes || undefined,
        weight: weight ? Number(weight) : undefined,
        height: height ? Number(height) : undefined,
        comorbidities: comorbidities || undefined,
        preferredLocation: (preferredLocation as PatientFormValues["preferredLocation"]) || undefined,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao salvar paciente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-grid">
        <label className="field">
          <span className="label">Nome completo *</span>
          <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          <span className="label">Telefone/WhatsApp *</span>
          <input className="input" required value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label className="field">
          <span className="label">E-mail</span>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field">
          <span className="label">Data de nascimento</span>
          <input className="input" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        </label>
        <label className="field">
          <span className="label">CPF</span>
          <input className="input" value={document} onChange={(e) => setDocument(e.target.value)} />
        </label>
        <label className="field">
          <span className="label">Endereço</span>
          <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
        <label className="field field-narrow">
          <span className="label">Peso (kg)</span>
          <input className="input" type="number" step="0.1" min="0" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </label>
        <label className="field field-narrow">
          <span className="label">Altura (cm)</span>
          <input className="input" type="number" step="1" min="0" value={height} onChange={(e) => setHeight(e.target.value)} />
        </label>
        <label className="field">
          <span className="label">Atendimento preferido</span>
          <select className="input" value={preferredLocation} onChange={(e) => setPreferredLocation(e.target.value)}>
            <option value="">Sem preferência</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span className="label">Comorbidades</span>
        <input className="input" placeholder="Ex.: Diabetes, hipertensão" value={comorbidities} onChange={(e) => setComorbidities(e.target.value)} />
      </label>

      <label className="field">
        <span className="label">Observações</span>
        <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}
