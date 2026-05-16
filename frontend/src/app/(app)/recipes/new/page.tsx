'use client';

import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { useCreateRecipe } from '@/hooks/useRecipes';
import { useIngredients } from '@/hooks/useIngredients';

const UNITS = ['KG', 'G', 'L', 'ML', 'CL', 'PIECE', 'BUNCH', 'PORTION'] as const;

const schema = z.object({
  name: z.string().min(1, 'Nom requis').max(255),
  description: z.string().optional(),
  category: z.string().max(100).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  yieldQuantity: z.coerce.number().positive('Rendement doit être positif'),
  yieldUnit: z.string().min(1, 'Unité requise'),
  preparationTimeMinutes: z.coerce.number().int().min(0).optional().nullable(),
  cookingTimeMinutes: z.coerce.number().int().min(0).optional().nullable(),
  sellingPrice: z.coerce.number().min(0.01).optional().nullable(),
  ingredients: z.array(z.object({
    ingredientId: z.string().min(1, 'Ingrédient requis'),
    quantity: z.coerce.number().positive('Quantité doit être positive'),
    unit: z.string().min(1),
  })).default([]),
  subRecipes: z.array(z.object({
    subRecipeId: z.string().min(1, 'Sous-recette requise'),
    quantity: z.coerce.number().positive('Quantité doit être positive'),
  })).default([]),
  steps: z.array(z.object({
    stepNumber: z.number().int().positive(),
    description: z.string().min(1, 'Description requise'),
  })).default([]),
});

type FormValues = z.infer<typeof schema>;

const SECTION_HEADING = 'text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-2 mb-4';

export default function NewRecipePage() {
  const router = useRouter();
  const createMutation = useCreateRecipe();
  const { data: ingredientsData } = useIngredients({ size: 100, sortBy: 'name', sortDir: 'asc' });
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
    await createMutation.mutateAsync(payload);
    router.push('/recipes');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/recipes')}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux recettes
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Nouvelle recette</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1 — Informations générales */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className={SECTION_HEADING}>Informations générales</h2>
          <div className="space-y-4">
            <FormField id="name" label="Nom *" error={errors.name?.message}>
              <Input
                id="name"
                {...register('name')}
                error={!!errors.name}
                placeholder="Ex : Beurre blanc"
              />
            </FormField>

            <FormField id="description" label="Description" error={errors.description?.message}>
              <textarea
                id="description"
                {...register('description')}
                rows={3}
                className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
                placeholder="Décrivez la recette…"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField id="category" label="Catégorie" error={errors.category?.message}>
                <Input
                  id="category"
                  {...register('category')}
                  placeholder="Ex : Sauce"
                />
              </FormField>

              <FormField id="status" label="Statut" error={errors.status?.message}>
                <Select id="status" {...register('status')}>
                  <option value="DRAFT">Brouillon</option>
                  <option value="PUBLISHED">Publiée</option>
                  <option value="ARCHIVED">Archivée</option>
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField id="yieldQuantity" label="Rendement *" error={errors.yieldQuantity?.message}>
                <Input
                  id="yieldQuantity"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('yieldQuantity')}
                  error={!!errors.yieldQuantity}
                  placeholder="4"
                />
              </FormField>

              <FormField id="yieldUnit" label="Unité de rendement *" error={errors.yieldUnit?.message}>
                <Input
                  id="yieldUnit"
                  {...register('yieldUnit')}
                  error={!!errors.yieldUnit}
                  placeholder="portions"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField id="preparationTimeMinutes" label="Temps de préparation (min)" error={errors.preparationTimeMinutes?.message}>
                <Input
                  id="preparationTimeMinutes"
                  type="number"
                  min="0"
                  {...register('preparationTimeMinutes')}
                  placeholder="15"
                />
              </FormField>

              <FormField id="cookingTimeMinutes" label="Temps de cuisson (min)" error={errors.cookingTimeMinutes?.message}>
                <Input
                  id="cookingTimeMinutes"
                  type="number"
                  min="0"
                  {...register('cookingTimeMinutes')}
                  placeholder="30"
                />
              </FormField>
            </div>

            <FormField id="sellingPrice" label="Prix de vente (TND)" error={errors.sellingPrice?.message}>
              <Input
                id="sellingPrice"
                type="number"
                min="0"
                step="0.01"
                {...register('sellingPrice')}
                placeholder="Ex : 12.500"
              />
            </FormField>
          </div>
        </div>

        {/* Section 2 — Ingrédients */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className={SECTION_HEADING}>Ingrédients</h2>

          {ingredientFields.length > 0 && (
            <div className="mb-4 overflow-hidden rounded-lg border border-zinc-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                    <th className="px-3 py-2">Ingrédient</th>
                    <th className="px-3 py-2">Quantité</th>
                    <th className="px-3 py-2">Unité</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {ingredientFields.map((field, index) => {
                    const selectedIngredientId = watchedIngredients[index]?.ingredientId;
                    const selectedIngredient = allIngredients.find(i => i.id === selectedIngredientId);
                    return (
                      <tr key={field.id}>
                        <td className="px-3 py-2">
                          <Controller
                            control={control}
                            name={`ingredients.${index}.ingredientId`}
                            render={({ field: f }) => (
                              <Select {...f} error={!!errors.ingredients?.[index]?.ingredientId} className="h-8 text-xs">
                                <option value="">Choisir…</option>
                                {allIngredients.map(ing => (
                                  <option key={ing.id} value={ing.id}>{ing.name}</option>
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
                            className="h-8 text-xs"
                            {...register(`ingredients.${index}.quantity`)}
                            error={!!errors.ingredients?.[index]?.quantity}
                            placeholder="0"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Select
                            className="h-8 text-xs"
                            {...register(`ingredients.${index}.unit`)}
                            defaultValue={selectedIngredient?.unit ?? 'KG'}
                          >
                            {UNITS.map(u => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </Select>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => removeIngredient(index)}
                            className="rounded-md p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
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

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => appendIngredient({ ingredientId: '', quantity: 1, unit: 'KG' })}
          >
            <Plus className="h-4 w-4" />
            Ajouter un ingrédient
          </Button>
        </div>

        {/* Section 3 — Étapes */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className={SECTION_HEADING}>Étapes</h2>

          {stepFields.length > 0 && (
            <div className="mb-4 space-y-2">
              {stepFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => index > 0 && moveStep(index, index - 1)}
                        disabled={index === 0}
                        className="rounded p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 disabled:opacity-30 transition-colors"
                        aria-label="Monter"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => index < stepFields.length - 1 && moveStep(index, index + 1)}
                        disabled={index === stepFields.length - 1}
                        className="rounded p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 disabled:opacity-30 transition-colors"
                        aria-label="Descendre"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <textarea
                      rows={2}
                      className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
                      placeholder={`Décrire l'étape ${index + 1}…`}
                      {...register(`steps.${index}.description`)}
                    />
                    {errors.steps?.[index]?.description && (
                      <p className="mt-1 text-xs text-red-600">{errors.steps[index].description?.message}</p>
                    )}
                    <input type="hidden" {...register(`steps.${index}.stepNumber`)} value={index + 1} />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    aria-label="Supprimer l'étape"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => appendStep({ stepNumber: stepFields.length + 1, description: '' })}
          >
            <Plus className="h-4 w-4" />
            Ajouter une étape
          </Button>
        </div>

        {/* Section 4 — Sous-recettes */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className={SECTION_HEADING}>Sous-recettes (optionnel)</h2>

          {subRecipeFields.length > 0 && (
            <div className="mb-4 overflow-hidden rounded-lg border border-zinc-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                    <th className="px-3 py-2">Sous-recette</th>
                    <th className="px-3 py-2">Quantité</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {subRecipeFields.map((field, index) => (
                    <tr key={field.id}>
                      <td className="px-3 py-2">
                        <Input
                          className="h-8 text-xs"
                          {...register(`subRecipes.${index}.subRecipeId`)}
                          placeholder="ID de la sous-recette"
                          error={!!errors.subRecipes?.[index]?.subRecipeId}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.001"
                          className="h-8 text-xs"
                          {...register(`subRecipes.${index}.quantity`)}
                          error={!!errors.subRecipes?.[index]?.quantity}
                          placeholder="1"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeSubRecipe(index)}
                          className="rounded-md p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
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

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => appendSubRecipe({ subRecipeId: '', quantity: 1 })}
          >
            <Plus className="h-4 w-4" />
            Ajouter une sous-recette
          </Button>
        </div>

        {/* Form actions */}
        <div className="flex items-center justify-end gap-3 rounded-xl border border-zinc-200 bg-white px-6 py-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/recipes')}
            disabled={createMutation.isPending}
          >
            Annuler
          </Button>
          <Button type="submit" loading={createMutation.isPending}>
            Enregistrer
          </Button>
        </div>
      </form>
    </div>
  );
}
