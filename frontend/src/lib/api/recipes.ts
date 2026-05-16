import { api } from './client';
import type { Recipe, RecipePage, CreateRecipeRequest, UpdateRecipeRequest, RecipeStatus } from '@/types';

export interface RecipeListParams {
  page?: number;
  size?: number;
  search?: string;
  status?: RecipeStatus | '';
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const recipesApi = {
  list: (params: RecipeListParams = {}) =>
    api.get<RecipePage>('/api/recipes', { params }).then(r => r.data),
  get: (id: string) =>
    api.get<Recipe>(`/api/recipes/${id}`).then(r => r.data),
  create: (data: CreateRecipeRequest) =>
    api.post<Recipe>('/api/recipes', data).then(r => r.data),
  update: (id: string, data: UpdateRecipeRequest) =>
    api.put<Recipe>(`/api/recipes/${id}`, data).then(r => r.data),
  updateStatus: (id: string, status: RecipeStatus) =>
    api.patch<Recipe>(`/api/recipes/${id}/status`, { status }).then(r => r.data),
  delete: (id: string) =>
    api.delete(`/api/recipes/${id}`),
};
