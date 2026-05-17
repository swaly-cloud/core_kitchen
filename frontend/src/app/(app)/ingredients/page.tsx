'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
  Database,
  Import,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { AllergenBadge } from '@/components/ingredients/AllergenBadge';
import { IngredientModal } from '@/components/ingredients/IngredientModal';
import { useIngredients, useDeleteIngredient, useSearchUsda } from '@/hooks/useIngredients';
import { ingredientsApi } from '@/lib/api/ingredients';
import { useQueryClient } from '@tanstack/react-query';
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

function MiniSpark({ direction = 'flat' }: { direction?: 'up' | 'down' | 'flat' }) {
  if (direction === 'up') {
    return (
      <svg width="60" height="20" viewBox="0 0 60 20">
        <path d="M2 16 L15 14 L28 10 L42 6 L58 3" stroke="#C7503D" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (direction === 'down') {
    return (
      <svg width="60" height="20" viewBox="0 0 60 20">
        <path d="M2 4 L15 7 L28 10 L42 14 L58 17" stroke="#6FA060" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="60" height="20" viewBox="0 0 60 20">
      <path d="M2 10 L15 11 L28 9 L42 11 L58 10" stroke="#A8A39A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── USDA panel ──────────────────────────────────────────────────────────────

function UsdaPanel({ onImport }: { onImport: (name: string) => void }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results, isLoading, isFetching } = useSearchUsda(debouncedQuery);

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        {(isLoading || isFetching) && debouncedQuery && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 animate-spin" />
        )}
        <Input
          className="pl-9"
          placeholder="Search USDA database… e.g. butter, chicken, milk"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Empty state */}
      {!debouncedQuery && (
        <div className="flex flex-col items-center gap-3 py-16 text-stone-400">
          <Database className="h-10 w-10" />
          <p className="text-base font-medium text-stone-500">
            Search the USDA FoodData Central database
          </p>
          <p className="text-sm text-stone-400 text-center max-w-xs">
            Type an ingredient name to find it in the USDA database, then click Import to add it to your list.
          </p>
        </div>
      )}

      {/* No results */}
      {debouncedQuery && !isLoading && results && results.length === 0 && (
        <div className="py-12 text-center text-stone-500">
          No results for <strong>&ldquo;{debouncedQuery}&rdquo;</strong>
        </div>
      )}

      {/* Results table */}
      {results && results.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-stone-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-left bg-stone-50">
                <th className="px-4 py-3 text-2xs font-semibold uppercase tracking-eyebrow text-stone-500">Name</th>
                <th className="px-4 py-3 text-2xs font-semibold uppercase tracking-eyebrow text-stone-500 hidden sm:table-cell">FDC ID</th>
                <th className="px-4 py-3 text-2xs font-semibold uppercase tracking-eyebrow text-stone-500 hidden md:table-cell">Type</th>
                <th className="px-4 py-3 text-2xs font-semibold uppercase tracking-eyebrow text-stone-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {results.map((food) => (
                <tr key={food.fdcId} className="hover:bg-stone-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-stone-900 capitalize">
                      {food.name.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell font-mono text-xs text-stone-500">
                    {food.fdcId}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant="muted">{food.dataType}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onImport(food.name.charAt(0).toUpperCase() + food.name.slice(1).toLowerCase())}
                      className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                    >
                      <Import className="h-3.5 w-3.5" />
                      Import
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-stone-100 px-4 py-2.5 text-xs text-stone-400">
            Showing {results.length} results from USDA FoodData Central · Data under CC0 1.0
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function IngredientsPage() {
  const [tab, setTab] = useState<'my' | 'usda'>('my');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>(undefined);
  const [importName, setImportName] = useState<string | undefined>(undefined);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvResult, setCsvResult] = useState<{ imported: number; skipped: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

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
    setImportName(undefined);
    setModalOpen(true);
  };

  const openEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setImportName(undefined);
    setModalOpen(true);
  };

  const openImport = (name: string) => {
    setEditingIngredient(undefined);
    setImportName(name);
    setModalOpen(true);
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvUploading(true);
    setCsvResult(null);
    try {
      const result = await ingredientsApi.importCsv(file);
      setCsvResult(result);
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    } catch {
      setCsvResult({ imported: 0, skipped: -1 });
    } finally {
      setCsvUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = async () => {
    const blob = await ingredientsApi.downloadTemplate();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ingredients_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingIngredient(undefined);
    setImportName(undefined);
  };

  const handleDelete = (ingredient: Ingredient) => {
    if (window.confirm(`Delete « ${ingredient.name} » ?`)) {
      deleteMutation.mutate(ingredient.id);
    }
  };

  const totalPages = data?.totalPages ?? 0;
  const allIngredients = data?.content ?? [];

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

  const allSelected = ingredients.length > 0 && ingredients.every((i) => selected.has(i.id));
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
            {totalIngredients.toLocaleString()} items · {suppliersCount} suppliers · {categoriesCount} categories
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
            Ingredients
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCsvUpload}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            loading={csvUploading}
          >
            <Upload className="h-3.5 w-3.5" /> Import CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDownloadTemplate}>
            <Download className="h-3.5 w-3.5" /> Template
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
            <span className="font-medium text-danger">+9%</span> — review impact on 184 recipes
          </div>
        </div>
        <Button variant="secondary" size="sm" className="shrink-0">
          Review impacts <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* CSV import result banner */}
      {csvResult && (
        <div className={cn(
          'rounded-2xl border px-5 py-4 flex items-center justify-between gap-3',
          csvResult.skipped === -1
            ? 'border-red-200 bg-red-50/60'
            : 'border-brand-200 bg-brand-50/60'
        )}>
          <div className="flex items-center gap-3">
            {csvResult.skipped === -1 ? (
              <AlertCircle className="h-5 w-5 text-danger shrink-0" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0" />
            )}
            <div>
              {csvResult.skipped === -1 ? (
                <p className="font-medium text-stone-900">Import failed — check the file format.</p>
              ) : (
                <>
                  <p className="font-medium text-stone-900">
                    {csvResult.imported} ingredient{csvResult.imported !== 1 ? 's' : ''} imported successfully
                  </p>
                  {csvResult.skipped > 0 && (
                    <p className="text-sm text-stone-500 mt-0.5">{csvResult.skipped} rows skipped (invalid data)</p>
                  )}
                </>
              )}
            </div>
          </div>
          <button onClick={() => setCsvResult(null)} className="text-stone-400 hover:text-stone-600 text-xl leading-none">&times;</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-stone-200">
        <button
          onClick={() => setTab('my')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
            tab === 'my'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-stone-500 hover:text-stone-700'
          )}
        >
          My ingredients
          {totalIngredients > 0 && (
            <span className={cn(
              'ml-2 rounded-full px-2 py-0.5 text-2xs font-semibold',
              tab === 'my' ? 'bg-brand-100 text-brand-700' : 'bg-stone-100 text-stone-500'
            )}>
              {totalIngredients}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('usda')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors inline-flex items-center gap-1.5',
            tab === 'usda'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-stone-500 hover:text-stone-700'
          )}
        >
          <Database className="h-3.5 w-3.5" />
          USDA Database
        </button>
      </div>

      {/* USDA tab */}
      {tab === 'usda' && (
        <div className="rounded-2xl border border-stone-200 bg-white shadow-card p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-stone-900">USDA FoodData Central</h2>
            <p className="text-sm text-stone-500 mt-1">
              Search +400 000 foods from the USDA database and import them into your ingredient list.
            </p>
          </div>
          <UsdaPanel onImport={openImport} />
        </div>
      )}

      {/* My ingredients tab */}
      {tab === 'my' && (
        <div className="rounded-2xl border border-stone-200 bg-white shadow-card">
          {/* Search */}
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
                  <span className={cn('text-2xs font-semibold', active ? 'text-stone-300' : 'text-stone-400')}>
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
                        <p className="text-base font-medium text-stone-600">No ingredients found</p>
                        {!debouncedSearch && (
                          <div className="flex items-center gap-2">
                            <Button size="sm" onClick={openCreate}>
                              <Plus className="h-4 w-4" /> Add manually
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => setTab('usda')}>
                              <Database className="h-4 w-4" /> Search USDA
                            </Button>
                          </div>
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
                          {ingredient.costPerUnit.toFixed(2)} TND
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex flex-col">
                          <MiniSpark direction={dir} />
                          <span className={cn(
                            'text-2xs font-semibold mt-0.5',
                            dir === 'up' ? 'text-danger' : dir === 'down' ? 'text-brand-600' : 'text-stone-400'
                          )}>
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
                              <Badge variant="muted">+{ingredient.allergens.length - 2}</Badge>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell text-stone-600">
                        {ingredient.supplier ?? <span className="text-stone-300">—</span>}
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
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalIngredients)} of {totalIngredients}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </Button>
                <span className="text-sm text-stone-700">
                  Page <strong>{page + 1}</strong> / {totalPages}
                </span>
                <Button variant="secondary" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && tab === 'my' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-3 shadow-elevated">
          <span className="text-sm font-medium text-stone-700">
            {selected.size} selected
          </span>
          <div className="h-4 w-px bg-stone-200" />
          <Button variant="secondary" size="sm">Edit category</Button>
          <Button variant="secondary" size="sm">Archive</Button>
          <Button size="sm" variant="secondary" className="text-danger border-danger/30 hover:bg-red-50">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      )}

      <IngredientModal
        open={modalOpen}
        onClose={closeModal}
        ingredient={editingIngredient}
        initialName={importName}
      />
    </div>
  );
}
