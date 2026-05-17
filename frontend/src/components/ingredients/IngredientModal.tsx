'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogCloseButton,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { ALLERGEN_LABELS } from './AllergenBadge';
import { useCreateIngredient, useUpdateIngredient } from '@/hooks/useIngredients';
import type { Ingredient, Unit, Allergen } from '@/types';

const UNITS: { value: Unit; label: string }[] = [
  { value: 'KG', label: 'Kilogram (kg)' },
  { value: 'G', label: 'Gram (g)' },
  { value: 'L', label: 'Liter (L)' },
  { value: 'ML', label: 'Milliliter (ml)' },
  { value: 'CL', label: 'Centiliter (cl)' },
  { value: 'PIECE', label: 'Piece' },
  { value: 'BUNCH', label: 'Bunch' },
  { value: 'PORTION', label: 'Portion' },
];

const ALL_ALLERGENS = Object.keys(ALLERGEN_LABELS) as Allergen[];

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  unit: z.enum(['KG', 'G', 'L', 'ML', 'CL', 'PIECE', 'BUNCH', 'PORTION'] as const),
  costPerUnit: z.coerce.number().min(0, 'Cost must be positive'),
  category: z.string().optional(),
  supplier: z.string().optional(),
  allergens: z.array(z.enum(['GLUTEN', 'CRUSTACEANS', 'EGGS', 'FISH', 'PEANUTS', 'SOYBEANS', 'MILK', 'NUTS', 'CELERY', 'MUSTARD', 'SESAME', 'SULPHITES', 'LUPIN', 'MOLLUSCS'] as const)).optional(),
});

type FormValues = z.infer<typeof schema>;

interface IngredientModalProps {
  open: boolean;
  onClose: () => void;
  ingredient?: Ingredient;
  /** Pre-filled name from USDA import */
  initialName?: string;
}

export function IngredientModal({ open, onClose, ingredient, initialName }: IngredientModalProps) {
  const isEdit = !!ingredient;
  const createMutation = useCreateIngredient();
  const updateMutation = useUpdateIngredient();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      unit: 'KG',
      costPerUnit: 0,
      category: '',
      supplier: '',
      allergens: [],
    },
  });

  useEffect(() => {
    if (open && ingredient) {
      reset({
        name: ingredient.name,
        unit: ingredient.unit,
        costPerUnit: ingredient.costPerUnit,
        category: ingredient.category ?? '',
        supplier: ingredient.supplier ?? '',
        allergens: ingredient.allergens,
      });
    } else if (open && !ingredient) {
      reset({
        name: initialName ?? '',
        unit: 'KG',
        costPerUnit: 0,
        category: '',
        supplier: '',
        allergens: [],
      });
    }
  }, [open, ingredient, initialName, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      unit: values.unit,
      costPerUnit: values.costPerUnit,
      category: values.category || undefined,
      supplier: values.supplier || undefined,
      allergens: values.allergens,
    };

    if (isEdit) {
      await updateMutation.mutateAsync({ id: ingredient.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit ingredient' : initialName ? `Import "${initialName}"` : 'New ingredient'}
          </DialogTitle>
          <DialogCloseButton onClose={onClose} />
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5 px-6 py-6">
            {initialName && !isEdit && (
              <div className="rounded-lg border border-brand-200 bg-brand-50/60 px-4 py-3 text-sm text-brand-700">
                Imported from USDA FoodData Central — complete the cost and unit fields.
              </div>
            )}

            <FormField id="name" label="Name *" error={errors.name?.message}>
              <Input
                id="name"
                {...register('name')}
                error={!!errors.name}
                placeholder="Ex: Butter, unsalted AOP"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField id="unit" label="Unit *" error={errors.unit?.message}>
                <Select id="unit" {...register('unit')} error={!!errors.unit}>
                  {UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                id="costPerUnit"
                label="Cost / unit (TND) *"
                error={errors.costPerUnit?.message}
              >
                <Input
                  id="costPerUnit"
                  type="number"
                  step="0.0001"
                  min="0"
                  {...register('costPerUnit')}
                  error={!!errors.costPerUnit}
                  placeholder="0.0000"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="category"
                label="Category"
                error={errors.category?.message}
                optional
              >
                <Input
                  id="category"
                  {...register('category')}
                  placeholder="Dairy"
                />
              </FormField>

              <FormField
                id="supplier"
                label="Supplier"
                error={errors.supplier?.message}
                optional
              >
                <Input
                  id="supplier"
                  {...register('supplier')}
                  placeholder="Bellevaire"
                />
              </FormField>
            </div>

            <div>
              <div className="text-2xs font-semibold uppercase tracking-eyebrow text-stone-500 mb-2">
                Allergens
              </div>
              <Controller
                name="allergens"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-lg border border-stone-200 p-3 bg-stone-50/40">
                    {ALL_ALLERGENS.map((allergen) => {
                      const checked = field.value?.includes(allergen) ?? false;
                      return (
                        <label
                          key={allergen}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-stone-300 text-brand-500 focus:ring-2 focus:ring-brand-500/30"
                            checked={checked}
                            onChange={(e) => {
                              const current = field.value ?? [];
                              if (e.target.checked) {
                                field.onChange([...current, allergen]);
                              } else {
                                field.onChange(current.filter((a) => a !== allergen));
                              }
                            }}
                          />
                          <span className="text-sm text-stone-700 capitalize">
                            {ALLERGEN_LABELS[allergen]}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              {isEdit ? 'Save changes' : 'Add ingredient'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
