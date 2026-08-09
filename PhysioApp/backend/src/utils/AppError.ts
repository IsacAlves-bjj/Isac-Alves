// Erro de aplicação com status HTTP, para o errorHandler central
// distinguir falha de negócio (4xx) de falha inesperada (5xx).
export class AppError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
