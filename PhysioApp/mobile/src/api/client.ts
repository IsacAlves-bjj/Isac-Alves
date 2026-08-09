/**
 * Base URL da API do PhysioApp.
 *
 * Em dev, o backend roda em http://localhost:3333 (ver
 * PhysioApp/docs/ARQUITETURA.md §6). Para apontar o app para outro
 * ambiente (ex.: dispositivo físico na mesma rede, ou staging), defina
 * a variável de ambiente pública do Expo `EXPO_PUBLIC_API_URL`
 * (ex.: `EXPO_PUBLIC_API_URL=http://192.168.0.10:3333 npx expo start`)
 * — não é necessário editar código.
 *
 * Atenção: em Android emulator/dispositivo físico, "localhost" aponta
 * para o próprio aparelho, não para o computador rodando o backend —
 * use o IP da máquina na rede local ou `10.0.2.2` (emulador Android).
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3333";

/** Erro de API tipado — carrega o status HTTP e a mensagem já em pt-BR vinda do backend. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /** Token JWT do paciente, quando a rota exige autenticação (ex.: /appointments/me). */
  token?: string;
}

interface ApiErrorBody {
  error?: string;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === "object" && value !== null && "error" in value;
}

/**
 * Wrapper único de chamada HTTP para toda a API. Centraliza montagem de
 * headers, serialização JSON e conversão de erro — nenhuma tela deve
 * chamar `fetch` diretamente, para manter tratamento de erro consistente.
 */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.",
      0
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload: unknown = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    const message = isApiErrorBody(payload) && payload.error ? payload.error : "Ocorreu um erro inesperado. Tente novamente.";
    throw new ApiError(message, response.status);
  }

  return payload as T;
}
