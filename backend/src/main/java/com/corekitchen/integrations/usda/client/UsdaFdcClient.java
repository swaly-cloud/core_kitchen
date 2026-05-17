package com.corekitchen.integrations.usda.client;

import com.corekitchen.integrations.usda.dto.UsdaFood;
import com.corekitchen.integrations.usda.dto.UsdaSearchResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Slf4j
@Component
public class UsdaFdcClient {

    private static final String USDA_API_BASE_URL = "https://api.nal.usda.gov/fdc/v1";

    @org.springframework.beans.factory.annotation.Value("${usda.api.key:DEMO_KEY}")
    private String apiKey;

    private final RestClient restClient;

    public UsdaFdcClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder
            .baseUrl(USDA_API_BASE_URL)
            .build();
    }

    public UsdaSearchResponse searchFoods(String query, int pageNumber, int pageSize) {
        try {
            return restClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/foods/search")
                    .queryParam("api_key", apiKey)
                    .queryParam("query", query)
                    .queryParam("pageNumber", pageNumber)
                    .queryParam("pageSize", pageSize)
                    .build())
                .retrieve()
                .body(UsdaSearchResponse.class);
        } catch (RestClientException e) {
            log.error("Error searching USDA foods for query: {}", query, e);
            return new UsdaSearchResponse(java.util.List.of(), 0, 0, pageSize);
        }
    }

    public UsdaFood getFoodById(String fdcId) {
        try {
            return restClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/food/{fdcId}")
                    .queryParam("api_key", apiKey)
                    .build(fdcId))
                .retrieve()
                .body(UsdaFood.class);
        } catch (RestClientException e) {
            log.error("Error fetching USDA food with ID: {}", fdcId, e);
            return null;
        }
    }
}
