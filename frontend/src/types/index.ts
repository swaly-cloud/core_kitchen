export type Role = "ADMIN" | "CHEF" | "VIEWER";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  organizationId: string;
  organizationName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: { field: string; message: string }[];
}

export type Unit = 'KG' | 'G' | 'L' | 'ML' | 'CL' | 'PIECE' | 'BUNCH' | 'PORTION';

export type Allergen =
  | 'GLUTEN' | 'CRUSTACEANS' | 'EGGS' | 'FISH' | 'PEANUTS'
  | 'SOYBEANS' | 'MILK' | 'NUTS' | 'CELERY' | 'MUSTARD'
  | 'SESAME' | 'SULPHITES' | 'LUPIN' | 'MOLLUSCS';

export interface Ingredient {
  id: string;
  name: string;
  unit: Unit;
  costPerUnit: number;
  category: string | null;
  supplier: string | null;
  allergens: Allergen[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IngredientPage {
  content: Ingredient[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface CreateIngredientRequest {
  name: string;
  unit: Unit;
  costPerUnit: number;
  category?: string;
  supplier?: string;
  allergens?: Allergen[];
}

export type UpdateIngredientRequest = CreateIngredientRequest;

export type RecipeStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface RecipeIngredient {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
}

export interface RecipeSubRecipe {
  id: string;
  subRecipeId: string;
  subRecipeName: string;
  quantity: number;
}

export interface RecipeStep {
  id: string;
  stepNumber: number;
  description: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string | null;
  status: RecipeStatus;
  yieldQuantity: number;
  yieldUnit: string;
  preparationTimeMinutes: number | null;
  cookingTimeMinutes: number | null;
  category: string | null;
  ingredients: RecipeIngredient[];
  subRecipes: RecipeSubRecipe[];
  steps: RecipeStep[];
  allergens: string[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecipePage {
  content: Recipe[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface CreateRecipeRequest {
  name: string;
  description?: string;
  status?: RecipeStatus;
  yieldQuantity: number;
  yieldUnit: string;
  preparationTimeMinutes?: number;
  cookingTimeMinutes?: number;
  category?: string;
  ingredients?: { ingredientId: string; quantity: number; unit: string }[];
  subRecipes?: { subRecipeId: string; quantity: number }[];
  steps?: { stepNumber: number; description: string }[];
}

export type UpdateRecipeRequest = CreateRecipeRequest;
