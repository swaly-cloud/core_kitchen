package com.corekitchen.recipes.dto;

import com.corekitchen.recipes.entity.RecipeStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record CreateRecipeRequest(
        @NotBlank @Size(max = 255) String name,
        String description,
        RecipeStatus status,
        @NotNull @DecimalMin("0.001") BigDecimal yieldQuantity,
        @NotBlank String yieldUnit,
        @Min(0) Integer preparationTimeMinutes,
        @Min(0) Integer cookingTimeMinutes,
        @Size(max = 100) String category,
        @DecimalMin("0.01") BigDecimal sellingPrice,
        @Valid List<RecipeIngredientRequest> ingredients,
        @Valid List<RecipeSubRecipeRequest> subRecipes,
        @Valid List<RecipeStepRequest> steps
) {}
