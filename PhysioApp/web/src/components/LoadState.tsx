import type { ReactNode } from "react";

// Envelope padrão para telas com fetch: mostra spinner, erro (com botão de
// tentar de novo) ou o conteúdo, evitando repetir esse if/else em cada página.
export function LoadState({
  loading,
  error,
  onRetry,
  empty,
  emptyMessage = "Nada por aqui ainda.",
  children,
}: {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  empty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
}) {
  if (loading) {
    return (
      <div className="state-box">
        <span className="spinner" aria-hidden="true" />
        <span>Carregando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-box state-box-error">
        <p>{error}</p>
        {onRetry && (
          <button type="button" className="btn btn-secondary" onClick={onRetry}>
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="state-box">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}
