'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { RecipeStatusBadge } from '@/components/recipes/RecipeStatusBadge';
import { useRecipe, useUpdateRecipeStatus } from '@/hooks/useRecipes';
import RecipeCostCard from '@/components/recipes/RecipeCostCard';
import type { RecipeStatus } from '@/types';

const SECTION_HEADING = 'text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-2 mb-4';

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-64 rounded-md bg-zinc-200" />
      <div className="h-4 w-48 rounded bg-zinc-200" />
      <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4">
        <div className="h-4 w-32 rounded bg-zinc-200" />
        <div className="h-4 w-full rounded bg-zinc-200" />
        <div className="h-4 w-3/4 rounded bg-zinc-200" />
      </div>
    </div>
  );
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: recipe, isLoading, isError } = useRecipe(id);
  const statusMutation = useUpdateRecipeStatus();

  if (isLoading) return <LoadingSkeleton />;

  if (isError || !recipe) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-lg font-medium text-zinc-700">Recette introuvable.</p>
        <Button variant="secondary" onClick={() => router.push('/recipes')}>
          <ArrowLeft className="h-4 w-4" />
          Retour aux recettes
        </Button>
      </div>
    );
  }

  const totalTime = (recipe.preparationTimeMinutes ?? 0) + (recipe.cookingTimeMinutes ?? 0);

  return (
    <div className="space-y-6">
      {/* Nav */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/recipes')}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux recettes
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{recipe.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <RecipeStatusBadge status={recipe.status} />
            {recipe.category && (
              <Badge variant="outline">{recipe.category}</Badge>
            )}
            <span className="text-sm text-zinc-500">
              Rendement : <strong className="text-zinc-700">{recipe.yieldQuantity} {recipe.yieldUnit}</strong>
            </span>
            {(recipe.preparationTimeMinutes !== null || recipe.cookingTimeMinutes !== null) && (
              <span className="text-sm text-zinc-500">
                {recipe.preparationTimeMinutes !== null && `Prép. : ${recipe.preparationTimeMinutes} min`}
                {recipe.preparationTimeMinutes !== null && recipe.cookingTimeMinutes !== null && ' | '}
                {recipe.cookingTimeMinutes !== null && `Cuisson : ${recipe.cookingTimeMinutes} min`}
                {totalTime > 0 && ` (${totalTime} min total)`}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Select
            className="w-44"
            value={recipe.status}
            onChange={e =>
              statusMutation.mutate({ id: recipe.id, status: e.target.value as RecipeStatus })
            }
            disabled={statusMutation.isPending}
          >
            <option value="DRAFT">Brouillon</option>
            <option value="PUBLISHED">Publiée</option>
            <option value="ARCHIVED">Archivée</option>
          </Select>
          <Button onClick={() => router.push(`/recipes/${recipe.id}/edit`)}>
            <Pencil className="h-4 w-4" />
            Modifier
          </Button>
        </div>
      </div>

      {/* Description */}
      {recipe.description && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className={SECTION_HEADING}>Description</h2>
          <p className="whitespace-pre-wrap text-sm text-zinc-700">{recipe.description}</p>
        </div>
      )}

      {/* Ingredients */}
      {recipe.ingredients.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className={SECTION_HEADING}>Ingrédients</h2>
          <div className="overflow-hidden rounded-lg border border-zinc-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  <th className="px-3 py-2">Ingrédient</th>
                  <th className="px-3 py-2">Quantité</th>
                  <th className="px-3 py-2">Unité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recipe.ingredients.map(ing => (
                  <tr key={ing.id} className="hover:bg-zinc-50">
                    <td className="px-3 py-2 font-medium text-zinc-900">{ing.ingredientName}</td>
                    <td className="px-3 py-2 text-zinc-600">{ing.quantity}</td>
                    <td className="px-3 py-2 text-zinc-600">{ing.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-recipes */}
      {recipe.subRecipes.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className={SECTION_HEADING}>Sous-recettes</h2>
          <div className="overflow-hidden rounded-lg border border-zinc-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                  <th className="px-3 py-2">Sous-recette</th>
                  <th className="px-3 py-2">Quantité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recipe.subRecipes.map(sr => (
                  <tr key={sr.id} className="hover:bg-zinc-50">
                    <td className="px-3 py-2 font-medium text-zinc-900">{sr.subRecipeName}</td>
                    <td className="px-3 py-2 text-zinc-600">{sr.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Steps */}
      {recipe.steps.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className={SECTION_HEADING}>Étapes</h2>
          <ol className="space-y-4">
            {recipe.steps
              .slice()
              .sort((a, b) => a.stepNumber - b.stepNumber)
              .map(step => (
                <li key={step.id} className="flex items-start gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                    {step.stepNumber}
                  </span>
                  <p className="pt-0.5 text-sm text-zinc-700 leading-relaxed">{step.description}</p>
                </li>
              ))}
          </ol>
        </div>
      )}

      {/* Cost */}
      <RecipeCostCard recipeId={recipe.id} />

      {/* Allergens */}
      {recipe.allergens.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className={SECTION_HEADING}>Allergènes</h2>
          <div className="flex flex-wrap gap-2">
            {recipe.allergens.map(allergen => (
              <Badge key={allergen} variant="allergen">
                {allergen}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
