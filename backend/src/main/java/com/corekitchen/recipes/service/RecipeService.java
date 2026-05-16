package com.corekitchen.recipes.service;

import com.corekitchen.ingredients.entity.Ingredient;
import com.corekitchen.ingredients.repository.IngredientRepository;
import com.corekitchen.organizations.entity.Organization;
import com.corekitchen.organizations.repository.OrganizationRepository;
import com.corekitchen.recipes.dto.*;
import com.corekitchen.recipes.entity.*;
import com.corekitchen.recipes.repository.RecipeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final OrganizationRepository organizationRepository;
    private final IngredientRepository ingredientRepository;

    public RecipePageResponse list(int page, int size, String search, String statusStr,
                                   String sortBy, String sortDir, UUID orgId) {
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String effectiveSortBy = (sortBy != null && !sortBy.isBlank()) ? sortBy : "name";
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, effectiveSortBy));

        RecipeStatus status = null;
        if (statusStr != null && !statusStr.isBlank()) {
            try {
                status = RecipeStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // treat unknown status string as no filter
            }
        }

        boolean hasSearch = search != null && !search.isBlank();

        Page<Recipe> result;
        if (hasSearch && status != null) {
            result = recipeRepository.findByOrganizationIdAndStatusAndNameContainingIgnoreCase(orgId, status, search, pageable);
        } else if (hasSearch) {
            result = recipeRepository.findByOrganizationIdAndNameContainingIgnoreCase(orgId, search, pageable);
        } else if (status != null) {
            result = recipeRepository.findByOrganizationIdAndStatus(orgId, status, pageable);
        } else {
            result = recipeRepository.findByOrganizationId(orgId, pageable);
        }

        List<RecipeDto> content = result.getContent().stream()
                .map(RecipeDto::from)
                .toList();

        return new RecipePageResponse(
                content,
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        );
    }

    public RecipeDto getById(UUID id, UUID orgId) {
        return RecipeDto.from(findEntityById(id, orgId));
    }

    public Recipe findEntityById(UUID id, UUID orgId) {
        return recipeRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new EntityNotFoundException("Recipe not found: " + id));
    }

    @Transactional
    public RecipeDto create(CreateRecipeRequest req, UUID orgId) {
        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new EntityNotFoundException("Organization not found: " + orgId));

        Recipe recipe = new Recipe();
        recipe.setOrganization(organization);
        applyFields(recipe, req.name(), req.description(), req.status(), req.yieldQuantity(),
                req.yieldUnit(), req.preparationTimeMinutes(), req.cookingTimeMinutes(), req.category(),
                req.sellingPrice());

        applyIngredients(recipe, req.ingredients(), orgId);
        applySubRecipes(recipe, req.subRecipes(), orgId, null);
        applySteps(recipe, req.steps());

        Recipe saved = recipeRepository.saveAndFlush(recipe);
        return RecipeDto.from(saved);
    }

    @Transactional
    public RecipeDto update(UUID id, UpdateRecipeRequest req, UUID orgId) {
        Recipe recipe = recipeRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new EntityNotFoundException("Recipe not found: " + id));

        applyFields(recipe, req.name(), req.description(), req.status(), req.yieldQuantity(),
                req.yieldUnit(), req.preparationTimeMinutes(), req.cookingTimeMinutes(), req.category(),
                req.sellingPrice());

        recipe.getIngredients().clear();
        recipe.getSubRecipes().clear();
        recipe.getSteps().clear();
        recipeRepository.flush();

        applyIngredients(recipe, req.ingredients(), orgId);
        applySubRecipes(recipe, req.subRecipes(), orgId, id);
        applySteps(recipe, req.steps());

        Recipe saved = recipeRepository.saveAndFlush(recipe);
        return RecipeDto.from(saved);
    }

    @Transactional
    public RecipeDto updateStatus(UUID id, UpdateRecipeStatusRequest req, UUID orgId) {
        Recipe recipe = recipeRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new EntityNotFoundException("Recipe not found: " + id));
        recipe.setStatus(req.status());
        Recipe saved = recipeRepository.saveAndFlush(recipe);
        return RecipeDto.from(saved);
    }

    @Transactional
    public void delete(UUID id, UUID orgId) {
        if (!recipeRepository.existsByIdAndOrganizationId(id, orgId)) {
            throw new EntityNotFoundException("Recipe not found: " + id);
        }
        recipeRepository.deleteById(id);
    }

    // --- private helpers ---

    private void applyFields(Recipe recipe, String name, String description, RecipeStatus status,
                              java.math.BigDecimal yieldQuantity, String yieldUnit,
                              Integer preparationTimeMinutes, Integer cookingTimeMinutes,
                              String category, java.math.BigDecimal sellingPrice) {
        recipe.setName(name);
        recipe.setDescription(description);
        recipe.setStatus(status != null ? status : RecipeStatus.DRAFT);
        recipe.setYieldQuantity(yieldQuantity);
        recipe.setYieldUnit(yieldUnit);
        recipe.setPreparationTimeMinutes(preparationTimeMinutes);
        recipe.setCookingTimeMinutes(cookingTimeMinutes);
        recipe.setCategory(category);
        recipe.setSellingPrice(sellingPrice);
    }

    private void applyIngredients(Recipe recipe, List<RecipeIngredientRequest> reqs, UUID orgId) {
        recipe.getIngredients().clear();
        if (reqs == null) return;
        for (var req : reqs) {
            Ingredient ing = ingredientRepository.findByIdAndOrganizationId(req.ingredientId(), orgId)
                    .orElseThrow(() -> new EntityNotFoundException("Ingredient not found: " + req.ingredientId()));
            RecipeIngredient ri = new RecipeIngredient();
            ri.setRecipe(recipe);
            ri.setIngredient(ing);
            ri.setQuantity(req.quantity());
            ri.setUnit(req.unit());
            recipe.getIngredients().add(ri);
        }
    }

    private void applySubRecipes(Recipe recipe, List<RecipeSubRecipeRequest> reqs, UUID orgId, UUID selfId) {
        recipe.getSubRecipes().clear();
        if (reqs == null) return;
        for (var req : reqs) {
            if (selfId != null && selfId.equals(req.subRecipeId())) {
                throw new IllegalArgumentException("A recipe cannot reference itself as a sub-recipe");
            }
            Recipe subRecipe = recipeRepository.findByIdAndOrganizationId(req.subRecipeId(), orgId)
                    .orElseThrow(() -> new EntityNotFoundException("Sub-recipe not found: " + req.subRecipeId()));
            RecipeSubRecipe rsr = new RecipeSubRecipe();
            rsr.setRecipe(recipe);
            rsr.setSubRecipe(subRecipe);
            rsr.setQuantity(req.quantity());
            recipe.getSubRecipes().add(rsr);
        }
    }

    private void applySteps(Recipe recipe, List<RecipeStepRequest> reqs) {
        recipe.getSteps().clear();
        if (reqs == null) return;
        for (var req : reqs) {
            RecipeStep step = new RecipeStep();
            step.setRecipe(recipe);
            step.setStepNumber(req.stepNumber());
            step.setDescription(req.description());
            recipe.getSteps().add(step);
        }
    }
}
