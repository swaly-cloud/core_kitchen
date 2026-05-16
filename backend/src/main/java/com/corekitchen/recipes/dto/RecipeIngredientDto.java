package com.corekitchen.recipes.dto;

import com.corekitchen.recipes.entity.RecipeIngredient;

import java.math.BigDecimal;
import java.util.UUID;

public record RecipeIngredientDto(
        UUID id,
        UUID ingredientId,
        String ingredientName,
        BigDecimal quantity,
        String unit
) {
    public static RecipeIngredientDto from(RecipeIngredient ri) {
        return new RecipeIngredientDto(
                ri.getId(),
                ri.getIngredient().getId(),
                ri.getIngredient().getName(),
                ri.getQuantity(),
                ri.getUnit()
        );
    }
}
