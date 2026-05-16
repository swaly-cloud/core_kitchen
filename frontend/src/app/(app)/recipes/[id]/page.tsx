'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RecipeStatusBadge } from '@/components/recipes/RecipeStatusBadge';
import { useRecipe, useUpdateRecipeStatus } from '@/hooks/useRecipes';
import RecipeCostCard from '@/components/recipes/RecipeCostCard';
import type { RecipeStatus } from '@/types';

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-64 rounded-md bg-stone-200" />
      <div className="h-4 w-48 rounded bg-stone-200" />
      <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-4">
        <div className="h-4 w-32 rounded bg-stone-200" />
        <div className="h-4 w-full rounded bg-stone-200" />
        <div className="h-4 w-3/4 rounded bg-stone-200" />
      </div>
    </div>
  );
}

function Section({
  title,
  rightLabel,
  children,
}: {
  title: string;
  rightLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
        <h2 className="text-base font-semibold text-stone-900">{title}</h2>
        {rightLabel && (
          <span className="text-2xs uppercase tracking-eyebrow text-stone-400">
            {rightLabel}
          </span>
        )}
      </div>
      <div className="p-6">{children}</div>
    </section>
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
        <p className="text-lg font-medium text-stone-700">Recipe not found.</p>
        <Button variant="secondary" onClick={() => router.push('/recipes')}>
          <ArrowLeft className="h-4 w-4" /> Back to recipes
        </Button>
      </div>
    );
  }

  const totalTime =
    (recipe.preparationTimeMinutes ?? 0) + (recipe.cookingTimeMinutes ?? 0);

  return (
    <div className="space-y-6">
      {/* Nav */}
      <button
        onClick={() => router.push('/recipes')}
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to recipes
      </button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
            {recipe.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <RecipeStatusBadge status={recipe.status} />
            {recipe.category && <Badge variant="muted">{recipe.category}</Badge>}
            <span className="inline-flex items-center gap-1.5 text-sm text-stone-600">
              <Users className="h-4 w-4 text-stone-400" />
              <strong className="font-medium text-stone-800">
                {recipe.yieldQuantity} {recipe.yieldUnit}
              </strong>
            </span>
            {totalTime > 0 && (
              <span className="inline-flex items-center gap-1.5 text-sm text-stone-600">
                <Clock className="h-4 w-4 text-stone-400" />
                <strong className="font-medium text-stone-800">{totalTime} min</strong>
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <select
            className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm h-10 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
            value={recipe.status}
            onChange={(e) =>
              statusMutation.mutate({
                id: recipe.id,
                status: e.target.value as RecipeStatus,
              })
            }
            disabled={statusMutation.isPending}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Live</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <Button onClick={() => router.push(`/recipes/${recipe.id}/edit`)}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        </div>
      </div>

      {/* Description */}
      {recipe.description && (
        <Section title="Description">
          <p className="whitespace-pre-wrap text-sm text-stone-700 leading-relaxed">
            {recipe.description}
          </p>
        </Section>
      )}

      {/* Two-column grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6 min-w-0">
          {/* Ingredients */}
          {recipe.ingredients.length > 0 && (
            <Section
              title="Ingredients"
              rightLabel={`${recipe.ingredients.length} items`}
            >
              <div className="rounded-xl border border-stone-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 bg-stone-50 text-left">
                      <th className="px-3 py-2 eyebrow">Ingredient</th>
                      <th className="px-3 py-2 eyebrow">Quantity</th>
                      <th className="px-3 py-2 eyebrow">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {recipe.ingredients.map((ing) => (
                      <tr key={ing.id} className="hover:bg-stone-50/60">
                        <td className="px-3 py-2 font-medium text-stone-900">
                          {ing.ingredientName}
                        </td>
                        <td className="px-3 py-2 font-mono text-stone-700 tabular-nums">
                          {ing.quantity}
                        </td>
                        <td className="px-3 py-2 text-stone-600">
                          {ing.unit.toLowerCase()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* Sub-recipes */}
          {recipe.subRecipes.length > 0 && (
            <Section title="Sub-recipes">
              <div className="rounded-xl border border-stone-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 bg-stone-50 text-left">
                      <th className="px-3 py-2 eyebrow">Sub-recipe</th>
                      <th className="px-3 py-2 eyebrow">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {recipe.subRecipes.map((sr) => (
                      <tr key={sr.id} className="hover:bg-stone-50/60">
                        <td className="px-3 py-2 font-medium text-stone-900">
                          {sr.subRecipeName}
                        </td>
                        <td className="px-3 py-2 font-mono text-stone-700 tabular-nums">
                          {sr.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* Steps */}
          {recipe.steps.length > 0 && (
            <Section title="Method" rightLabel={`${recipe.steps.length} steps`}>
              <ol className="space-y-4">
                {recipe.steps
                  .slice()
                  .sort((a, b) => a.stepNumber - b.stepNumber)
                  .map((step) => (
                    <li
                      key={step.id}
                      className="rounded-xl border border-stone-200 bg-white p-4 flex items-start gap-3"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-white">
                        {step.stepNumber}
                      </span>
                      <p className="pt-0.5 text-sm text-stone-700 leading-relaxed">
                        {step.description}
                      </p>
                    </li>
                  ))}
              </ol>
            </Section>
          )}
        </div>

        <aside className="space-y-6">
          {/* Cost */}
          <RecipeCostCard recipeId={recipe.id} />

          {/* Allergens */}
          {recipe.allergens.length > 0 && (
            <Section title="Allergens">
              <div className="flex flex-wrap gap-2">
                {recipe.allergens.map((allergen) => (
                  <Badge key={allergen} variant="allergen" dot>
                    {allergen.toLowerCase()}
                  </Badge>
                ))}
              </div>
              <p className="mt-3 text-2xs text-stone-500">
                Rolled up automatically from ingredients.
              </p>
            </Section>
          )}
        </aside>
      </div>
    </div>
  );
}
