package com.corekitchen.costs.service;

import com.corekitchen.costs.dto.CostLineDto;
import com.corekitchen.costs.dto.RecipeCostDto;
import com.corekitchen.recipes.entity.Recipe;
import com.corekitchen.recipes.entity.RecipeIngredient;
import com.corekitchen.recipes.entity.RecipeSubRecipe;
import com.corekitchen.shared.cost.UnitConverter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CostService {

    private final UnitConverter unitConverter;

    public RecipeCostDto computeCost(Recipe recipe) {
        List<CostLineDto> lines = new ArrayList<>();

        for (RecipeIngredient ri : recipe.getIngredients()) {
            BigDecimal converted = unitConverter.convert(
                    ri.getQuantity(), ri.getUnit(), ri.getIngredient().getUnit());
            if (converted == null) continue;
            BigDecimal lineCost = converted.multiply(ri.getIngredient().getCostPerUnit())
                    .setScale(4, RoundingMode.HALF_UP);
            lines.add(new CostLineDto(ri.getIngredient().getName(), ri.getQuantity(), ri.getUnit(), lineCost));
        }

        for (RecipeSubRecipe sr : recipe.getSubRecipes()) {
            Recipe sub = sr.getSubRecipe();
            if (sub.getYieldQuantity() == null || sub.getYieldQuantity().compareTo(BigDecimal.ZERO) == 0) continue;
            RecipeCostDto subCost = computeCost(sub);
            BigDecimal lineCost = subCost.totalCost()
                    .divide(sub.getYieldQuantity(), 4, RoundingMode.HALF_UP)
                    .multiply(sr.getQuantity())
                    .setScale(4, RoundingMode.HALF_UP);
            lines.add(new CostLineDto(sub.getName(), sr.getQuantity(), "portion", lineCost));
        }

        BigDecimal total = lines.stream()
                .map(CostLineDto::lineCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal perPortion = null;
        if (recipe.getYieldQuantity() != null && recipe.getYieldQuantity().compareTo(BigDecimal.ZERO) > 0) {
            perPortion = total.divide(recipe.getYieldQuantity(), 4, RoundingMode.HALF_UP);
        }

        BigDecimal foodCostPct = null;
        if (recipe.getSellingPrice() != null && recipe.getSellingPrice().compareTo(BigDecimal.ZERO) > 0) {
            foodCostPct = total
                    .divide(recipe.getSellingPrice(), 6, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        return new RecipeCostDto(total, perPortion, foodCostPct, lines);
    }
}
