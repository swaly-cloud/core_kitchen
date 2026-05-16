import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// --- Refresh token flow ---
// On 401, attempt one refresh and retry the original request.
let isRefreshing = false;
let pending: Array<(token: string | null) => void> = [];

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  pending.push(cb);
}

function onRefreshed(token: string | null) {
  pending.forEach((cb) => cb(token));
  pending = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    const url = original?.url ?? "";
    const isAuthEndpoint =
      url.includes("/api/auth/login") ||
      url.includes("/api/auth/register") ||
      url.includes("/api/auth/refresh");

    if (status !== 401 || !original || original._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    const { refreshToken, setAuth, clearAuth } = useAuthStore.getState();
    if (!refreshToken) {
      clearAuth();
      if (typeof window !== "undefined") window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (!token) {
            reject(error);
            return;
          }
          original.headers.set("Authorization", `Bearer ${token}`);
          original._retry = true;
          resolve(api.request(original as AxiosRequestConfig));
        });
      });
    }

    isRefreshing = true;
    try {
      const resp = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
      const data = resp.data as { accessToken: string; refreshToken: string; user: any };
      setAuth({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
      onRefreshed(data.accessToken);

      original.headers.set("Authorization", `Bearer ${data.accessToken}`);
      original._retry = true;
      return api.request(original as AxiosRequestConfig);
    } catch (refreshErr) {
      onRefreshed(null);
      clearAuth();
      if (typeof window !== "undefined") window.location.href = "/login";
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export function extractErrorMessage(err: unknown, fallback = "Une erreur est survenue"): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; fieldErrors?: { message: string }[] } | undefined;
    if (data?.fieldErrors?.length) return data.fieldErrors.map((f) => f.message).join(", ");
    if (data?.message) return data.message;
  }
  return fallback;
}
