package com.corekitchen.ingredients.controller;

import com.corekitchen.auth.jwt.AuthenticatedUser;
import com.corekitchen.ingredients.dto.CreateIngredientRequest;
import com.corekitchen.ingredients.dto.IngredientDto;
import com.corekitchen.ingredients.dto.IngredientPageResponse;
import com.corekitchen.ingredients.dto.UpdateIngredientRequest;
import com.corekitchen.ingredients.service.IngredientService;
import com.corekitchen.integrations.usda.dto.UsdaFood;
import com.corekitchen.integrations.usda.dto.UsdaIngredientDto;
import com.corekitchen.integrations.usda.service.UsdaIngredientService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ingredients")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Ingredients", description = "Ingredient management")
public class IngredientController {

    private final IngredientService ingredientService;
    private final UsdaIngredientService usdaIngredientService;

    @GetMapping
    public IngredientPageResponse list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return ingredientService.list(page, size, search, category, sortBy, sortDir, principal.organizationId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IngredientDto create(
            @Valid @RequestBody CreateIngredientRequest req,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return ingredientService.create(req, principal.organizationId());
    }

    @GetMapping("/{id}")
    public IngredientDto get(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return ingredientService.getById(id, principal.organizationId());
    }

    @PutMapping("/{id}")
    public IngredientDto update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateIngredientRequest req,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return ingredientService.update(id, req, principal.organizationId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        ingredientService.delete(id, principal.organizationId());
    }

    @GetMapping("/usda/search")
    public List<UsdaIngredientDto> searchUsda(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "20") int pageSize,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return usdaIngredientService.searchIngredients(query, pageNumber, pageSize);
    }

    @GetMapping("/usda/{fdcId}")
    public UsdaFood getUsdaFood(
            @PathVariable String fdcId,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return usdaIngredientService.getFoodDetails(fdcId);
    }
}
