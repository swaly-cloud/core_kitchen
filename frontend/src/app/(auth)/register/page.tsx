"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChefHat } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useRegister } from "@/hooks/useAuth";

const schema = z.object({
  firstName: z.string().min(1, "Prénom requis").max(100),
  lastName: z.string().min(1, "Nom requis").max(100),
  companyName: z.string().min(2, "Nom d'entreprise requis").max(150),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "8 caractères minimum")
    .regex(/[a-z]/, "Au moins une minuscule")
    .regex(/[A-Z]/, "Au moins une majuscule")
    .regex(/\d/, "Au moins un chiffre")
    .regex(/[^a-zA-Z0-9]/, "Au moins un caractère spécial"),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const reg = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto h-12 w-12 rounded-lg bg-brand-600 flex items-center justify-center mb-3">
          <ChefHat className="h-6 w-6 text-white" />
        </div>
        <CardTitle>Créer votre compte</CardTitle>
        <CardDescription>Démarrez avec CoreKitchen en quelques secondes</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((values) => reg.mutate(values))}
          className="space-y-4"
          noValidate
        >
          <div className="grid grid-cols-2 gap-3">
            <FormField id="firstName" label="Prénom" error={errors.firstName?.message}>
              <Input id="firstName" autoComplete="given-name" error={!!errors.firstName} {...register("firstName")} />
            </FormField>
            <FormField id="lastName" label="Nom" error={errors.lastName?.message}>
              <Input id="lastName" autoComplete="family-name" error={!!errors.lastName} {...register("lastName")} />
            </FormField>
          </div>

          <FormField id="companyName" label="Entreprise" error={errors.companyName?.message}>
            <Input id="companyName" placeholder="Ex: Bistro du Coin" error={!!errors.companyName} {...register("companyName")} />
          </FormField>

          <FormField id="email" label="Email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" placeholder="vous@exemple.com" error={!!errors.email} {...register("email")} />
          </FormField>

          <FormField
            id="password"
            label="Mot de passe"
            error={errors.password?.message}
            hint="8 caractères min., 1 majuscule, 1 chiffre, 1 caractère spécial"
          >
            <Input id="password" type="password" autoComplete="new-password" error={!!errors.password} {...register("password")} />
          </FormField>

          <Button type="submit" className="w-full" loading={reg.isPending}>
            Créer mon compte
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Déjà inscrit ?{" "}
          <Link href="/login" className="text-brand-700 font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
