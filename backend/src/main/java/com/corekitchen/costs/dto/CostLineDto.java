package com.corekitchen.costs.dto;

import java.math.BigDecimal;

public record CostLineDto(
        String name,
        BigDecimal quantity,
        String unit,
        BigDecimal lineCost
) {}
