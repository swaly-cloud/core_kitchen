'use client';

import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { useCreateRecipe } from '@/hooks/useRecipes';
import { useIngredients } from '@/hooks/useIngredients';

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
        quantity: z.coerce.number().positive(),
        unit: z.string().min(1),
      })
    )
    .default([]),
  subRecipes: z
    .array(
      z.object({
        subRecipeId: z.string().min(1),
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

export default function NewRecipePage() {
  const router = useRouter();
  const createMutation = useCreateRecipe();
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
    formState: { errors },
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

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({ control, name: 'ingredients' });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
    move: moveStep,
  } = useFieldArray({ control, name: 'steps' });

  const watchedIngredients = watch('ingredients');

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      status: values.status,
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
    const newRecipe = await createMutation.mutateAsync(payload);
    router.push(`/recipes/${newRecipe.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Sticky header */}
      <div className="sticky top-16 z-20 -mx-4 sm:-mx-6 lg:-mx-10 -mt-6 lg:-mt-8 mb-2 px-4 sm:px-6 lg:px-10 py-3 bg-cream-100/95 backdrop-blur border-b border-stone-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push('/recipes')}
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
              <span className="font-medium text-stone-900">New recipe</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/recipes')}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit(onSubmit)}
              loading={createMutation.isPending}
            >
              Create recipe
            </Button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
        <SectionCard title="Basics" rightLabel="Section 1 / 3">
          <div className="space-y-5">
            <FormField id="name" label="Recipe name *" error={errors.name?.message}>
              <Input
                id="name"
                {...register('name')}
                error={!!errors.name}
                placeholder="Ex: Tarte au citron"
              />
            </FormField>

            <FormField
              id="description"
              label="Description"
              error={errors.description?.message}
              optional
            >
              <textarea
                id="description"
                {...register('description')}
                rows={3}
                className="flex w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500"
                placeholder="Describe the recipe..."
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField id="category" label="Category" optional>
                <Input
                  id="category"
                  {...register('category')}
                  placeholder="Pastry"
                />
              </FormField>
              <FormField id="status" label="Status">
                <Select id="status" {...register('status')}>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Live</option>
                  <option value="ARCHIVED">Archived</option>
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="yieldQuantity"
                label="Yield *"
                error={errors.yieldQuantity?.message}
              >
                <Input
                  id="yieldQuantity"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('yieldQuantity')}
                  error={!!errors.yieldQuantity}
                />
              </FormField>
              <FormField
                id="yieldUnit"
                label="Yield unit *"
                error={errors.yieldUnit?.message}
              >
                <Input
                  id="yieldUnit"
                  {...register('yieldUnit')}
                  error={!!errors.yieldUnit}
                  placeholder="portions"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField id="preparationTimeMinutes" label="Prep time" optional>
                <div className="relative">
                  <Input
                    id="preparationTimeMinutes"
                    type="number"
                    min="0"
                    {...register('preparationTimeMinutes')}
                    placeholder="15"
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs uppercase tracking-eyebrow text-stone-400">
                    min
                  </span>
                </div>
              </FormField>
              <FormField id="cookingTimeMinutes" label="Cook time" optional>
                <div className="relative">
                  <Input
                    id="cookingTimeMinutes"
                    type="number"
                    min="0"
                    {...register('cookingTimeMinutes')}
                    placeholder="30"
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs uppercase tracking-eyebrow text-stone-400">
                    min
                  </span>
                </div>
              </FormField>
            </div>

            <FormField id="sellingPrice" label="Selling price (TND)" optional>
              <Input
                id="sellingPrice"
                type="number"
                min="0"
                step="0.01"
                {...register('sellingPrice')}
                placeholder="8.50"
              />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard
          title="Ingredients"
          rightLabel={`${ingredientFields.length} items`}
          action={
            <Button
              type="button"
              size="sm"
              onClick={() =>
                appendIngredient({ ingredientId: '', quantity: 1, unit: 'KG' })
              }
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          }
        >
          {ingredientFields.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-200 py-10 text-center text-stone-400 text-sm">
              No ingredient yet.
            </div>
          ) : (
            <div className="rounded-xl border border-stone-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50 text-left">
                    <th className="px-3 py-2 w-6"></th>
                    <th className="px-3 py-2 eyebrow">Ingredient</th>
                    <th className="px-3 py-2 eyebrow w-24">Qty</th>
                    <th className="px-3 py-2 eyebrow w-24">Unit</th>
                    <th className="px-3 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {ingredientFields.map((field, index) => {
                    const selectedId = watchedIngredients[index]?.ingredientId;
                    const selectedIngredient = allIngredients.find(
                      (i) => i.id === selectedId
                    );
                    return (
                      <tr key={field.id}>
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
                                className="h-9"
                                error={!!errors.ingredients?.[index]?.ingredientId}
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
                            className="rounded-md p-1 text-stone-400 hover:bg-red-50 hover:text-danger"
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
              Document each step of the recipe.
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
                        className="rounded p-0.5 text-stone-400 hover:bg-stone-100 disabled:opacity-30"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          index < stepFields.length - 1 &&
                          moveStep(index, index + 1)
                        }
                        disabled={index === stepFields.length - 1}
                        className="rounded p-0.5 text-stone-400 hover:bg-stone-100 disabled:opacity-30"
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
                    className="rounded-md p-1.5 text-stone-400 hover:bg-red-50 hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </form>
    </div>
  );
}
