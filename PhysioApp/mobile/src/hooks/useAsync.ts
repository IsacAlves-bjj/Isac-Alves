import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../api/client";

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Refaz a chamada, mantendo o mesmo `factory` — usado pelos botões "Tentar novamente". */
  refetch: () => void;
}

function toErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}

/**
 * Executa `factory` ao montar (e sempre que `deps` mudar), expondo
 * loading/error/data de forma consistente para as telas. Toda chamada de
 * API nas telas passa por aqui em vez de useEffect + try/catch repetido.
 */
export function useAsync<T>(factory: () => Promise<T>, deps: ReadonlyArray<unknown>): UseAsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const run = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    factory()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(toErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken]);

  useEffect(() => run(), [run]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  return { data, loading, error, refetch };
}
