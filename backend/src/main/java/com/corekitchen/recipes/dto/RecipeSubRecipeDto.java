package com.corekitchen.recipes.dto;

import com.corekitchen.recipes.entity.RecipeSubRecipe;

import java.math.BigDecimal;
import java.util.UUID;

public record RecipeSubRecipeDto(
        UUID id,
        UUID subRecipeId,
        String subRecipeName,
        BigDecimal quantity
) {
    public static RecipeSubRecipeDto from(RecipeSubRecipe rsr) {
        return new RecipeSubRecipeDto(
                rsr.getId(),
                rsr.getSubRecipe().getId(),
                rsr.getSubRecipe().getName(),
                rsr.getQuantity()
        );
    }
}
