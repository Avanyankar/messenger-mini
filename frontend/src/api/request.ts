import axios from "axios";
import { ApiError } from "../helpers/handleError";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const NETWORK_ERROR = "Нет соединения с сервером";
const EMPTY_RESPONSE = "Пустой ответ сервера";
const INVALID_JSON = "Некорректный JSON в ответе сервера";

export function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}

function statusMessage(status: number, serverMessage?: string) {
  if (serverMessage) return serverMessage;
  if (status === 401) return "Нет доступа: войдите снова";
  return `Ошибка сервера (${status})`;
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new ApiError(NETWORK_ERROR);
  }

  const text = await response.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (response.ok) throw new ApiError(INVALID_JSON, response.status);
    }
  }

  if (!response.ok) {
    throw new ApiError(statusMessage(response.status, data?.message), response.status);
  }

  if (data === null) {
    throw new ApiError(EMPTY_RESPONSE, response.status);
  }

  return data as T;
}

export async function axiosJson<T>(request: () => Promise<{ data: unknown; status: number }>): Promise<T> {
  try {
    const { data, status } = await request();
    if (data === null || data === undefined || data === "") {
      throw new ApiError(EMPTY_RESPONSE, status);
    }
    if (typeof data !== "object") {
      throw new ApiError(INVALID_JSON, status);
    }
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (axios.isAxiosError(error)) {
      if (!error.response) throw new ApiError(NETWORK_ERROR);
      const { status, data } = error.response;
      throw new ApiError(statusMessage(status, (data as any)?.message), status);
    }
    throw error;
  }
}
