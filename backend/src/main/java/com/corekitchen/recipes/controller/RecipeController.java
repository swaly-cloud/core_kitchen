package com.corekitchen.recipes.controller;

import com.corekitchen.auth.jwt.AuthenticatedUser;
import com.corekitchen.recipes.dto.*;
import com.corekitchen.recipes.service.RecipeService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Recipes", description = "Recipe management")
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping
    public RecipePageResponse list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return recipeService.list(page, size, search, status, sortBy, sortDir, principal.organizationId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecipeDto create(
            @Valid @RequestBody CreateRecipeRequest req,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return recipeService.create(req, principal.organizationId());
    }

    @GetMapping("/{id}")
    public RecipeDto get(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return recipeService.getById(id, principal.organizationId());
    }

    @PutMapping("/{id}")
    public RecipeDto update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRecipeRequest req,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return recipeService.update(id, req, principal.organizationId());
    }

    @PatchMapping("/{id}/status")
    public RecipeDto updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRecipeStatusRequest req,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        return recipeService.updateStatus(id, req, principal.organizationId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        recipeService.delete(id, principal.organizationId());
    }
}
