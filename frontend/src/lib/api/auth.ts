import { api } from "./client";
import type { AuthResponse, User } from "@/types";

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>("/api/auth/register", payload).then((r) => r.data),

  login: (payload: LoginPayload) =>
    api.post<AuthResponse>("/api/auth/login", payload).then((r) => r.data),

  logout: (refreshToken: string) =>
    api.post<void>("/api/auth/logout", { refreshToken }).then((r) => r.data),

  me: () => api.get<User>("/api/users/me").then((r) => r.data),

  updateProfile: (payload: UpdateProfilePayload) =>
    api.patch<User>("/api/users/me", payload).then((r) => r.data),

  changePassword: (payload: ChangePasswordPayload) =>
    api.post<void>("/api/users/me/password", payload).then((r) => r.data),
};
