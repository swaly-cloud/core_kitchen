package com.corekitchen.ingredients.dto;

import com.corekitchen.ingredients.entity.Allergen;
import com.corekitchen.ingredients.entity.Unit;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.Set;

public record CreateIngredientRequest(
        @NotBlank @Size(max = 255) String name,
        @NotNull Unit unit,
        @NotNull @DecimalMin("0") BigDecimal costPerUnit,
        @Size(max = 100) String category,
        @Size(max = 255) String supplier,
        Set<Allergen> allergens
) {
    public Set<Allergen> allergens() {
        return allergens != null ? allergens : Set.of();
    }
}
