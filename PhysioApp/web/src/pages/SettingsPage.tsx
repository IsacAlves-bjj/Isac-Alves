import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import { api, ApiError } from "../api/client";
import type { StaffUser } from "../api/types";
import { Avatar } from "../components/Avatar";
import { formatDateTime } from "../utils/format";

const AVATAR_MAX_SIZE = 320; // px — evita salvar fotos gigantes como texto no banco
const PRICE_TABLE_MAX_BYTES = 4_000_000; // margem sob o limite de 6MB do backend (base64 infla ~33%)

// Tabela de preços aceita PDF ou imagem — sem resize (perderia texto de um
// PDF), só um teto de tamanho antes de virar data URL, com a mesma
// justificativa de storage do avatar (ver backend/src/routes/auth.routes.ts).
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > PRICE_TABLE_MAX_BYTES) {
      reject(new Error("Arquivo muito grande (máx. 4 MB). Tente compactar ou reduzir a resolução."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

// Redimensiona a imagem no navegador antes de enviar, para não guardar um
// arquivo de câmera de vários MB direto como texto no banco (sem serviço de
// storage próprio ainda, ver backend/src/routes/auth.routes.ts).
function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Arquivo de imagem inválido."));
      img.onload = () => {
        const scale = Math.min(1, AVATAR_MAX_SIZE / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Não foi possível processar a imagem."));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [document, setDocument] = useState(user?.document ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingPriceTable, setUploadingPriceTable] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const priceTableInputRef = useRef<HTMLInputElement>(null);

  async function handleSaveProfile(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const updated = await api.patch<StaffUser>("/auth/me", {
        name: name || undefined,
        document: document || undefined,
      });
      updateUser(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploadingPhoto(true);
    try {
      const avatarUrl = await resizeImageToDataUrl(file);
      const updated = await api.patch<StaffUser>("/auth/me", { avatarUrl });
      updateUser(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Erro ao enviar foto.");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handlePriceTableChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploadingPriceTable(true);
    try {
      const priceTableUrl = await fileToDataUrl(file);
      const updated = await api.patch<StaffUser>("/auth/me", { priceTableUrl, priceTableName: file.name });
      updateUser(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Erro ao enviar tabela de preços.");
    } finally {
      setUploadingPriceTable(false);
      if (priceTableInputRef.current) priceTableInputRef.current.value = "";
    }
  }

  return (
    <div>
      <header className="page-header">
        <h1>Configurações</h1>
        <p>Preferências da conta e do consultório.</p>
      </header>

      <section className="card">
        <h2>Perfil</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <Avatar name={user?.name} avatarUrl={user?.avatarUrl} size={64} />
          <div>
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? "Enviando..." : user?.avatarUrl ? "Trocar foto" : "Adicionar foto"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhotoChange}
            />
            <p className="muted small" style={{ marginTop: 6 }}>
              Aparece no painel e nos recibos. Prefira uma foto quadrada, formal e bem iluminada.
            </p>
          </div>
        </div>

        <form className="form" onSubmit={handleSaveProfile}>
          {error && <div className="alert alert-error">{error}</div>}
          {saved && (
            <div className="alert" style={{ background: "var(--success-bg)", color: "var(--success)" }}>
              Salvo.
            </div>
          )}
          <div className="form-grid">
            <label className="field">
              <span className="label">Nome</span>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="field">
              <span className="label">E-mail</span>
              <input className="input" value={user?.email ?? ""} disabled />
            </label>
            <label className="field field-narrow">
              <span className="label">CPF ou CNPJ</span>
              <input className="input" value={document} onChange={(e) => setDocument(e.target.value)} />
            </label>
          </div>
          <p className="muted small">O CPF/CNPJ aparece como emitente nos recibos em Financeiro → Contas a receber.</p>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Tabela de preços</h2>
        <p className="muted">
          Envie um PDF ou imagem com os valores de consulta e pacotes, para consulta rápida na hora
          de negociar com o paciente. Fica salva só neste painel — não é enviada automaticamente a
          ninguém.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12 }}>
          <div>
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={() => priceTableInputRef.current?.click()}
              disabled={uploadingPriceTable}
            >
              {uploadingPriceTable ? "Enviando..." : user?.priceTableUrl ? "Substituir arquivo" : "Enviar arquivo"}
            </button>
            <input
              ref={priceTableInputRef}
              type="file"
              accept="application/pdf,image/*"
              style={{ display: "none" }}
              onChange={handlePriceTableChange}
            />
            {user?.priceTableUrl && (
              <p className="muted small" style={{ marginTop: 6 }}>
                <a href={user.priceTableUrl} target="_blank" rel="noreferrer">
                  {user.priceTableName ?? "Ver arquivo atual"}
                </a>
                {user.priceTableUpdatedAt && <> · atualizado em {formatDateTime(user.priceTableUpdatedAt)}</>}
              </p>
            )}
          </div>
        </div>
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
