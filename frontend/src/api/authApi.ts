import axios from "axios";
import type { User } from "../types";
import { ApiError } from "../helpers/handleError";
import { API_URL, axiosJson } from "./request";

export type LoginPayload = {
  phone: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};

export async function login({ phone, password }: LoginPayload): Promise<LoginResponse> {
  const data = await axiosJson<LoginResponse>(() => axios.post(`${API_URL}/auth/login`, { phone, password }));
  if (!data.token) {
    throw new ApiError("Сервер не вернул токен");
  }
  return data;
}
