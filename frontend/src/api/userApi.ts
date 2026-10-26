import axios from "axios";
import type { User } from "../types";
import { API_URL, authHeaders, axiosJson, fetchJson } from "./request";

export async function getProfile(token: string): Promise<User> {
  return fetchJson<User>(`${API_URL}/users/me`, { headers: authHeaders(token) });
}

export type UpdateProfilePayload = Partial<Pick<User, "nickname" | "bio">>;

export async function updateProfile(token: string, { nickname, bio }: UpdateProfilePayload): Promise<User> {
  return axiosJson<User>(() =>
    axios.put(`${API_URL}/users/me`, { nickname, bio }, { headers: authHeaders(token) })
  );
}
