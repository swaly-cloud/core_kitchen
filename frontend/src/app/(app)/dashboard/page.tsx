"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Plus, Download, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useIngredients } from "@/hooks/useIngredients";
import { useRecipes } from "@/hooks/useRecipes";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getInitials } from "@/lib/utils";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();
}

// Mini sparkline (decorative — uses inline SVG)
function Sparkline({
  points,
  color = "#6FA060",
}: {
  points: number[];
  color?: string;
}) {
  const w = 160;
  const h = 36;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - ((p - min) / range) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <path d={path} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function KpiCard({
  label,
  value,
  trend,
  trendDirection = "up",
  spark,
  sparkColor,
  accent,
}: {
  label: string;
  value: string;
  trend?: string;
  trendDirection?: "up" | "down" | "flat";
  spark?: number[];
  sparkColor?: string;
  accent?: "brand";
}) {
  const isBrand = accent === "brand";
  return (
    <div
      className={
        "rounded-2xl border p-5 shadow-card transition-colors " +
        (isBrand
          ? "border-brand-200 bg-brand-50/60"
          : "border-stone-200 bg-white")
      }
    >
      <div className="eyebrow">{label}</div>
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <div
          className={
            "text-3xl lg:text-4xl font-bold tracking-tight " +
            (isBrand ? "text-brand-700" : "text-stone-900")
          }
        >
          {value}
        </div>
        {spark && (
          <Sparkline
            points={spark}
            color={sparkColor ?? (isBrand ? "#5C8A50" : "#A8A39A")}
          />
        )}
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1 text-xs text-stone-500">
          {trendDirection === "up" && (
            <ArrowUpRight className="h-3.5 w-3.5 text-brand-600" />
          )}
          {trendDirection === "down" && (
            <ArrowDownRight className="h-3.5 w-3.5 text-danger" />
          )}
          {trendDirection === "flat" && <Minus className="h-3.5 w-3.5" />}
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}

function ActivityItem({
  initials,
  action,
  time,
  color = "brand",
}: {
  initials: string;
  action: React.ReactNode;
  time: string;
  color?: "brand" | "stone" | "warning";
}) {
  const colorClasses: Record<string, string> = {
    brand: "bg-brand-500 text-white",
    stone: "bg-stone-300 text-stone-700",
    warning: "bg-warning text-white",
  };
  return (
    <div className="flex items-start gap-3 py-3">
      <div
        className={
          "h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold " +
          colorClasses[color]
        }
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm text-stone-800 leading-snug">{action}</div>
        <div className="text-2xs uppercase tracking-eyebrow text-stone-400 mt-0.5">
          {time}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: ingredientsData } = useIngredients({ page: 0, size: 1 });
  const { data: recipesData } = useRecipes({ page: 0, size: 1 });

  const recipesCount = recipesData?.totalElements ?? 0;
  const ingredientsCount = ingredientsData?.totalElements ?? 0;

  const spark1 = useMemo(() => [4, 6, 5, 7, 8, 7, 9, 11, 10, 12], []);
  const spark2 = useMemo(() => [3.8, 4.0, 3.9, 4.2, 4.1, 4.0, 4.05, 4.1, 4.08, 4.12], []);
  const spark3 = useMemo(() => [200, 350, 500, 700, 880, 950, 1020, 1100, 1150, 1184], []);

  const userInitials = user ? getInitials(user.firstName, user.lastName) : "CK";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="text-2xs font-semibold uppercase tracking-eyebrow text-stone-500">
            {formatDate()}
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
            {getGreeting()}, <span className="text-brand-600">{user?.firstName}.</span>
          </h1>
          <p className="mt-1.5 text-sm text-stone-500">
            {recipesCount} recipes · {ingredientsCount} ingredients tracked
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm">
            Last 30 days
          </Button>
          <Button variant="secondary" size="sm">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Link href="/recipes/new">
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" /> New recipe
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total recipes"
          value={recipesCount.toLocaleString()}
          trend="↑ 12 this week"
          spark={spark1}
        />
        <KpiCard
          label="Avg cost / serving"
          value="€4.12"
          trend="↑ €0.18 vs last month"
          trendDirection="up"
          spark={spark2}
          sparkColor="#C7503D"
        />
        <KpiCard
          label="Ingredients tracked"
          value={ingredientsCount.toLocaleString()}
          trend="↑ 34 new this month"
          spark={spark3}
        />
        <KpiCard
          label="Food-cost ratio"
          value="28.6%"
          trend="target ≤ 30%"
          accent="brand"
          spark={[28, 28.5, 29, 28.8, 28.6, 28.7, 28.5, 28.6, 28.4, 28.6]}
        />
      </div>

      {/* Main grid: chart + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart card (placeholder) */}
        <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-semibold text-stone-900">
                Cost per serving · trend
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">13 weeks rolling average</p>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-stone-100 p-1">
              <button className="px-3 py-1 text-xs font-medium rounded-md bg-stone-900 text-white">
                All
              </button>
              <button className="px-3 py-1 text-xs font-medium rounded-md text-stone-600 hover:text-stone-900">
                Pastry
              </button>
              <button className="px-3 py-1 text-xs font-medium rounded-md text-stone-600 hover:text-stone-900">
                Savory
              </button>
              <button className="px-3 py-1 text-xs font-medium rounded-md text-stone-600 hover:text-stone-900">
                Bakery
              </button>
            </div>
          </div>

          {/* Decorative chart */}
          <div className="relative h-56 w-full">
            <svg viewBox="0 0 600 200" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6FA060" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#6FA060" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Target line */}
              <line
                x1="0"
                y1="80"
                x2="600"
                y2="80"
                stroke="#D1CDC2"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              {/* Series */}
              <path
                d="M0,140 C60,135 100,130 150,120 C200,110 250,105 300,98 C350,90 400,85 450,82 C500,80 550,78 600,75"
                fill="none"
                stroke="#C7503D"
                strokeWidth="2"
              />
              <path
                d="M0,160 C60,150 100,145 150,138 C200,130 250,128 300,122 C350,115 400,112 450,108 C500,105 550,103 600,100"
                fill="url(#chartGrad)"
                stroke="none"
              />
              <path
                d="M0,160 C60,150 100,145 150,138 C200,130 250,128 300,122 C350,115 400,112 450,108 C500,105 550,103 600,100"
                fill="none"
                stroke="#6FA060"
                strokeWidth="2"
              />
            </svg>
            <div className="absolute top-2 right-2 rounded-md bg-stone-900 text-white text-xs font-medium px-2 py-1">
              €4.12
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-500" /> All recipes
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-danger" /> Pastry only
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-stone-300" /> Target €4.00
            </span>
          </div>
        </div>

        {/* Activity */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-stone-900">Activity</h2>
            <Link
              href="#"
              className="text-2xs font-semibold uppercase tracking-eyebrow text-stone-500 hover:text-stone-900"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-stone-100">
            <ActivityItem
              initials={userInitials}
              action={
                <>
                  <strong className="font-medium">{user?.firstName ?? "You"}</strong>{" "}
                  edited <span className="italic text-stone-900">Tarte au citron</span>
                </>
              }
              time="2 min ago"
            />
            <ActivityItem
              initials="JN"
              action={
                <>
                  <strong className="font-medium">Julien</strong> published{" "}
                  <span className="italic text-stone-900">Brioche feuilletée</span>
                </>
              }
              time="1 h ago"
            />
            <ActivityItem
              initials="!"
              color="warning"
              action={
                <>
                  Butter price <Badge variant="warning">+12%</Badge> at Bellevaire ·
                  affects 184 recipes
                </>
              }
              time="3 h ago"
            />
            <ActivityItem
              initials="PL"
              color="stone"
              action={
                <>
                  <strong className="font-medium">Pauline</strong> added 14
                  ingredients
                </>
              }
              time="Yesterday"
            />
            <ActivityItem
              initials="CR"
              action={
                <>
                  <strong className="font-medium">Camille</strong> archived{" "}
                  <span className="italic text-stone-900">Beurre blanc v2</span>
                </>
              }
              time="2 days ago"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
