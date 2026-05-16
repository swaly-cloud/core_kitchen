'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  PackageOpen,
  Upload,
  Download,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { AllergenBadge } from '@/components/ingredients/AllergenBadge';
import { IngredientModal } from '@/components/ingredients/IngredientModal';
import { useIngredients, useDeleteIngredient } from '@/hooks/useIngredients';
import { cn } from '@/lib/utils';
import type { Ingredient, Unit } from '@/types';

const UNIT_LABELS: Record<Unit, string> = {
  KG: 'kg',
  G: 'g',
  L: 'L',
  ML: 'ml',
  CL: 'cl',
  PIECE: 'unit',
  BUNCH: 'bunch',
  PORTION: 'portion',
};

const PAGE_SIZE = 20;

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'Produits laitiers', label: 'Dairy' },
  { key: 'Boulangerie', label: 'Flour & grains' },
  { key: 'Charcuterie', label: 'Meat' },
  { key: 'Produits frais', label: 'Fresh' },
  { key: 'Fruits et légumes', label: 'Produce' },
  { key: 'Épices', label: 'Spices' },
  { key: 'Fromages', label: 'Cheese' },
];

// Tiny sparkline for trend column
function MiniSpark({ direction = 'flat' }: { direction?: 'up' | 'down' | 'flat' }) {
  if (direction === 'up') {
    return (
      <svg width="60" height="20" viewBox="0 0 60 20">
        <path
          d="M2 16 L15 14 L28 10 L42 6 L58 3"
          stroke="#C7503D"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (direction === 'down') {
    return (
      <svg width="60" height="20" viewBox="0 0 60 20">
        <path
          d="M2 4 L15 7 L28 10 L42 14 L58 17"
          stroke="#6FA060"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="60" height="20" viewBox="0 0 60 20">
      <path
        d="M2 10 L15 11 L28 9 L42 11 L58 10"
        stroke="#A8A39A"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function IngredientsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>(undefined);
  const [selected, setSelected] = useState<Set<string>>(new Set());

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
    if (window.confirm(`Delete « ${ingredient.name} » ?`)) {
      deleteMutation.mutate(ingredient.id);
    }
  };

  const totalPages = data?.totalPages ?? 0;
  const allIngredients = data?.content ?? [];

  // Client-side category filter (server doesn't support it yet)
  const ingredients = useMemo(() => {
    if (activeCategory === 'all') return allIngredients;
    return allIngredients.filter((i) => i.category === activeCategory);
  }, [allIngredients, activeCategory]);

  const totalIngredients = data?.totalElements ?? 0;
  const suppliersCount = useMemo(() => {
    const set = new Set(allIngredients.map((i) => i.supplier).filter(Boolean));
    return set.size;
  }, [allIngredients]);
  const categoriesCount = useMemo(() => {
    const set = new Set(allIngredients.map((i) => i.category).filter(Boolean));
    return set.size;
  }, [allIngredients]);

  const allSelected =
    ingredients.length > 0 && ingredients.every((i) => selected.has(i.id));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(ingredients.map((i) => i.id)));
  };
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-2xs font-semibold uppercase tracking-eyebrow text-stone-500">
            {totalIngredients.toLocaleString()} items · {suppliersCount} suppliers ·{' '}
            {categoriesCount} categories
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
            Ingredients
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm">
            <Upload className="h-3.5 w-3.5" /> Import CSV
          </Button>
          <Button variant="secondary" size="sm">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button onClick={openCreate} size="sm">
            <Plus className="h-3.5 w-3.5" /> New ingredient
          </Button>
        </div>
      </div>

      {/* Alert banner */}
      <div className="rounded-2xl border border-brand-200 bg-brand-50/60 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="font-medium text-stone-900">
            3 ingredients had cost movements over 10% this week
          </div>
          <div className="text-sm text-stone-600 mt-0.5">
            Butter <span className="font-medium text-danger">+18%</span> · Lemon{' '}
            <span className="font-medium text-danger">+12%</span> · Vanilla pod{' '}
            <span className="font-medium text-danger">+9%</span> — review impact on 184
            recipes
          </div>
        </div>
        <Button variant="secondary" size="sm" className="shrink-0">
          Review impacts <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Filters card */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-card">
        <div className="p-4 border-b border-stone-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              className="pl-9"
              placeholder="Search ingredients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Category chips */}
        <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-2 overflow-x-auto">
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat.key;
            const count =
              cat.key === 'all'
                ? totalIngredients
                : allIngredients.filter((i) => i.category === cat.key).length;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition-colors',
                  active
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 ring-1 ring-inset ring-stone-200'
                )}
              >
                {cat.label}
                <span
                  className={cn(
                    'text-2xs font-semibold',
                    active ? 'text-stone-300' : 'text-stone-400'
                  )}
                >
                  {count.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-left">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-stone-300 text-brand-500 focus:ring-2 focus:ring-brand-500/30"
                  />
                </th>
                <th className="px-4 py-3 eyebrow">Name</th>
                <th className="px-4 py-3 eyebrow hidden md:table-cell">Category</th>
                <th className="px-4 py-3 eyebrow hidden md:table-cell">Unit</th>
                <th className="px-4 py-3 eyebrow">Cost / unit</th>
                <th className="px-4 py-3 eyebrow hidden lg:table-cell">Trend · 30d</th>
                <th className="px-4 py-3 eyebrow hidden lg:table-cell">Allergens</th>
                <th className="px-4 py-3 eyebrow hidden xl:table-cell">Supplier</th>
                <th className="px-4 py-3 eyebrow text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading && (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-stone-400">
                    Loading...
                  </td>
                </tr>
              )}

              {isError && !isLoading && (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-danger">
                    Error loading ingredients.
                  </td>
                </tr>
              )}

              {!isLoading && !isError && ingredients.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <div className="flex flex-col items-center gap-3 py-20 text-stone-400">
                      <PackageOpen className="h-10 w-10" />
                      <p className="text-base font-medium text-stone-600">
                        No ingredients found
                      </p>
                      {!debouncedSearch && (
                        <Button size="sm" onClick={openCreate}>
                          <Plus className="h-4 w-4" />
                          Add your first ingredient
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {ingredients.map((ingredient, idx) => {
                const dir: 'up' | 'down' | 'flat' =
                  idx % 3 === 0 ? 'up' : idx % 3 === 1 ? 'flat' : 'down';
                const pct = idx % 3 === 0 ? '+18%' : idx % 3 === 1 ? 'flat' : '−2%';
                const isSelected = selected.has(ingredient.id);
                return (
                  <tr
                    key={ingredient.id}
                    className={cn(
                      'transition-colors',
                      isSelected ? 'bg-brand-50/40' : 'hover:bg-stone-50/60'
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(ingredient.id)}
                        className="h-4 w-4 rounded border-stone-300 text-brand-500 focus:ring-2 focus:ring-brand-500/30"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-stone-900">{ingredient.name}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {ingredient.category ? (
                        <Badge variant="muted">{ingredient.category}</Badge>
                      ) : (
                        <span className="text-stone-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-stone-600">
                      {UNIT_LABELS[ingredient.unit]}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono font-medium text-stone-900">
                        {ingredient.costPerUnit.toFixed(2)}€
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-col">
                        <MiniSpark direction={dir} />
                        <span
                          className={cn(
                            'text-2xs font-semibold mt-0.5',
                            dir === 'up'
                              ? 'text-danger'
                              : dir === 'down'
                              ? 'text-brand-600'
                              : 'text-stone-400'
                          )}
                        >
                          {pct}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {ingredient.allergens.length === 0 ? (
                        <span className="text-stone-300">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {ingredient.allergens.slice(0, 2).map((a) => (
                            <AllergenBadge key={a} allergen={a} />
                          ))}
                          {ingredient.allergens.length > 2 && (
                            <Badge variant="muted">
                              +{ingredient.allergens.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-stone-600">
                      {ingredient.supplier ?? (
                        <span className="text-stone-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEdit(ingredient)}
                          className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ingredient)}
                          className="rounded-md p-1.5 text-stone-400 hover:bg-red-50 hover:text-danger transition-colors"
                          aria-label="Delete"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-stone-100 px-4 py-3">
            <p className="text-sm text-stone-500">
              Showing {page * PAGE_SIZE + 1}–
              {Math.min((page + 1) * PAGE_SIZE, totalIngredients)} of {totalIngredients}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </Button>
              <span className="text-sm text-stone-700">
                Page <strong>{page + 1}</strong> / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
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
