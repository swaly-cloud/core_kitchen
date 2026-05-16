"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi, type ChangePasswordPayload, type LoginPayload, type RegisterPayload, type UpdateProfilePayload } from "@/lib/api/auth";
import { extractErrorMessage } from "@/lib/api/client";
import { useAuthStore } from "@/stores/authStore";

export function useMe() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["me"],
    queryFn: authApi.me,
    enabled: !!token,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setAuth({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
      toast.success(`Bienvenue ${data.user.firstName}`);
      router.push("/dashboard");
    },
    onError: (err) => toast.error(extractErrorMessage(err, "Échec de la connexion")),
  });
}

export function useRegister() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (data) => {
      setAuth({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
      toast.success(`Compte créé pour ${data.user.organizationName}`);
      router.push("/dashboard");
    },
    onError: (err) => toast.error(extractErrorMessage(err, "Échec de l'inscription")),
  });
}

export function useLogout() {
  const router = useRouter();
  const { refreshToken, clearAuth } = useAuthStore.getState();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        try {
          await authApi.logout(refreshToken);
        } catch {
          // ignore: even if server fails, clear local state
        }
      }
    },
    onSettled: () => {
      clearAuth();
      qc.clear();
      router.push("/login");
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authApi.updateProfile(payload),
    onSuccess: (user) => {
      setUser(user);
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Profil mis à jour");
    },
    onError: (err) => toast.error(extractErrorMessage(err, "Mise à jour impossible")),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authApi.changePassword(payload),
    onSuccess: () => toast.success("Mot de passe modifié"),
    onError: (err) => toast.error(extractErrorMessage(err, "Changement de mot de passe impossible")),
  });
}
