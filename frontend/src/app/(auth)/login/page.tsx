"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useLogin } from "@/hooks/useAuth";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@demo.com", password: "" },
  });

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left — brand / testimonial */}
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
            — Pastry Lab Marais
          </div>
          <blockquote className="text-3xl xl:text-4xl font-semibold leading-snug tracking-tight">
            &ldquo;We killed the{" "}
            <span className="text-brand-300">spreadsheet.</span>
            <br />
            Costs are honest now.&rdquo;
          </blockquote>
          <div className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-white/5 backdrop-blur pl-1 pr-4 py-1">
            <div className="h-7 w-7 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-semibold">
              CD
            </div>
            <span className="text-sm text-stone-200">Camille Dubois · head pastry</span>
          </div>
        </div>

        <div className="relative text-2xs uppercase tracking-eyebrow text-stone-400/60">
          1,500+ kitchens · Restaurants · Bakeries · Catering
        </div>
      </div>

      {/* Right — form */}
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
            Welcome back
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 leading-tight">
            Sign in to your <span className="text-brand-600">kitchen</span>
          </h1>

          <form
            onSubmit={handleSubmit((values) => login.mutate(values))}
            className="mt-8 space-y-4"
            noValidate
          >
            <FormField id="email" label="Work email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="camille@maison-renard.fr"
                error={!!errors.email}
                {...register("email")}
              />
            </FormField>

            <FormField id="password" label="Password" error={errors.password?.message}>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  error={!!errors.password}
                  {...register("password")}
                  className="pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs uppercase tracking-eyebrow font-semibold text-stone-500 hover:text-stone-700"
                >
                  {showPassword ? (
                    <span className="flex items-center gap-1">
                      <EyeOff className="h-3.5 w-3.5" /> hide
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" /> show
                    </span>
                  )}
                </button>
              </div>
            </FormField>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-brand-500 focus:ring-2 focus:ring-brand-500/30"
                />
                <span className="text-sm text-stone-700">Remember this kitchen</span>
              </label>
              <Link
                href="#"
                className="text-sm text-stone-600 hover:text-stone-900 underline-offset-4 hover:underline"
              >
                Forgot password
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2"
              loading={login.isPending}
            >
              Sign in
            </Button>

            <div className="flex items-center gap-3 py-2">
              <div className="h-px flex-1 bg-stone-200" />
              <span className="text-2xs uppercase tracking-eyebrow text-stone-400">or</span>
              <div className="h-px flex-1 bg-stone-200" />
            </div>

            <Button type="button" variant="secondary" size="lg" className="w-full">
              Continue with SSO
            </Button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-8">
            New here?{" "}
            <Link
              href="/register"
              className="text-stone-900 font-medium underline underline-offset-4 hover:text-brand-700"
            >
              Start a free trial
            </Link>
          </p>

          <div className="mt-8 p-3 bg-white/60 rounded-lg text-2xs text-stone-500 border border-stone-200">
            <strong className="text-stone-700 uppercase tracking-eyebrow mr-1">
              Demo
            </strong>
            admin@demo.com · Demo1234!
          </div>
        </div>
      </div>
    </div>
  );
}
