"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useRegister } from "@/hooks/useAuth";

const schema = z.object({
  firstName: z.string().min(1, "First name required").max(100),
  lastName: z.string().min(1, "Last name required").max(100),
  companyName: z.string().min(2, "Company name required").max(150),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "8 characters minimum")
    .regex(/[a-z]/, "At least one lowercase")
    .regex(/[A-Z]/, "At least one uppercase")
    .regex(/\d/, "At least one number")
    .regex(/[^a-zA-Z0-9]/, "At least one special character"),
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-forest-700 text-white p-12 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_30%_30%,white,transparent_60%)]"
        />
        <div className="relative flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm shadow-soft">
            ck
          </div>
          <span className="font-semibold text-lg tracking-tight">CoreKitchen</span>
        </div>
        <div className="relative max-w-md">
          <div className="text-2xs font-semibold uppercase tracking-eyebrow text-brand-300 mb-4">
            — Start your kitchen
          </div>
          <h2 className="text-3xl xl:text-4xl font-semibold leading-snug tracking-tight">
            Honest food costs.
            <br />
            Zero spreadsheet pain.
          </h2>
          <p className="mt-6 text-stone-300 leading-relaxed">
            CoreKitchen tracks every gram and every euro so you can focus on what
            matters: cooking.
          </p>
        </div>
        <div className="relative text-2xs uppercase tracking-eyebrow text-stone-400/60">
          14-day free trial · No credit card required
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 bg-cream-100">
        <div className="lg:hidden mb-8 flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm shadow-soft">
            ck
          </div>
          <span className="font-semibold text-lg tracking-tight text-stone-900">
            CoreKitchen
          </span>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="text-2xs font-semibold uppercase tracking-eyebrow text-stone-500 mb-3">
            New account
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 leading-tight">
            Start your <span className="text-brand-600">free trial</span>
          </h1>

          <form
            onSubmit={handleSubmit((values) => reg.mutate(values))}
            className="mt-8 space-y-4"
            noValidate
          >
            <div className="grid grid-cols-2 gap-3">
              <FormField id="firstName" label="First name" error={errors.firstName?.message}>
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  error={!!errors.firstName}
                  {...register("firstName")}
                />
              </FormField>
              <FormField id="lastName" label="Last name" error={errors.lastName?.message}>
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  error={!!errors.lastName}
                  {...register("lastName")}
                />
              </FormField>
            </div>

            <FormField id="companyName" label="Kitchen / Company" error={errors.companyName?.message}>
              <Input
                id="companyName"
                placeholder="Maison Renard"
                error={!!errors.companyName}
                {...register("companyName")}
              />
            </FormField>

            <FormField id="email" label="Work email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@kitchen.com"
                error={!!errors.email}
                {...register("email")}
              />
            </FormField>

            <FormField
              id="password"
              label="Password"
              error={errors.password?.message}
              hint="8+ chars, 1 uppercase, 1 number, 1 special char"
            >
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                error={!!errors.password}
                {...register("password")}
              />
            </FormField>

            <Button type="submit" size="lg" className="w-full mt-2" loading={reg.isPending}>
              Create my account
            </Button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-stone-900 font-medium underline underline-offset-4 hover:text-brand-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
