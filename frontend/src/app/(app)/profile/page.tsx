"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useAuthStore } from "@/stores/authStore";
import { useChangePassword, useUpdateProfile } from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name required").max(100),
  lastName: z.string().min(1, "Last name required").max(100),
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password required"),
    newPassword: z
      .string()
      .min(8, "8 characters minimum")
      .regex(/[a-z]/, "At least one lowercase")
      .regex(/[A-Z]/, "At least one uppercase")
      .regex(/\d/, "At least one number")
      .regex(/[^a-zA-Z0-9]/, "At least one special character"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
    },
  });

  useEffect(() => {
    if (user)
      profileForm.reset({ firstName: user.firstName, lastName: user.lastName });
  }, [user, profileForm]);

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="text-2xs font-semibold uppercase tracking-eyebrow text-stone-500">
          Account
        </div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
          Profile
        </h1>
      </div>

      {user && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-brand-500 text-white flex items-center justify-center text-lg font-semibold">
            {getInitials(user.firstName, user.lastName)}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-stone-900">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-stone-500 truncate">{user.email}</div>
            <div className="text-2xs uppercase tracking-eyebrow text-stone-400 mt-1">
              {user.role.toLowerCase()} · {user.organizationName}
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Information</CardTitle>
          <CardDescription>
            Visible to other members of your kitchen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={profileForm.handleSubmit((v) => updateProfile.mutate(v))}
            className="space-y-4"
            noValidate
          >
            <div className="grid grid-cols-2 gap-3">
              <FormField
                id="firstName"
                label="First name"
                error={profileForm.formState.errors.firstName?.message}
              >
                <Input
                  id="firstName"
                  error={!!profileForm.formState.errors.firstName}
                  {...profileForm.register("firstName")}
                />
              </FormField>
              <FormField
                id="lastName"
                label="Last name"
                error={profileForm.formState.errors.lastName?.message}
              >
                <Input
                  id="lastName"
                  error={!!profileForm.formState.errors.lastName}
                  {...profileForm.register("lastName")}
                />
              </FormField>
            </div>

            <FormField id="email" label="Email">
              <Input id="email" value={user?.email ?? ""} disabled />
            </FormField>

            <Button type="submit" loading={updateProfile.isPending}>
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Update your password regularly.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={passwordForm.handleSubmit((v) =>
              changePassword.mutate(
                { oldPassword: v.oldPassword, newPassword: v.newPassword },
                { onSuccess: () => passwordForm.reset() }
              )
            )}
            className="space-y-4"
            noValidate
          >
            <FormField
              id="oldPassword"
              label="Current password"
              error={passwordForm.formState.errors.oldPassword?.message}
            >
              <Input
                id="oldPassword"
                type="password"
                autoComplete="current-password"
                error={!!passwordForm.formState.errors.oldPassword}
                {...passwordForm.register("oldPassword")}
              />
            </FormField>
            <FormField
              id="newPassword"
              label="New password"
              error={passwordForm.formState.errors.newPassword?.message}
              hint="8+ chars, 1 uppercase, 1 number, 1 special char"
            >
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                error={!!passwordForm.formState.errors.newPassword}
                {...passwordForm.register("newPassword")}
              />
            </FormField>
            <FormField
              id="confirmPassword"
              label="Confirm new password"
              error={passwordForm.formState.errors.confirmPassword?.message}
            >
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                error={!!passwordForm.formState.errors.confirmPassword}
                {...passwordForm.register("confirmPassword")}
              />
            </FormField>

            <Button type="submit" loading={changePassword.isPending}>
              Change password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
