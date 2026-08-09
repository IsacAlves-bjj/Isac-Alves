import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, ApiError } from "../../api/client";
import type { Supplier } from "../../api/types";
import { LoadState } from "../../components/LoadState";
import { Modal } from "../../components/Modal";

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setSuppliers(await api.get<Supplier[]>("/finance/suppliers"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao carregar fornecedores.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="page-header page-header-actions">
        <p>Fornecedores para lançamento de contas a pagar.</p>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Novo fornecedor
        </button>
      </div>

      <LoadState loading={loading} error={error} onRetry={load} empty={suppliers.length === 0} emptyMessage="Nenhum fornecedor cadastrado.">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Telefone</th>
                <th>E-mail</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.category ?? "—"}</td>
                  <td>{s.phone ?? "—"}</td>
                  <td>{s.email ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LoadState>

      {showForm && (
        <Modal title="Novo fornecedor" onClose={() => setShowForm(false)}>
          <SupplierForm
            onSubmit={async (values) => {
              await api.post("/finance/suppliers", values);
              setShowForm(false);
              await load();
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function SupplierForm({
  onSubmit,
}: {
  onSubmit: (values: { name: string; category?: string; phone?: string; email?: string; notes?: string }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        name,
        category: category || undefined,
        phone: phone || undefined,
        email: email || undefined,
        notes: notes || undefined,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao cadastrar fornecedor.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}
      <label className="field">
        <span className="label">Nome *</span>
        <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <div className="form-grid">
        <label className="field">
          <span className="label">Categoria</span>
          <input
            className="input"
            placeholder="aluguel, material, equipamento..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="label">Telefone</span>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label className="field">
          <span className="label">E-mail</span>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
      </div>
      <label className="field">
        <span className="label">Observações</span>
        <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Salvando..." : "Cadastrar fornecedor"}
      </button>
    </form>
  );
}
