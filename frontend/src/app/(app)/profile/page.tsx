"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useAuthStore } from "@/stores/authStore";
import { useChangePassword, useUpdateProfile } from "@/hooks/useAuth";

const profileSchema = z.object({
  firstName: z.string().min(1, "Prénom requis").max(100),
  lastName: z.string().min(1, "Nom requis").max(100),
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z
      .string()
      .min(8, "8 caractères minimum")
      .regex(/[a-z]/, "Au moins une minuscule")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/\d/, "Au moins un chiffre")
      .regex(/[^a-zA-Z0-9]/, "Au moins un caractère spécial"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas",
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user?.firstName ?? "", lastName: user?.lastName ?? "" },
  });

  useEffect(() => {
    if (user) profileForm.reset({ firstName: user.firstName, lastName: user.lastName });
  }, [user, profileForm]);

  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mon profil</h1>
        <p className="text-zinc-500 mt-1">Gérez vos informations et votre mot de passe.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
          <CardDescription>Visible par les autres membres de votre entreprise.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={profileForm.handleSubmit((v) => updateProfile.mutate(v))}
            className="space-y-4"
            noValidate
          >
            <div className="grid grid-cols-2 gap-3">
              <FormField id="firstName" label="Prénom" error={profileForm.formState.errors.firstName?.message}>
                <Input id="firstName" error={!!profileForm.formState.errors.firstName} {...profileForm.register("firstName")} />
              </FormField>
              <FormField id="lastName" label="Nom" error={profileForm.formState.errors.lastName?.message}>
                <Input id="lastName" error={!!profileForm.formState.errors.lastName} {...profileForm.register("lastName")} />
              </FormField>
            </div>

            <FormField id="email" label="Email">
              <Input id="email" value={user?.email ?? ""} disabled />
            </FormField>

            <Button type="submit" loading={updateProfile.isPending}>
              Mettre à jour
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mot de passe</CardTitle>
          <CardDescription>Modifiez votre mot de passe régulièrement.</CardDescription>
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
            <FormField id="oldPassword" label="Mot de passe actuel" error={passwordForm.formState.errors.oldPassword?.message}>
              <Input id="oldPassword" type="password" autoComplete="current-password" error={!!passwordForm.formState.errors.oldPassword} {...passwordForm.register("oldPassword")} />
            </FormField>
            <FormField
              id="newPassword"
              label="Nouveau mot de passe"
              error={passwordForm.formState.errors.newPassword?.message}
              hint="8 caractères min., 1 majuscule, 1 chiffre, 1 caractère spécial"
            >
              <Input id="newPassword" type="password" autoComplete="new-password" error={!!passwordForm.formState.errors.newPassword} {...passwordForm.register("newPassword")} />
            </FormField>
            <FormField id="confirmPassword" label="Confirmation" error={passwordForm.formState.errors.confirmPassword?.message}>
              <Input id="confirmPassword" type="password" autoComplete="new-password" error={!!passwordForm.formState.errors.confirmPassword} {...passwordForm.register("confirmPassword")} />
            </FormField>

            <Button type="submit" loading={changePassword.isPending}>
              Changer le mot de passe
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
