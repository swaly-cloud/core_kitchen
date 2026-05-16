package com.corekitchen.recipes.repository;

import com.corekitchen.recipes.entity.Recipe;
import com.corekitchen.recipes.entity.RecipeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecipeRepository extends JpaRepository<Recipe, UUID> {

    Page<Recipe> findByOrganizationId(UUID orgId, Pageable pageable);

    Page<Recipe> findByOrganizationIdAndStatus(UUID orgId, RecipeStatus status, Pageable pageable);

    Page<Recipe> findByOrganizationIdAndNameContainingIgnoreCase(UUID orgId, String name, Pageable pageable);

    Page<Recipe> findByOrganizationIdAndStatusAndNameContainingIgnoreCase(UUID orgId, RecipeStatus status, String name, Pageable pageable);

    Optional<Recipe> findByIdAndOrganizationId(UUID id, UUID orgId);

    boolean existsByIdAndOrganizationId(UUID id, UUID orgId);

    List<Recipe> findByOrganizationIdAndStatusAndIdNot(UUID orgId, RecipeStatus status, UUID excludeId);

    List<Recipe> findByOrganizationIdAndStatus(UUID orgId, RecipeStatus status);
}
