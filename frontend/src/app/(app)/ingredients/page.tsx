'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AllergenBadge } from '@/components/ingredients/AllergenBadge';
import { IngredientModal } from '@/components/ingredients/IngredientModal';
import { useIngredients, useDeleteIngredient } from '@/hooks/useIngredients';
import type { Ingredient, Unit } from '@/types';

const UNIT_LABELS: Record<Unit, string> = {
  KG: 'kg',
  G: 'g',
  L: 'L',
  ML: 'ml',
  CL: 'cl',
  PIECE: 'pièce',
  BUNCH: 'botte',
  PORTION: 'portion',
};

const PAGE_SIZE = 20;

export default function IngredientsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError } = useIngredients({
    page,
    size: PAGE_SIZE,
    search: debouncedSearch,
    sortBy: 'name',
    sortDir: 'asc',
  });

  const deleteMutation = useDeleteIngredient();

  const openCreate = () => {
    setEditingIngredient(undefined);
    setModalOpen(true);
  };

  const openEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingIngredient(undefined);
  };

  const handleDelete = (ingredient: Ingredient) => {
    if (window.confirm(`Supprimer « ${ingredient.name} » ?`)) {
      deleteMutation.mutate(ingredient.id);
    }
  };

  const totalPages = data?.totalPages ?? 0;
  const ingredients = data?.content ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Ingrédients</h1>
          {data && (
            <p className="mt-1 text-sm text-zinc-500">
              {data.totalElements} ingrédient{data.totalElements !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nouvel ingrédient
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          className="pl-9"
          placeholder="Rechercher un ingrédient…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Unité</th>
                <th className="px-4 py-3">Coût / unité</th>
                <th className="hidden px-4 py-3 md:table-cell">Fournisseur</th>
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
                    Erreur lors du chargement des ingrédients.
                  </td>
                </tr>
              )}

              {!isLoading && !isError && ingredients.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center gap-3 py-16 text-zinc-400">
                      <PackageOpen className="h-10 w-10" />
                      <p className="text-base font-medium">Aucun ingrédient trouvé</p>
                      {!debouncedSearch && (
                        <Button size="sm" onClick={openCreate}>
                          <Plus className="h-4 w-4" />
                          Ajoutez votre premier ingrédient
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {ingredients.map(ingredient => (
                <tr
                  key={ingredient.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-zinc-900">{ingredient.name}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    {ingredient.category ?? <span className="text-zinc-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{UNIT_LABELS[ingredient.unit]}</td>
                  <td className="px-4 py-3 font-mono text-zinc-700">
                    {ingredient.costPerUnit.toFixed(4)} € / {UNIT_LABELS[ingredient.unit]}
                  </td>
                  <td className="hidden px-4 py-3 text-zinc-600 md:table-cell">
                    {ingredient.supplier ?? <span className="text-zinc-300">—</span>}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {ingredient.allergens.length === 0 ? (
                      <span className="text-zinc-300">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {ingredient.allergens.slice(0, 3).map(a => (
                          <AllergenBadge key={a} allergen={a} />
                        ))}
                        {ingredient.allergens.length > 3 && (
                          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                            +{ingredient.allergens.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => openEdit(ingredient)}
                        className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                        aria-label="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ingredient)}
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

      <IngredientModal
        open={modalOpen}
        onClose={closeModal}
        ingredient={editingIngredient}
      />
    </div>
  );
}
