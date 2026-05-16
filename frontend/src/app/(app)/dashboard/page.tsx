"use client";

import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { BookOpen, Carrot, BarChart3 } from "lucide-react";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Bonjour {user?.firstName} 👋
        </h1>
        <p className="text-zinc-500 mt-1">
          Bienvenue sur l&apos;espace de {user?.organizationName}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatPlaceholder icon={Carrot} label="Ingrédients" value="—" />
        <StatPlaceholder icon={BookOpen} label="Recettes" value="—" />
        <StatPlaceholder icon={BarChart3} label="Coût moyen / portion" value="—" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Phase 1 — Fondations livrées</CardTitle>
          <CardDescription>
            Authentification, multi-tenant, profil utilisateur, infrastructure Docker.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-zinc-600 space-y-2 list-disc pl-5">
            <li>Gestion ingrédients — Phase 2</li>
            <li>Gestion recettes &amp; sous-recettes — Phase 3</li>
            <li>Cost engine (coûts, rendements, prix de vente) — Phase 4</li>
            <li>Calculs nutritionnels &amp; allergènes — Phase 5</li>
            <li>Dashboard avec agrégats &amp; tendances — Phase 6</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function StatPlaceholder({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className="h-10 w-10 rounded-md bg-brand-50 text-brand-700 flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs text-zinc-500">{label}</div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
