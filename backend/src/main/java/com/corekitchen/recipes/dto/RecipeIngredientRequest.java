package com.corekitchen.recipes.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record RecipeIngredientRequest(
        @NotNull UUID ingredientId,
        @NotNull @DecimalMin("0.0001") BigDecimal quantity,
        @NotBlank String unit
) {}
