package com.corekitchen.recipes.dto;

import com.corekitchen.recipes.entity.RecipeStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateRecipeStatusRequest(
        @NotNull RecipeStatus status
) {}
