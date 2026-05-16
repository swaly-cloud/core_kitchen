package com.corekitchen.integrations.usda.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record UsdaFood(
    @JsonProperty("fdcId") String fdcId,
    @JsonProperty("description") String description,
    @JsonProperty("dataType") String dataType,
    @JsonProperty("nutrients") List<UsdaNutrient> nutrients
) {}
