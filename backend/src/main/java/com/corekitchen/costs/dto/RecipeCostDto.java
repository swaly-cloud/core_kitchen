package com.corekitchen.costs.dto;

import java.math.BigDecimal;
import java.util.List;

public record RecipeCostDto(
        BigDecimal totalCost,
        BigDecimal costPerPortion,
        BigDecimal foodCostPercentage,
        List<CostLineDto> lines
) {}
