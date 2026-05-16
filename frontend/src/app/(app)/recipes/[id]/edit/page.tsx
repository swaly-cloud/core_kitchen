'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Minus,
  GripVertical,
  Copy,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Badge } from '@/components/ui/Badge';
import { useRecipe, useUpdateRecipe, useRecipeCost } from '@/hooks/useRecipes';
import { useIngredients } from '@/hooks/useIngredients';
import { cn } from '@/lib/utils';

const UNITS = ['KG', 'G', 'L', 'ML', 'CL', 'PIECE', 'BUNCH', 'PORTION'] as const;

const schema = z.object({
  name: z.string().min(1, 'Name required').max(255),
  description: z.string().optional(),
  category: z.string().max(100).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  yieldQuantity: z.coerce.number().positive('Yield must be positive'),
  yieldUnit: z.string().min(1, 'Unit required'),
  preparationTimeMinutes: z.coerce.number().int().min(0).optional().nullable(),
  cookingTimeMinutes: z.coerce.number().int().min(0).optional().nullable(),
  sellingPrice: z.coerce.number().min(0.01).optional().nullable(),
  ingredients: z
    .array(
      z.object({
        ingredientId: z.string().min(1, 'Ingredient required'),
        quantity: z.coerce.number().positive('Quantity must be positive'),
        unit: z.string().min(1),
      })
    )
    .default([]),
  subRecipes: z
    .array(
      z.object({
        subRecipeId: z.string().min(1, 'Sub-recipe required'),
        quantity: z.coerce.number().positive(),
      })
    )
    .default([]),
  steps: z
    .array(
      z.object({
        stepNumber: z.number().int().positive(),
        description: z.string().min(1, 'Description required'),
      })
    )
    .default([]),
});

type FormValues = z.infer<typeof schema>;

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-64 rounded-md bg-stone-200" />
      <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-4">
        <div className="h-4 w-32 rounded bg-stone-200" />
        <div className="h-10 w-full rounded bg-stone-200" />
        <div className="h-10 w-full rounded bg-stone-200" />
      </div>
    </div>
  );
}

function SectionCard({
  title,
  rightLabel,
  children,
  action,
}: {
  title: string;
  rightLabel?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
        <div className="flex items-baseline gap-3">
          <h2 className="text-base font-semibold text-stone-900">{title}</h2>
          {rightLabel && (
            <span className="text-2xs uppercase tracking-eyebrow text-stone-400">
              {rightLabel}
            </span>
          )}
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

export default function EditRecipePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: recipe, isLoading } = useRecipe(id);
  const { data: cost } = useRecipeCost(id);
  const updateMutation = useUpdateRecipe();
  const { data: ingredientsData } = useIngredients({
    size: 100,
    sortBy: 'name',
    sortDir: 'asc',
  });
  const allIngredients = ingredientsData?.content ?? [];

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      status: 'DRAFT',
      yieldQuantity: 1,
      yieldUnit: 'portions',
      preparationTimeMinutes: null,
      cookingTimeMinutes: null,
      sellingPrice: null,
      ingredients: [],
      subRecipes: [],
      steps: [],
    },
  });

  useEffect(() => {
    if (recipe) {
      reset({
        name: recipe.name,
        description: recipe.description ?? '',
        category: recipe.category ?? '',
        status: recipe.status,
        yieldQuantity: recipe.yieldQuantity,
        yieldUnit: recipe.yieldUnit,
        preparationTimeMinutes: recipe.preparationTimeMinutes,
        cookingTimeMinutes: recipe.cookingTimeMinutes,
        sellingPrice: recipe.sellingPrice ?? null,
        ingredients: recipe.ingredients.map((ing) => ({
          ingredientId: ing.ingredientId,
          quantity: ing.quantity,
          unit: ing.unit,
        })),
        subRecipes: recipe.subRecipes.map((sr) => ({
          subRecipeId: sr.subRecipeId,
          quantity: sr.quantity,
        })),
        steps: recipe.steps
          .slice()
          .sort((a, b) => a.stepNumber - b.stepNumber)
          .map((step) => ({
            stepNumber: step.stepNumber,
            description: step.description,
          })),
      });
    }
  }, [recipe, reset]);

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({ control, name: 'ingredients' });

  const {
    fields: subRecipeFields,
    append: appendSubRecipe,
    remove: removeSubRecipe,
  } = useFieldArray({ control, name: 'subRecipes' });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
    move: moveStep,
  } = useFieldArray({ control, name: 'steps' });

  const watchedIngredients = watch('ingredients');
  const yieldQuantity = watch('yieldQuantity');
  const sellingPrice = watch('sellingPrice');

  const totalIngredientsCount = ingredientFields.length;

  // Servings adjust
  const bumpYield = (delta: number) => {
    const v = Number(yieldQuantity) || 0;
    setValue('yieldQuantity', Math.max(1, v + delta), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (values: FormValues, publish = false) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      status: publish ? ('PUBLISHED' as const) : values.status,
      yieldQuantity: values.yieldQuantity,
      yieldUnit: values.yieldUnit,
      category: values.category || undefined,
      preparationTimeMinutes: values.preparationTimeMinutes ?? undefined,
      cookingTimeMinutes: values.cookingTimeMinutes ?? undefined,
      sellingPrice: values.sellingPrice ?? undefined,
      ingredients: values.ingredients,
      subRecipes: values.subRecipes,
      steps: values.steps,
    };
    await updateMutation.mutateAsync({ id, data: payload });
    if (publish) router.push(`/recipes/${id}`);
  };

  // Derived cost stats
  const totalCost = cost?.totalCost ?? 0;
  const perServing = cost?.costPerPortion ?? 0;
  const foodCost = cost?.foodCostPercentage;
  const suggestedPrice = useMemo(() => {
    if (!perServing) return null;
    return perServing / 0.28;
  }, [perServing]);

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      {/* Sticky header */}
      <div className="sticky top-16 z-20 -mx-4 sm:-mx-6 lg:-mx-10 -mt-6 lg:-mt-8 mb-2 px-4 sm:px-6 lg:px-10 py-3 bg-cream-100/95 backdrop-blur border-b border-stone-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push(`/recipes/${id}`)}
              className="rounded-md p-1.5 hover:bg-stone-100 text-stone-600 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-2xs font-semibold uppercase tracking-eyebrow text-stone-500">
                Recipes
              </span>
              <span className="text-stone-300">/</span>
              <span className="font-medium text-stone-900 truncate">
                {recipe?.name ?? '…'}
              </span>
              <Badge variant="muted">v1</Badge>
              {isDirty && (
                <Badge variant="warning" dot>
                  Unsaved
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/recipes/${id}`)}
            >
              Cancel
            </Button>
            <Button variant="secondary" size="sm">
              <Copy className="h-3.5 w-3.5" /> Duplicate
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSubmit((v) => onSubmit(v, false))}
              loading={updateMutation.isPending}
            >
              Save draft
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit((v) => onSubmit(v, true))}
              loading={updateMutation.isPending}
            >
              Publish <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit((v) => onSubmit(v, false))}
        className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6"
      >
        {/* Main column */}
        <div className="space-y-6 min-w-0">
          {/* Basics */}
          <SectionCard title="Basics" rightLabel="Section 1 / 4">
            <div className="space-y-5">
              <FormField id="name" label="Recipe name *" error={errors.name?.message}>
                <Input id="name" {...register('name')} error={!!errors.name} />
              </FormField>

              <FormField
                id="description"
                label="Description"
                error={errors.description?.message}
              >
                <textarea
                  id="description"
                  {...register('description')}
                  rows={3}
                  className="flex w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 transition-colors"
                  placeholder="Describe the recipe..."
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  id="category"
                  label="Category"
                  error={errors.category?.message}
                  optional
                >
                  <Select id="category" {...register('category')}>
                    <option value="">—</option>
                    <option value="Pastry">Pastry</option>
                    <option value="Savory">Savory</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Sauces">Sauces</option>
                    <option value="Pâtes">Pasta</option>
                    <option value="Pizzas">Pizzas</option>
                    <option value="Salades">Salads</option>
                    <option value="Tartes">Tarts</option>
                    <option value="Œufs">Eggs</option>
                  </Select>
                </FormField>

                <FormField
                  id="status"
                  label="Status"
                  error={errors.status?.message}
                >
                  <Select id="status" {...register('status')}>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Live</option>
                    <option value="ARCHIVED">Archived</option>
                  </Select>
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  id="preparationTimeMinutes"
                  label="Prep time"
                  error={errors.preparationTimeMinutes?.message}
                  optional
                >
                  <div className="relative">
                    <Input
                      id="preparationTimeMinutes"
                      type="number"
                      min="0"
                      {...register('preparationTimeMinutes')}
                      placeholder="45"
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs uppercase tracking-eyebrow text-stone-400">
                      min
                    </span>
                  </div>
                </FormField>

                <FormField
                  id="cookingTimeMinutes"
                  label="Cook time"
                  error={errors.cookingTimeMinutes?.message}
                  optional
                >
                  <div className="relative">
                    <Input
                      id="cookingTimeMinutes"
                      type="number"
                      min="0"
                      {...register('cookingTimeMinutes')}
                      placeholder="35"
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs uppercase tracking-eyebrow text-stone-400">
                      min
                    </span>
                  </div>
                </FormField>
              </div>

              <FormField
                id="sellingPrice"
                label="Selling price (TND)"
                error={errors.sellingPrice?.message}
                optional
              >
                <Input
                  id="sellingPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('sellingPrice')}
                  placeholder="8.50"
                />
              </FormField>

              {/* Hero photo placeholder */}
              <div>
                <div className="block text-2xs font-semibold uppercase tracking-eyebrow text-stone-500 mb-2">
                  Hero photo
                </div>
                <div className="aspect-[5/2] rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-4xl font-serif italic shadow-soft">
                  {recipe?.name?.charAt(0).toUpperCase() ?? 'T'}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Ingredients */}
          <SectionCard
            title="Ingredients"
            rightLabel={`${totalIngredientsCount} items · auto-cost on`}
            action={
              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" size="sm">
                  + Section
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    appendIngredient({ ingredientId: '', quantity: 1, unit: 'KG' })
                  }
                >
                  <Plus className="h-3.5 w-3.5" /> Add ingredient
                </Button>
              </div>
            }
          >
            {ingredientFields.length === 0 ? (
              <div className="rounded-xl border border-dashed border-stone-200 py-10 text-center text-stone-400 text-sm">
                No ingredient yet. Click <strong>Add ingredient</strong> to begin.
              </div>
            ) : (
              <div className="rounded-xl border border-stone-200 overflow-hidden">
                <div className="bg-stone-50 border-b border-stone-200 px-4 py-2 flex items-center justify-between">
                  <div className="text-2xs font-semibold uppercase tracking-eyebrow text-stone-700">
                    Main section
                  </div>
                  <div className="text-2xs uppercase tracking-eyebrow text-stone-500">
                    {totalIngredientsCount} ingredients
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 text-left">
                      <th className="px-3 py-2 w-6"></th>
                      <th className="px-3 py-2 eyebrow">Ingredient</th>
                      <th className="px-3 py-2 eyebrow w-24">Qty</th>
                      <th className="px-3 py-2 eyebrow w-24">Unit</th>
                      <th className="px-3 py-2 eyebrow w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {ingredientFields.map((field, index) => {
                      const selectedId = watchedIngredients[index]?.ingredientId;
                      const selectedIngredient = allIngredients.find(
                        (i) => i.id === selectedId
                      );
                      return (
                        <tr key={field.id} className="hover:bg-stone-50/40">
                          <td className="px-3 py-2 text-stone-300">
                            <GripVertical className="h-4 w-4" />
                          </td>
                          <td className="px-3 py-2">
                            <Controller
                              control={control}
                              name={`ingredients.${index}.ingredientId`}
                              render={({ field: f }) => (
                                <Select
                                  {...f}
                                  error={
                                    !!errors.ingredients?.[index]?.ingredientId
                                  }
                                  className="h-9"
                                >
                                  <option value="">Choose...</option>
                                  {allIngredients.map((ing) => (
                                    <option key={ing.id} value={ing.id}>
                                      {ing.name}
                                    </option>
                                  ))}
                                </Select>
                              )}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.001"
                              className="h-9"
                              {...register(`ingredients.${index}.quantity`)}
                              error={!!errors.ingredients?.[index]?.quantity}
                              placeholder="0"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <Select
                              className="h-9"
                              {...register(`ingredients.${index}.unit`)}
                              defaultValue={selectedIngredient?.unit ?? 'KG'}
                            >
                              {UNITS.map((u) => (
                                <option key={u} value={u}>
                                  {u.toLowerCase()}
                                </option>
                              ))}
                            </Select>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => removeIngredient(index)}
                              className="rounded-md p-1 text-stone-400 hover:bg-red-50 hover:text-danger transition-colors"
                              aria-label="Remove"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* Method / Steps */}
          <SectionCard
            title="Method"
            rightLabel="drag to reorder"
            action={
              <Button
                type="button"
                size="sm"
                onClick={() =>
                  appendStep({
                    stepNumber: stepFields.length + 1,
                    description: '',
                  })
                }
              >
                <Plus className="h-3.5 w-3.5" /> Add step
              </Button>
            }
          >
            {stepFields.length === 0 ? (
              <div className="rounded-xl border border-dashed border-stone-200 py-10 text-center text-stone-400 text-sm">
                No step yet. Document each step of the recipe.
              </div>
            ) : (
              <div className="space-y-3">
                {stepFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-xl border border-stone-200 bg-white p-4 flex items-start gap-3"
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => index > 0 && moveStep(index, index - 1)}
                          disabled={index === 0}
                          className="rounded p-0.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-30"
                          aria-label="Up"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            index < stepFields.length - 1 && moveStep(index, index + 1)
                          }
                          disabled={index === stepFields.length - 1}
                          className="rounded p-0.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-30"
                          aria-label="Down"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <textarea
                        rows={2}
                        className="flex w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500"
                        placeholder={`Describe step ${index + 1}...`}
                        {...register(`steps.${index}.description`)}
                      />
                      {errors.steps?.[index]?.description && (
                        <p className="mt-1 text-xs text-danger">
                          {errors.steps[index].description?.message}
                        </p>
                      )}
                      <input
                        type="hidden"
                        {...register(`steps.${index}.stepNumber`)}
                        value={index + 1}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="rounded-md p-1.5 text-stone-400 hover:bg-red-50 hover:text-danger transition-colors"
                      aria-label="Remove step"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    appendStep({
                      stepNumber: stepFields.length + 1,
                      description: '',
                    })
                  }
                  className="w-full rounded-xl border border-dashed border-stone-300 py-3 text-sm text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors"
                >
                  + Add step {stepFields.length + 1}
                </button>
              </div>
            )}
          </SectionCard>

          {/* Sub-recipes (optional) */}
          <SectionCard
            title="Sub-recipes"
            rightLabel="optional"
            action={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  appendSubRecipe({ subRecipeId: '', quantity: 1 })
                }
              >
                <Plus className="h-3.5 w-3.5" /> Add sub-recipe
              </Button>
            }
          >
            {subRecipeFields.length === 0 ? (
              <div className="rounded-xl border border-dashed border-stone-200 py-8 text-center text-stone-400 text-sm">
                Compose this recipe from other recipes if needed.
              </div>
            ) : (
              <div className="rounded-xl border border-stone-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 bg-stone-50 text-left">
                      <th className="px-3 py-2 eyebrow">Sub-recipe id</th>
                      <th className="px-3 py-2 eyebrow w-24">Qty</th>
                      <th className="px-3 py-2 eyebrow w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {subRecipeFields.map((field, index) => (
                      <tr key={field.id}>
                        <td className="px-3 py-2">
                          <Input
                            className="h-9"
                            {...register(`subRecipes.${index}.subRecipeId`)}
                            placeholder="Sub-recipe ID"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.001"
                            className="h-9"
                            {...register(`subRecipes.${index}.quantity`)}
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => removeSubRecipe(index)}
                            className="rounded-md p-1 text-stone-400 hover:bg-red-50 hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right rail */}
        <aside className="space-y-4 xl:sticky xl:top-32 self-start">
          {/* Live cost */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card">
            <div className="text-2xs font-semibold uppercase tracking-eyebrow text-brand-700">
              Live cost
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-stone-900 tabular-nums">
                €{perServing.toFixed(2)}
              </span>
              <span className="text-xs text-stone-500">per serving</span>
            </div>
            <div className="mt-1 text-xs text-stone-500">
              <span className="font-mono">€{totalCost.toFixed(2)}</span> total · v1
            </div>

            {foodCost !== null && foodCost !== undefined && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">Food-cost</span>
                  <span className="font-medium text-stone-900 tabular-nums">
                    {foodCost.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-stone-100">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      foodCost < 30
                        ? 'bg-brand-500'
                        : foodCost < 40
                        ? 'bg-warning'
                        : 'bg-danger'
                    )}
                    style={{ width: `${Math.min(foodCost, 100)}%` }}
                  />
                </div>
                <div className="mt-1 text-2xs text-stone-400">target ≤ 30%</div>
              </div>
            )}

            {suggestedPrice && !sellingPrice && (
              <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-600">Suggested menu price</span>
                <span className="font-mono font-semibold text-stone-900">
                  €{suggestedPrice.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Scale */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card">
            <div className="font-semibold text-stone-900 mb-3">Scale</div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-600">Servings</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bumpYield(-1)}
                  className="h-8 w-8 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 flex items-center justify-center"
                  aria-label="Decrease"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="font-mono font-semibold text-stone-900 w-8 text-center text-lg">
                  {yieldQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => bumpYield(1)}
                  className="h-8 w-8 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 flex items-center justify-center"
                  aria-label="Increase"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              {[2, 4, 10].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() =>
                    setValue('yieldQuantity', (Number(yieldQuantity) || 1) * m, {
                      shouldDirty: true,
                    })
                  }
                  className="flex-1 text-xs font-medium px-2 py-1.5 rounded-md bg-stone-50 text-stone-700 hover:bg-stone-100 ring-1 ring-inset ring-stone-200"
                >
                  ×{m}
                </button>
              ))}
            </div>
            <p className="mt-3 text-2xs text-stone-500">
              Scales ingredients, cost & nutrition. Steps unchanged.
            </p>
          </div>

          {/* Nutrition placeholder */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card">
            <div className="flex items-baseline justify-between">
              <span className="font-semibold text-stone-900">Nutrition</span>
              <span className="text-2xs uppercase tracking-eyebrow text-stone-400">
                / serving
              </span>
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              {[
                ['kcal', '312'],
                ['protein', '6 g'],
                ['carbs', '34 g'],
                ['fats', '18 g'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <dt className="text-stone-600">{k}</dt>
                  <dd className="font-mono text-stone-900">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Allergens */}
          {recipe && recipe.allergens.length > 0 && (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card">
              <div className="font-semibold text-stone-900 mb-3">Allergens</div>
              <div className="flex flex-wrap gap-2">
                {recipe.allergens.map((a) => (
                  <Badge key={a} variant="allergen" dot>
                    {a.toLowerCase()}
                  </Badge>
                ))}
              </div>
              <p className="mt-3 text-2xs text-stone-500">
                Rolled up automatically from ingredients.
              </p>
            </div>
          )}
        </aside>
      </form>
    </div>
  );
}
