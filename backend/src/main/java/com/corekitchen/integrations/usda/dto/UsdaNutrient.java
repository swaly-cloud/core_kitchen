package com.corekitchen.integrations.usda.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UsdaNutrient(
    @JsonProperty("nutrientId") Long nutrientId,
    @JsonProperty("name") String name,
    @JsonProperty("amount") Double amount,
    @JsonProperty("unitName") String unitName
) {}
