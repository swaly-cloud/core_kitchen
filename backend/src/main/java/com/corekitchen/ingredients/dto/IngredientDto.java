package com.corekitchen.ingredients.dto;

import com.corekitchen.ingredients.entity.Allergen;
import com.corekitchen.ingredients.entity.Ingredient;
import com.corekitchen.ingredients.entity.Unit;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record IngredientDto(
        UUID id,
        String name,
        Unit unit,
        BigDecimal costPerUnit,
        String category,
        String supplier,
        Set<Allergen> allergens,
        UUID organizationId,
        Instant createdAt,
        Instant updatedAt
) {
    public static IngredientDto from(Ingredient i) {
        return new IngredientDto(
                i.getId(),
                i.getName(),
                i.getUnit(),
                i.getCostPerUnit(),
                i.getCategory(),
                i.getSupplier(),
                i.getAllergens(),
                i.getOrganization().getId(),
                i.getCreatedAt(),
                i.getUpdatedAt()
        );
    }
}
