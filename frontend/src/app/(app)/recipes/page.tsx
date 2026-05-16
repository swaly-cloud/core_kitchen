'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  BookOpen,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  Table as TableIcon,
  LayoutGrid,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { RecipeStatusBadge } from '@/components/recipes/RecipeStatusBadge';
import { useRecipes, useDeleteRecipe } from '@/hooks/useRecipes';
import { cn } from '@/lib/utils';
import type { Recipe, RecipeStatus } from '@/types';

const PAGE_SIZE = 20;

const CATEGORY_CHIPS = [
  { key: '', label: 'All' },
  { key: 'Pâtes', label: 'Pasta' },
  { key: 'Pizzas', label: 'Bakery' },
  { key: 'Œufs', label: 'Savory' },
  { key: 'Salades', label: 'Salads' },
  { key: 'Tartes', label: 'Pastry' },
];

// Color palette for recipe avatar
const AVATAR_COLORS = [
  'bg-amber-400 text-amber-900',
  'bg-amber-500 text-white',
  'bg-orange-400 text-orange-900',
  'bg-rose-400 text-white',
  'bg-stone-500 text-white',
  'bg-emerald-500 text-white',
  'bg-indigo-400 text-white',
  'bg-pink-400 text-white',
];

function avatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// Food-cost bar
function FoodCostBar({ pct }: { pct: number }) {
  const color =
    pct < 25 ? 'bg-brand-500' : pct < 35 ? 'bg-warning' : 'bg-danger';
  return (
    <div className="flex items-center gap-2 w-28">
      <span className="text-sm font-medium text-stone-800 tabular-nums">
        {pct}%
      </span>
      <div className="h-1.5 flex-1 rounded-full bg-stone-100">
        <div
          className={cn('h-full rounded-full', color)}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function RecipesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RecipeStatus | ''>('');
  const [categoryChip, setCategoryChip] = useState('');
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

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
    if (window.confirm(`Delete recipe « ${recipe.name} » ?`)) {
      deleteMutation.mutate(recipe.id);
    }
  };

  const totalPages = data?.totalPages ?? 0;
  const allRecipes = data?.content ?? [];
  const totalRecipes = data?.totalElements ?? 0;

  const recipes = useMemo(() => {
    if (!categoryChip) return allRecipes;
    return allRecipes.filter((r) => r.category === categoryChip);
  }, [allRecipes, categoryChip]);

  const draftCount = allRecipes.filter((r) => r.status === 'DRAFT').length;

  const allSelected =
    recipes.length > 0 && recipes.every((r) => selected.has(r.id));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(recipes.map((r) => r.id)));
  };
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Decorative cost numbers per recipe (deterministic from id length)
  const getMockCost = (r: Recipe) =>
    r.sellingPrice ? r.sellingPrice * 0.25 : 2.4 + (r.name.length % 7) * 0.6;
  const getMockFoodCost = (r: Recipe) =>
    Math.max(18, Math.min(45, 22 + (r.name.length % 12)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-2xs font-semibold uppercase tracking-eyebrow text-stone-500">
            {totalRecipes.toLocaleString()} recipes · {draftCount} drafts · 18 in review
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
            Recipes
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 rounded-lg bg-stone-100 p-1">
            <button
              onClick={() => setView('table')}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors',
                view === 'table'
                  ? 'bg-white text-stone-900 shadow-soft'
                  : 'text-stone-600 hover:text-stone-900'
              )}
            >
              <TableIcon className="h-3.5 w-3.5" /> Table
            </button>
            <button
              onClick={() => setView('cards')}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors',
                view === 'cards'
                  ? 'bg-white text-stone-900 shadow-soft'
                  : 'text-stone-600 hover:text-stone-900'
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Cards
            </button>
          </div>

          <Button variant="secondary" size="sm">
            <Upload className="h-3.5 w-3.5" /> Import
          </Button>
          <Button variant="secondary" size="sm">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button onClick={() => router.push('/recipes/new')} size="sm">
            <Plus className="h-3.5 w-3.5" /> New recipe
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-card">
        <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              className="pl-9"
              placeholder="Filter by name, ingredient, allergen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORY_CHIPS.map((cat) => {
              const active = categoryChip === cat.key;
              const count =
                cat.key === ''
                  ? totalRecipes
                  : allRecipes.filter((r) => r.category === cat.key).length;
              return (
                <button
                  key={cat.key || 'all'}
                  onClick={() => setCategoryChip(cat.key)}
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
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 py-2.5 border-b border-stone-100 flex items-center gap-2 text-xs">
          <span className="text-stone-500">Filters:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RecipeStatus | '')}
            className="rounded-md border border-stone-200 bg-white px-2 py-1 text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="">status ▾</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Live</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <button className="rounded-md border border-stone-200 px-2 py-1 text-stone-600 hover:bg-stone-50">
            author ▾
          </button>
          <button className="rounded-md border border-stone-200 px-2 py-1 text-stone-600 hover:bg-stone-50">
            food-cost ▾
          </button>
          <span className="ml-auto text-stone-500">sort: updated ▾</span>
        </div>

        {/* Table view */}
        {view === 'table' && (
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
                  <th className="px-4 py-3 eyebrow hidden lg:table-cell">SRV</th>
                  <th className="px-4 py-3 eyebrow">Cost / srv</th>
                  <th className="px-4 py-3 eyebrow hidden lg:table-cell">Food-cost</th>
                  <th className="px-4 py-3 eyebrow">Status</th>
                  <th className="px-4 py-3 eyebrow hidden xl:table-cell">Updated</th>
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
                      Error loading recipes.
                    </td>
                  </tr>
                )}

                {!isLoading && !isError && recipes.length === 0 && (
                  <tr>
                    <td colSpan={9}>
                      <div className="flex flex-col items-center gap-3 py-20 text-stone-400">
                        <BookOpen className="h-10 w-10" />
                        <p className="text-base font-medium text-stone-600">
                          {debouncedSearch || statusFilter || categoryChip
                            ? 'No recipes found'
                            : 'Create your first recipe'}
                        </p>
                        {!debouncedSearch && !statusFilter && !categoryChip && (
                          <Button size="sm" onClick={() => router.push('/recipes/new')}>
                            <Plus className="h-4 w-4" /> New recipe
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}

                {recipes.map((recipe) => {
                  const isSelected = selected.has(recipe.id);
                  const cost = getMockCost(recipe);
                  const fc = getMockFoodCost(recipe);
                  return (
                    <tr
                      key={recipe.id}
                      className={cn(
                        'transition-colors',
                        isSelected ? 'bg-brand-50/40' : 'hover:bg-stone-50/60'
                      )}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(recipe.id)}
                          className="h-4 w-4 rounded border-stone-300 text-brand-500 focus:ring-2 focus:ring-brand-500/30"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'h-9 w-9 rounded-lg flex items-center justify-center font-semibold shrink-0',
                              avatarColor(recipe.name)
                            )}
                          >
                            {recipe.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <button
                              onClick={() => router.push(`/recipes/${recipe.id}`)}
                              className="font-medium text-stone-900 hover:text-brand-700 text-left block truncate"
                            >
                              {recipe.name}
                            </button>
                            <div className="text-2xs text-stone-400 font-mono truncate">
                              {recipe.name.toLowerCase().replace(/\s+/g, '-')}-v1
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {recipe.category ? (
                          <Badge variant="muted">{recipe.category}</Badge>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-stone-700 tabular-nums">
                        {recipe.yieldQuantity}
                      </td>
                      <td className="px-4 py-3 font-mono font-medium text-stone-900 tabular-nums">
                        €{cost.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <FoodCostBar pct={fc} />
                      </td>
                      <td className="px-4 py-3">
                        <RecipeStatusBadge status={recipe.status} />
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell text-stone-500 text-sm">
                        {new Date(recipe.updatedAt).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => router.push(`/recipes/${recipe.id}`)}
                            className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                            aria-label="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/recipes/${recipe.id}/edit`)}
                            className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(recipe)}
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
        )}

        {/* Card view */}
        {view === 'cards' && !isLoading && !isError && recipes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
            {recipes.map((recipe) => {
              const cost = getMockCost(recipe);
              const fc = getMockFoodCost(recipe);
              return (
                <button
                  key={recipe.id}
                  onClick={() => router.push(`/recipes/${recipe.id}`)}
                  className="text-left rounded-xl border border-stone-200 bg-white hover:border-stone-300 hover:shadow-card transition-all p-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'h-12 w-12 rounded-lg flex items-center justify-center font-semibold text-lg shrink-0',
                        avatarColor(recipe.name)
                      )}
                    >
                      {recipe.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-stone-900 truncate">
                        {recipe.name}
                      </div>
                      <div className="text-xs text-stone-500 truncate mt-0.5">
                        {recipe.category ?? '—'} · {recipe.yieldQuantity} srv
                      </div>
                    </div>
                    <RecipeStatusBadge status={recipe.status} />
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-2xs uppercase tracking-eyebrow text-stone-500">
                        Cost / srv
                      </div>
                      <div className="font-mono font-semibold text-stone-900 text-lg">
                        €{cost.toFixed(2)}
                      </div>
                    </div>
                    <FoodCostBar pct={fc} />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-stone-100 px-4 py-3">
            <p className="text-sm text-stone-500">
              Showing {page * PAGE_SIZE + 1}–
              {Math.min((page + 1) * PAGE_SIZE, totalRecipes)} of {totalRecipes}
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

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 rounded-xl bg-stone-900 text-white shadow-elevated px-4 py-2.5 flex items-center gap-4">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="h-5 w-px bg-white/20" />
          <button className="text-sm text-stone-200 hover:text-white">
            Change category
          </button>
          <button className="text-sm text-stone-200 hover:text-white">Publish</button>
          <button className="text-sm text-stone-200 hover:text-white">Duplicate</button>
          <button className="text-sm text-stone-200 hover:text-white">Archive</button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-2 rounded-md p-1 hover:bg-white/10"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
