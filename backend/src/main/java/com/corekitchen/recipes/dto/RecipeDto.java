package com.corekitchen.recipes.dto;

import com.corekitchen.recipes.entity.Recipe;
import com.corekitchen.recipes.entity.RecipeStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record RecipeDto(
        UUID id,
        String name,
        String description,
        RecipeStatus status,
        BigDecimal yieldQuantity,
        String yieldUnit,
        Integer preparationTimeMinutes,
        Integer cookingTimeMinutes,
        String category,
        BigDecimal sellingPrice,
        List<RecipeIngredientDto> ingredients,
        List<RecipeSubRecipeDto> subRecipes,
        List<RecipeStepDto> steps,
        Set<String> allergens,
        UUID organizationId,
        Instant createdAt,
        Instant updatedAt
) {
    public static RecipeDto from(Recipe r) {
        Set<String> allergens = r.getIngredients().stream()
                .flatMap(ri -> ri.getIngredient().getAllergens().stream())
                .map(Enum::name)
                .collect(Collectors.toSet());

        return new RecipeDto(
                r.getId(),
                r.getName(),
                r.getDescription(),
                r.getStatus(),
                r.getYieldQuantity(),
                r.getYieldUnit(),
                r.getPreparationTimeMinutes(),
                r.getCookingTimeMinutes(),
                r.getCategory(),
                r.getSellingPrice(),
                r.getIngredients().stream().map(RecipeIngredientDto::from).toList(),
                r.getSubRecipes().stream().map(RecipeSubRecipeDto::from).toList(),
                r.getSteps().stream().map(RecipeStepDto::from).toList(),
                allergens,
                r.getOrganization().getId(),
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }
}
