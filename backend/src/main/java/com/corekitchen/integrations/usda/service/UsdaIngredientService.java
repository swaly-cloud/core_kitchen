package com.corekitchen.integrations.usda.service;

import com.corekitchen.integrations.usda.client.UsdaFdcClient;
import com.corekitchen.integrations.usda.dto.UsdaFood;
import com.corekitchen.integrations.usda.dto.UsdaIngredientDto;
import com.corekitchen.integrations.usda.dto.UsdaSearchResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsdaIngredientService {

    private final UsdaFdcClient usdaFdcClient;

    public List<UsdaIngredientDto> searchIngredients(String query, int pageNumber, int pageSize) {
        UsdaSearchResponse response = usdaFdcClient.searchFoods(query, pageNumber, pageSize);

        if (response.foods() == null) {
            return List.of();
        }

        return response.foods().stream()
            .map(food -> new UsdaIngredientDto(
                food.fdcId(),
                food.description(),
                food.dataType()
            ))
            .collect(Collectors.toList());
    }

    public UsdaFood getFoodDetails(String fdcId) {
        return usdaFdcClient.getFoodById(fdcId);
    }
}
