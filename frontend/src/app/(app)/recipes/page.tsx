'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Pencil, Trash2, Eye, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { RecipeStatusBadge } from '@/components/recipes/RecipeStatusBadge';
import { useRecipes, useDeleteRecipe } from '@/hooks/useRecipes';
import type { Recipe, RecipeStatus } from '@/types';

const PAGE_SIZE = 20;

function formatTime(prep: number | null, cooking: number | null): string {
  const total = (prep ?? 0) + (cooking ?? 0);
  if (total === 0) return '—';
  return `${total} min`;
}

export default function RecipesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RecipeStatus | ''>('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError } = useRecipes({
    page,
    size: PAGE_SIZE,
    search: debouncedSearch,
    status: statusFilter,
    sortBy: 'name',
    sortDir: 'asc',
  });

  const deleteMutation = useDeleteRecipe();

  const handleDelete = (recipe: Recipe) => {
    if (window.confirm(`Supprimer la recette « ${recipe.name} » ?`)) {
      deleteMutation.mutate(recipe.id);
    }
  };

  const totalPages = data?.totalPages ?? 0;
  const recipes = data?.content ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Recettes</h1>
          {data && (
            <p className="mt-1 text-sm text-zinc-500">
              {data.totalElements} recette{data.totalElements !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Button onClick={() => router.push('/recipes/new')}>
          <Plus className="h-4 w-4" />
          Nouvelle recette
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            className="pl-9"
            placeholder="Rechercher une recette…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select
          className="w-48"
          value={statusFilter}
          onChange={e => {
            setStatusFilter(e.target.value as RecipeStatus | '');
            setPage(0);
          }}
        >
          <option value="">Tous les statuts</option>
          <option value="DRAFT">Brouillon</option>
          <option value="PUBLISHED">Publiée</option>
          <option value="ARCHIVED">Archivée</option>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Rendement</th>
                <th className="hidden px-4 py-3 md:table-cell">Temps</th>
                <th className="hidden px-4 py-3 lg:table-cell">Allergènes</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-400">
                    Chargement…
                  </td>
                </tr>
              )}

              {isError && !isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-red-500">
                    Erreur lors du chargement des recettes.
                  </td>
                </tr>
              )}

              {!isLoading && !isError && recipes.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center gap-3 py-16 text-zinc-400">
                      <BookOpen className="h-10 w-10" />
                      <p className="text-base font-medium">
                        {debouncedSearch || statusFilter
                          ? 'Aucune recette trouvée'
                          : 'Créez votre première recette'}
                      </p>
                      {!debouncedSearch && !statusFilter && (
                        <Button size="sm" onClick={() => router.push('/recipes/new')}>
                          <Plus className="h-4 w-4" />
                          Nouvelle recette
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {recipes.map(recipe => (
                <tr
                  key={recipe.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => router.push(`/recipes/${recipe.id}`)}
                      className="font-medium text-zinc-900 hover:text-brand-600 hover:underline text-left"
                    >
                      {recipe.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {recipe.category ?? <span className="text-zinc-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <RecipeStatusBadge status={recipe.status} />
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {recipe.yieldQuantity} {recipe.yieldUnit}
                  </td>
                  <td className="hidden px-4 py-3 text-zinc-600 md:table-cell">
                    {formatTime(recipe.preparationTimeMinutes, recipe.cookingTimeMinutes)}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {recipe.allergens.length === 0 ? (
                      <span className="text-zinc-300">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {recipe.allergens.slice(0, 3).map(a => (
                          <Badge key={a} variant="allergen" className="text-xs">
                            {a}
                          </Badge>
                        ))}
                        {recipe.allergens.length > 3 && (
                          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                            +{recipe.allergens.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => router.push(`/recipes/${recipe.id}`)}
                        className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                        aria-label="Voir"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
                        className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                        aria-label="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(recipe)}
                        className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        aria-label="Supprimer"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3">
            <p className="text-sm text-zinc-500">
              Page {page + 1} sur {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 0}
              >
                Précédent
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages - 1}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
