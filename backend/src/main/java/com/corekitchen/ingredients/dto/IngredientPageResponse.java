package com.corekitchen.ingredients.dto;

import java.util.List;

public record IngredientPageResponse(
        List<IngredientDto> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last
) {
}
