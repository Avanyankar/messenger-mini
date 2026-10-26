import axios from "axios";
import type { Message } from "../types";
import { ApiError } from "../helpers/handleError";
import { API_URL, authHeaders, axiosJson, fetchJson } from "./request";

export async function getMessages(token: string): Promise<Message[]> {
  const data = await fetchJson<Message[]>(`${API_URL}/messages`, { headers: authHeaders(token) });
  if (!Array.isArray(data)) {
    throw new ApiError("Сервер вернул историю в неожиданном формате");
  }
  return data;
}

export async function sendMessage(token: string, text: string): Promise<Message> {
  return axiosJson<Message>(() =>
    axios.post(`${API_URL}/messages`, { text }, { headers: authHeaders(token) })
  );
}
