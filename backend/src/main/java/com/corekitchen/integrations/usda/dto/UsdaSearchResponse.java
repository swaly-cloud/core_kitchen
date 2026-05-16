package com.corekitchen.integrations.usda.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record UsdaSearchResponse(
    @JsonProperty("foods") List<UsdaFood> foods,
    @JsonProperty("totalHits") Integer totalHits,
    @JsonProperty("currentPage") Integer currentPage,
    @JsonProperty("pageSize") Integer pageSize
) {}
