package com.corekitchen.recipes.dto;

import java.util.List;

public record RecipePageResponse(
        List<RecipeDto> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last
) {}
