import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { recipesApi, type RecipeListParams } from '@/lib/api/recipes';
import type { CreateRecipeRequest, UpdateRecipeRequest, RecipeStatus } from '@/types';

export function useRecipes(params: RecipeListParams = {}) {
  return useQuery({
    queryKey: ['recipes', params],
    queryFn: () => recipesApi.list(params),
  });
}

export function useRecipe(id: string | null) {
  return useQuery({
    queryKey: ['recipes', id],
    queryFn: () => recipesApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecipeRequest) => recipesApi.create(data),
    onSuccess: () => {
      toast.success('Recette créée');
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    onError: () => {
      toast.error('Erreur lors de la création');
    },
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecipeRequest }) =>
      recipesApi.update(id, data),
    onSuccess: (_data, variables) => {
      toast.success('Recette mise à jour');
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipes', variables.id] });
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });
}

export function useUpdateRecipeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RecipeStatus }) =>
      recipesApi.updateStatus(id, status),
    onSuccess: (_data, variables) => {
      toast.success('Statut mis à jour');
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipes', variables.id] });
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du statut');
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recipesApi.delete(id),
    onSuccess: () => {
      toast.success('Recette supprimée');
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });
}
