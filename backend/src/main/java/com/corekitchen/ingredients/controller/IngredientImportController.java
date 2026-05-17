package com.corekitchen.ingredients.controller;

import com.corekitchen.auth.jwt.AuthenticatedUser;
import com.corekitchen.ingredients.dto.CreateIngredientRequest;
import com.corekitchen.ingredients.dto.ImportResultDto;
import com.corekitchen.ingredients.entity.Allergen;
import com.corekitchen.ingredients.entity.Unit;
import com.corekitchen.ingredients.service.IngredientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;

/**
 * Handles bulk ingredient import from a CSV file.
 *
 * Expected CSV format (first line = headers):
 *   name,unit,costPerUnit,category,supplier,allergens
 *
 * - allergens: pipe-separated list of {@link Allergen} values (e.g. MILK|GLUTEN), may be blank.
 * - Invalid rows (unknown unit, negative cost, blank name) are silently skipped.
 * - Maximum 500 data rows per upload.
 */
@RestController
@RequestMapping("/api/ingredients/import")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Ingredients", description = "Ingredient management")
public class IngredientImportController {

    private static final int MAX_ROWS = 500;

    private final IngredientService ingredientService;

    @PostMapping(value = "/csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Import ingredients from a CSV file (max 500 rows)")
    public ImportResultDto importCsv(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        int imported = 0;
        int skipped = 0;
        int rowsProcessed = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            // Skip header line
            String header = reader.readLine();
            if (header == null) {
                return new ImportResultDto(0, 0);
            }

            String line;
            while ((line = reader.readLine()) != null) {
                if (rowsProcessed >= MAX_ROWS) {
                    log.warn("CSV import: reached max row limit of {}. Remaining rows ignored.", MAX_ROWS);
                    break;
                }
                rowsProcessed++;

                line = line.trim();
                if (line.isBlank()) {
                    skipped++;
                    continue;
                }

                CreateIngredientRequest req = parseLine(line);
                if (req == null) {
                    skipped++;
                    continue;
                }

                try {
                    ingredientService.create(req, principal.organizationId());
                    imported++;
                } catch (Exception e) {
                    log.debug("CSV import: failed to create ingredient from line '{}': {}", line, e.getMessage());
                    skipped++;
                }
            }
        } catch (Exception e) {
            log.error("CSV import: error reading file", e);
            return new ImportResultDto(imported, skipped);
        }

        log.info("CSV import completed: {} imported, {} skipped for org {}",
                imported, skipped, principal.organizationId());
        return new ImportResultDto(imported, skipped);
    }

    /**
     * Parses a single CSV data line into a {@link CreateIngredientRequest}.
     * Returns {@code null} if the line is invalid and should be skipped.
     *
     * Column order: name, unit, costPerUnit, category, supplier, allergens
     */
    private CreateIngredientRequest parseLine(String line) {
        // Split on comma, but keep empty trailing fields
        String[] cols = line.split(",", -1);
        if (cols.length < 3) {
            return null;
        }

        String name = cols[0].trim();
        if (name.isBlank() || name.length() > 255) {
            return null;
        }

        Unit unit;
        try {
            unit = Unit.valueOf(cols[1].trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }

        BigDecimal costPerUnit;
        try {
            costPerUnit = new BigDecimal(cols[2].trim());
            if (costPerUnit.compareTo(BigDecimal.ZERO) < 0) {
                return null;
            }
        } catch (NumberFormatException e) {
            return null;
        }

        String category = cols.length > 3 ? nullIfBlank(cols[3]) : null;
        String supplier  = cols.length > 4 ? nullIfBlank(cols[4]) : null;

        Set<Allergen> allergens = new HashSet<>();
        if (cols.length > 5 && !cols[5].isBlank()) {
            for (String token : cols[5].trim().split("\\|")) {
                token = token.trim();
                if (!token.isBlank()) {
                    try {
                        allergens.add(Allergen.valueOf(token.toUpperCase()));
                    } catch (IllegalArgumentException e) {
                        log.debug("CSV import: unknown allergen '{}', skipping allergen token", token);
                    }
                }
            }
        }

        return new CreateIngredientRequest(name, unit, costPerUnit, category, supplier, allergens);
    }

    private String nullIfBlank(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }
}
