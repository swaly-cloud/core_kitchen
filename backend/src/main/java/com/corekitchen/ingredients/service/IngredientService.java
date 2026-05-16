package com.corekitchen.ingredients.service;

import com.corekitchen.ingredients.dto.CreateIngredientRequest;
import com.corekitchen.ingredients.dto.IngredientDto;
import com.corekitchen.ingredients.dto.IngredientPageResponse;
import com.corekitchen.ingredients.dto.UpdateIngredientRequest;
import com.corekitchen.ingredients.entity.Ingredient;
import com.corekitchen.ingredients.repository.IngredientRepository;
import com.corekitchen.organizations.entity.Organization;
import com.corekitchen.organizations.repository.OrganizationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IngredientService {

    private final IngredientRepository ingredientRepository;
    private final OrganizationRepository organizationRepository;

    @Transactional
    public IngredientDto create(CreateIngredientRequest req, UUID organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new EntityNotFoundException("Organization not found: " + organizationId));

        Ingredient ingredient = new Ingredient();
        ingredient.setOrganization(organization);
        ingredient.setName(req.name());
        ingredient.setUnit(req.unit());
        ingredient.setCostPerUnit(req.costPerUnit());
        ingredient.setCategory(req.category());
        ingredient.setSupplier(req.supplier());
        ingredient.setAllergens(new HashSet<>(req.allergens()));

        return IngredientDto.from(ingredientRepository.save(ingredient));
    }

    @Transactional
    public IngredientDto update(UUID id, UpdateIngredientRequest req, UUID organizationId) {
        Ingredient ingredient = ingredientRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new EntityNotFoundException("Ingredient not found: " + id));

        ingredient.setName(req.name());
        ingredient.setUnit(req.unit());
        ingredient.setCostPerUnit(req.costPerUnit());
        ingredient.setCategory(req.category());
        ingredient.setSupplier(req.supplier());
        ingredient.setAllergens(new HashSet<>(req.allergens()));

        return IngredientDto.from(ingredientRepository.save(ingredient));
    }

    @Transactional
    public void delete(UUID id, UUID organizationId) {
        if (!ingredientRepository.existsByIdAndOrganizationId(id, organizationId)) {
            throw new EntityNotFoundException("Ingredient not found: " + id);
        }
        ingredientRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public IngredientDto getById(UUID id, UUID organizationId) {
        return ingredientRepository.findByIdAndOrganizationId(id, organizationId)
                .map(IngredientDto::from)
                .orElseThrow(() -> new EntityNotFoundException("Ingredient not found: " + id));
    }

    @Transactional(readOnly = true)
    public IngredientPageResponse list(int page, int size, String search, String category,
                                       String sortBy, String sortDir, UUID organizationId) {
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String effectiveSortBy = (sortBy != null && !sortBy.isBlank()) ? sortBy : "name";
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, effectiveSortBy));

        boolean hasSearch = search != null && !search.isBlank();
        boolean hasCategory = category != null && !category.isBlank();

        Page<Ingredient> result;
        if (hasSearch && hasCategory) {
            result = ingredientRepository.findByOrganizationIdAndCategoryAndNameContainingIgnoreCase(
                    organizationId, category, search, pageable);
        } else if (hasSearch) {
            result = ingredientRepository.findByOrganizationIdAndNameContainingIgnoreCase(
                    organizationId, search, pageable);
        } else if (hasCategory) {
            result = ingredientRepository.findByOrganizationIdAndCategory(organizationId, category, pageable);
        } else {
            result = ingredientRepository.findByOrganizationId(organizationId, pageable);
        }

        List<IngredientDto> content = result.getContent().stream()
                .map(IngredientDto::from)
                .toList();

        return new IngredientPageResponse(
                content,
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        );
    }
}
