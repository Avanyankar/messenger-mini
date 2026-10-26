export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function handleError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Не удалось выполнить запрос";
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}
