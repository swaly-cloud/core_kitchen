package com.corekitchen.ingredients.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;

/**
 * Provides a downloadable CSV template for bulk ingredient import.
 */
@RestController
@RequestMapping("/api/ingredients/import")
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Ingredients", description = "Ingredient management")
public class IngredientTemplateController {

    private static final String TEMPLATE_CONTENT =
            "name,unit,costPerUnit,category,supplier,allergens\r\n" +
            "Beurre,KG,18.5,Produits laitiers,,MILK\r\n" +
            "Farine T55,KG,1.2,Farines & céréales,Moulin Mahjoub,GLUTEN\r\n" +
            "Crevettes décortiquées,KG,45.0,Poissons & fruits de mer,,CRUSTACEANS\r\n";

    @GetMapping("/template")
    @Operation(summary = "Download a CSV template for ingredient import")
    public ResponseEntity<byte[]> downloadTemplate() {
        byte[] content = TEMPLATE_CONTENT.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ingredients_template.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .contentLength(content.length)
                .body(content);
    }
}
