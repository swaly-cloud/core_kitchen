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
import { useLogin } from "@/hooks/useAuth";

const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const login = useLogin();
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
        <CardTitle>Connexion</CardTitle>
        <CardDescription>Accédez à votre espace CoreKitchen</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((values) => login.mutate(values))}
          className="space-y-4"
          noValidate
        >
          <FormField id="email" label="Email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="vous@exemple.com"
              error={!!errors.email}
              {...register("email")}
            />
          </FormField>

          <FormField id="password" label="Mot de passe" error={errors.password?.message}>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={!!errors.password}
              {...register("password")}
            />
          </FormField>

          <Button type="submit" className="w-full" loading={login.isPending}>
            Se connecter
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-brand-700 font-medium hover:underline">
            Créer un compte
          </Link>
        </p>

        <div className="mt-6 p-3 bg-zinc-50 rounded-md text-xs text-zinc-500 border border-zinc-200">
          <strong className="text-zinc-700">Démo :</strong> admin@demo.com / Demo1234!
        </div>
      </CardContent>
    </Card>
  );
}
