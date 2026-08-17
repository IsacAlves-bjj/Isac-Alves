import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import { api, ApiError } from "../api/client";
import type { StaffUser } from "../api/types";

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [document, setDocument] = useState(user?.document ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSaveDocument(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const updated = await api.patch<StaffUser>("/auth/me", { document: document || undefined });
      updateUser(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <header className="page-header">
        <h1>Configurações</h1>
        <p>Preferências da conta e do consultório.</p>
      </header>

      <section className="card">
        <h2>Conta</h2>
        <dl className="info-list">
          <div>
            <dt>Nome</dt>
            <dd>{user?.name}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{user?.email}</dd>
          </div>
          <div>
            <dt>Perfil</dt>
            <dd>{user?.role === "ADMIN" ? "Administradora" : "Fisioterapeuta"}</dd>
          </div>
        </dl>
      </section>

      <section className="card">
        <h2>Dados para recibo</h2>
        <p className="muted small" style={{ marginBottom: 12 }}>
          Seu CPF ou CNPJ aparece como emitente nos recibos gerados em Financeiro → Contas a
          receber.
        </p>
        <form className="form" onSubmit={handleSaveDocument}>
          {error && <div className="alert alert-error">{error}</div>}
          {saved && <div className="alert" style={{ background: "var(--success-bg)", color: "var(--success)" }}>Salvo.</div>}
          <label className="field field-narrow">
            <span className="label">CPF ou CNPJ</span>
            <input className="input" value={document} onChange={(e) => setDocument(e.target.value)} />
          </label>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Linhas de cuidado e categorias de triagem</h2>
        <p className="muted">
          A edição das categorias e perguntas de triagem, e das regras de sugestão de linha de
          cuidado (ver TRIAGEM.md §9.2), ainda não tem tela própria — hoje são mantidas
          diretamente no banco de dados pela equipe técnica. Fica como próximo passo natural
          desta tela.
        </p>
      </section>
    </div>
  );
}
