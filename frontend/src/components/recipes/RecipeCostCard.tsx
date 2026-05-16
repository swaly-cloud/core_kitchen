'use client';

import { useRecipeCost } from '@/hooks/useRecipes';
import { Card } from '@/components/ui/Card';

interface Props {
  recipeId: string;
}

function fmt(n: number) {
  return n.toLocaleString('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function FoodCostBadge({ pct }: { pct: number }) {
  const color =
    pct < 30 ? 'text-green-700 bg-green-100' :
    pct <= 40 ? 'text-orange-700 bg-orange-100' :
                'text-red-700 bg-red-100';
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-sm font-semibold ${color}`}>
      {pct.toFixed(2)} %
    </span>
  );
}

export default function RecipeCostCard({ recipeId }: Props) {
  const { data, isLoading, isError } = useRecipeCost(recipeId);

  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="p-6 text-sm text-gray-500">
        Impossible de calculer le coût (ingrédients manquants ou unités incompatibles).
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Analyse des coûts</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Coût total</p>
          <p className="text-xl font-bold text-gray-900">{fmt(data.totalCost)} TND</p>
        </div>

        {data.costPerPortion != null && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Coût / portion</p>
            <p className="text-xl font-bold text-gray-900">{fmt(data.costPerPortion)} TND</p>
          </div>
        )}

        {data.foodCostPercentage != null && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Food cost %</p>
            <FoodCostBadge pct={data.foodCostPercentage} />
          </div>
        )}
      </div>

      {data.lines.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Détail par ingrédient</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b border-gray-200">
                  <th className="pb-2 pr-4 font-medium">Ingrédient</th>
                  <th className="pb-2 pr-4 font-medium text-right">Quantité</th>
                  <th className="pb-2 pr-4 font-medium">Unité</th>
                  <th className="pb-2 font-medium text-right">Coût (TND)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.lines.map((line, i) => (
                  <tr key={i}>
                    <td className="py-1.5 pr-4 text-gray-800">{line.name}</td>
                    <td className="py-1.5 pr-4 text-right text-gray-600">{line.quantity}</td>
                    <td className="py-1.5 pr-4 text-gray-500">{line.unit}</td>
                    <td className="py-1.5 text-right font-medium text-gray-900">{fmt(line.lineCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}
