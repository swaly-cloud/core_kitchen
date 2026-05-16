package com.corekitchen.recipes.dto;

import com.corekitchen.recipes.entity.RecipeStep;

import java.util.UUID;

public record RecipeStepDto(
        UUID id,
        int stepNumber,
        String description
) {
    public static RecipeStepDto from(RecipeStep rs) {
        return new RecipeStepDto(
                rs.getId(),
                rs.getStepNumber(),
                rs.getDescription()
        );
    }
}
