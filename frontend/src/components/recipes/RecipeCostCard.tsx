'use client';

import { useRecipeCost } from '@/hooks/useRecipes';
import { cn } from '@/lib/utils';

interface Props {
  recipeId: string;
}

function fmt(n: number) {
  return n.toLocaleString('fr-TN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function RecipeCostCard({ recipeId }: Props) {
  const { data, isLoading, isError } = useRecipeCost(recipeId);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card animate-pulse">
        <div className="h-3 bg-stone-200 rounded w-1/3 mb-3" />
        <div className="h-8 bg-stone-200 rounded w-1/2 mb-4" />
        <div className="h-2 bg-stone-100 rounded w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card text-sm text-stone-500">
        Cost cannot be calculated (missing ingredients or incompatible units).
      </div>
    );
  }

  const fc = data.foodCostPercentage;
  const fcColor =
    fc == null
      ? ''
      : fc < 30
      ? 'bg-brand-500'
      : fc <= 40
      ? 'bg-warning'
      : 'bg-danger';

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card">
      <div className="text-2xs font-semibold uppercase tracking-eyebrow text-brand-700">
        Live cost
      </div>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-stone-900 tabular-nums">
          {data.costPerPortion != null ? fmt(data.costPerPortion) : fmt(data.totalCost)}
        </span>
        <span className="text-sm text-stone-500">TND</span>
        <span className="text-xs text-stone-500 ml-1">
          {data.costPerPortion != null ? 'per serving' : 'total'}
        </span>
      </div>

      <div className="mt-1 text-xs text-stone-500">
        <span className="font-mono">{fmt(data.totalCost)} TND</span> total
      </div>

      {fc != null && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-600">Food-cost</span>
            <span className="font-medium text-stone-900 tabular-nums">
              {fc.toFixed(1)}%
            </span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-stone-100 overflow-hidden">
            <div
              className={cn('h-full rounded-full', fcColor)}
              style={{ width: `${Math.min(fc, 100)}%` }}
            />
          </div>
          <div className="mt-1 text-2xs text-stone-400">target ≤ 30%</div>
        </div>
      )}

      {data.lines.length > 0 && (
        <div className="mt-5 pt-4 border-t border-stone-100">
          <div className="text-2xs font-semibold uppercase tracking-eyebrow text-stone-500 mb-2">
            Per-ingredient
          </div>
          <ul className="space-y-1.5">
            {data.lines.slice(0, 6).map((line, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-sm gap-2"
              >
                <span className="text-stone-700 truncate">{line.name}</span>
                <span className="font-mono text-stone-900 tabular-nums shrink-0">
                  {fmt(line.lineCost)}
                </span>
              </li>
            ))}
            {data.lines.length > 6 && (
              <li className="text-2xs text-stone-400 uppercase tracking-eyebrow pt-1">
                +{data.lines.length - 6} more
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
