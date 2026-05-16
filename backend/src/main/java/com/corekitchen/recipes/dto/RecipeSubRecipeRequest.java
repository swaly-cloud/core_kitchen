package com.corekitchen.recipes.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record RecipeSubRecipeRequest(
        @NotNull UUID subRecipeId,
        @NotNull @DecimalMin("0.0001") BigDecimal quantity
) {}
