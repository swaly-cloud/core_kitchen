package com.corekitchen.ingredients.repository;

import com.corekitchen.ingredients.entity.Ingredient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface IngredientRepository extends JpaRepository<Ingredient, UUID> {

    Page<Ingredient> findByOrganizationIdAndNameContainingIgnoreCase(UUID orgId, String search, Pageable pageable);

    Page<Ingredient> findByOrganizationIdAndCategoryAndNameContainingIgnoreCase(UUID orgId, String category, String search, Pageable pageable);

    Page<Ingredient> findByOrganizationId(UUID orgId, Pageable pageable);

    Page<Ingredient> findByOrganizationIdAndCategory(UUID orgId, String category, Pageable pageable);

    boolean existsByIdAndOrganizationId(UUID id, UUID orgId);

    Optional<Ingredient> findByIdAndOrganizationId(UUID id, UUID orgId);
}
