package com.corekitchen.ingredients.entity;

import com.corekitchen.organizations.entity.Organization;
import com.corekitchen.shared.audit.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "ingredients")
@Getter
@Setter
public class Ingredient extends BaseEntity {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "unit", nullable = false, length = 50)
    private Unit unit;

    @Column(name = "cost_per_unit", nullable = false, precision = 10, scale = 4)
    private BigDecimal costPerUnit = BigDecimal.ZERO;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "supplier", length = 255)
    private String supplier;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "ingredient_allergens", joinColumns = @JoinColumn(name = "ingredient_id"))
    @Column(name = "allergen")
    @Enumerated(EnumType.STRING)
    private Set<Allergen> allergens = new HashSet<>();
}
