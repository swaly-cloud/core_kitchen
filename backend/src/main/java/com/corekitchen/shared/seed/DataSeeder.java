package com.corekitchen.shared.seed;

import com.corekitchen.ingredients.entity.Allergen;
import com.corekitchen.ingredients.entity.Ingredient;
import com.corekitchen.ingredients.entity.Unit;
import com.corekitchen.ingredients.repository.IngredientRepository;
import com.corekitchen.organizations.entity.Organization;
import com.corekitchen.organizations.repository.OrganizationRepository;
import com.corekitchen.recipes.entity.Recipe;
import com.corekitchen.recipes.entity.RecipeIngredient;
import com.corekitchen.recipes.entity.RecipeStatus;
import com.corekitchen.recipes.entity.RecipeStep;
import com.corekitchen.recipes.repository.RecipeRepository;
import com.corekitchen.users.entity.Role;
import com.corekitchen.users.entity.User;
import com.corekitchen.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import org.springframework.data.domain.PageRequest;

/**
 * Seeds the demo organization users on first boot. Idempotent.
 * The organization itself is created via Flyway V3, but users are created here
 * so we can hash the password with the same BCryptPasswordEncoder as production.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final String DEMO_SLUG = "demo";
    private static final String DEMO_PASSWORD = "Demo1234!";

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final IngredientRepository ingredientRepository;
    private final RecipeRepository recipeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        Organization demo = organizationRepository.findBySlug(DEMO_SLUG).orElse(null);
        if (demo == null) {
            log.info("Demo organization not found; skipping demo user seed");
            return;
        }

        seedIfMissing(demo, "admin@demo.com", "Admin", "Demo", Role.ADMIN);
        seedIfMissing(demo, "chef@demo.com", "Chef", "Demo", Role.CHEF);
        seedIngredientsIfMissing(demo);
        seedRecipesIfMissing(demo);
    }

    private void seedIfMissing(Organization org, String email, String first, String last, Role role) {
        if (userRepository.existsByEmail(email)) return;
        userRepository.save(User.builder()
                .organization(org)
                .email(email)
                .passwordHash(passwordEncoder.encode(DEMO_PASSWORD))
                .firstName(first)
                .lastName(last)
                .role(role)
                .enabled(true)
                .build());
        log.info("Seeded demo user {} ({}/{})", email, role, DEMO_PASSWORD);
    }

    private void seedIngredientsIfMissing(Organization org) {
        // Check if ingredients already seeded
        if (ingredientRepository.findByOrganizationId(org.getId(), PageRequest.of(0, 1)).getTotalElements() > 0) {
            log.info("Ingredients already seeded; skipping");
            return;
        }

        var ingredients = new java.util.ArrayList<Ingredient>();

        ingredients.add(createIngredient(org, "Farine de blé", Unit.KG, new BigDecimal("1.20"), "Boulangerie", "Moulin local", Allergen.GLUTEN));
        ingredients.add(createIngredient(org, "Beurre", Unit.KG, new BigDecimal("25.00"), "Produits laitiers", "Laiterie", Allergen.MILK));
        ingredients.add(createIngredient(org, "Œufs", Unit.PIECE, new BigDecimal("0.35"), "Produits frais", "Ferme locale", Allergen.EGGS));
        ingredients.add(createIngredient(org, "Lait entier", Unit.L, new BigDecimal("1.80"), "Produits laitiers", "Laiterie", Allergen.MILK));
        ingredients.add(createIngredient(org, "Fromage Emmental", Unit.KG, new BigDecimal("18.50"), "Fromages", "Fromagerie alpine", Allergen.MILK));
        ingredients.add(createIngredient(org, "Tomates fraîches", Unit.KG, new BigDecimal("2.50"), "Fruits et légumes", "Marché local"));
        ingredients.add(createIngredient(org, "Oignons", Unit.KG, new BigDecimal("0.80"), "Fruits et légumes", "Producteur local"));
        ingredients.add(createIngredient(org, "Ail", Unit.KG, new BigDecimal("5.00"), "Fruits et légumes", "Producteur local"));
        ingredients.add(createIngredient(org, "Huile d'olive", Unit.L, new BigDecimal("12.00"), "Huiles", "Domaine espagnol"));
        ingredients.add(createIngredient(org, "Sel", Unit.KG, new BigDecimal("0.50"), "Condiments", "Sel marin"));
        ingredients.add(createIngredient(org, "Poivre noir", Unit.KG, new BigDecimal("15.00"), "Épices", "Importateur"));
        ingredients.add(createIngredient(org, "Basilic frais", Unit.KG, new BigDecimal("8.00"), "Herbes fraîches", "Producteur local"));
        ingredients.add(createIngredient(org, "Mozzarella", Unit.KG, new BigDecimal("16.00"), "Fromages", "Fromagerie italienne", Allergen.MILK));
        ingredients.add(createIngredient(org, "Jambon de Parme", Unit.KG, new BigDecimal("35.00"), "Charcuterie", "Importateur italien"));
        ingredients.add(createIngredient(org, "Crème fraîche", Unit.L, new BigDecimal("3.50"), "Produits laitiers", "Laiterie", Allergen.MILK));

        ingredientRepository.saveAll(ingredients);
        log.info("Seeded {} demo ingredients", ingredients.size());
    }

    private void seedRecipesIfMissing(Organization org) {
        if (recipeRepository.findByOrganizationIdAndStatus(org.getId(), RecipeStatus.PUBLISHED).stream()
                .anyMatch(r -> r.getName().equals("Pâtes à la Carbonara"))) {
            log.info("Recipes already seeded; skipping");
            return;
        }

        var ingredients = new HashMap<String, Ingredient>();
        ingredientRepository.findByOrganizationId(org.getId(), PageRequest.of(0, 100)).forEach(ing ->
            ingredients.put(ing.getName(), ing)
        );

        var recipes = new java.util.ArrayList<Recipe>();

        // Pâtes à la Carbonara
        var carbonara = createRecipe("Pâtes à la Carbonara", "Pâtes crémeuses avec jambon et fromage",
                RecipeStatus.PUBLISHED, 2, "PORTION", 10, 15, "Pâtes", new BigDecimal("12.00"), org);
        addIngredient(carbonara, ingredients.get("Farine de blé"), new BigDecimal("250"), "G");
        addIngredient(carbonara, ingredients.get("Œufs"), new BigDecimal("3"), "PIECE");
        addIngredient(carbonara, ingredients.get("Jambon de Parme"), new BigDecimal("100"), "G");
        addIngredient(carbonara, ingredients.get("Crème fraîche"), new BigDecimal("200"), "ML");
        addIngredient(carbonara, ingredients.get("Fromage Emmental"), new BigDecimal("50"), "G");
        addStep(carbonara, 1, "Cuire les pâtes à l'eau bouillante salée pendant 10-12 minutes jusqu'à al dente");
        addStep(carbonara, 2, "Couper le jambon en dés et faire revenir à la poêle");
        addStep(carbonara, 3, "Battre les œufs avec la crème et le fromage râpé");
        addStep(carbonara, 4, "Égoutter les pâtes et les ajouter au jambon");
        addStep(carbonara, 5, "Retirer du feu et verser la préparation aux œufs, mélanger rapidement");
        recipes.add(carbonara);

        // Pizza Margherita
        var pizza = createRecipe("Pizza Margherita", "Pizza classique avec tomates, mozzarella et basilic",
                RecipeStatus.PUBLISHED, 2, "PORTION", 20, 20, "Pizzas", new BigDecimal("10.00"), org);
        addIngredient(pizza, ingredients.get("Farine de blé"), new BigDecimal("300"), "G");
        addIngredient(pizza, ingredients.get("Tomates fraîches"), new BigDecimal("150"), "G");
        addIngredient(pizza, ingredients.get("Mozzarella"), new BigDecimal("200"), "G");
        addIngredient(pizza, ingredients.get("Basilic frais"), new BigDecimal("10"), "G");
        addIngredient(pizza, ingredients.get("Huile d'olive"), new BigDecimal("30"), "ML");
        addIngredient(pizza, ingredients.get("Sel"), new BigDecimal("5"), "G");
        addStep(pizza, 1, "Préparer la pâte avec farine, eau, sel et levure");
        addStep(pizza, 2, "Laisser reposer 1h30");
        addStep(pizza, 3, "Étaler la pâte sur une plaque huilée");
        addStep(pizza, 4, "Ajouter la sauce tomate et la mozzarella");
        addStep(pizza, 5, "Cuire au four à 250°C pendant 20 minutes");
        addStep(pizza, 6, "Ajouter le basilic frais après la cuisson");
        recipes.add(pizza);

        // Omelette nature
        var omelette = createRecipe("Omelette nature", "Simple et rapide",
                RecipeStatus.PUBLISHED, 1, "PORTION", 5, 5, "Œufs", new BigDecimal("4.00"), org);
        addIngredient(omelette, ingredients.get("Œufs"), new BigDecimal("3"), "PIECE");
        addIngredient(omelette, ingredients.get("Beurre"), new BigDecimal("20"), "G");
        addIngredient(omelette, ingredients.get("Sel"), new BigDecimal("1"), "G");
        addIngredient(omelette, ingredients.get("Poivre noir"), new BigDecimal("0.5"), "G");
        addStep(omelette, 1, "Battre les œufs avec sel et poivre");
        addStep(omelette, 2, "Faire fondre le beurre à la poêle à feu moyen");
        addStep(omelette, 3, "Verser les œufs battus");
        addStep(omelette, 4, "Plier quand le centre commence à prendre");
        recipes.add(omelette);

        // Salade Niçoise
        var salade = createRecipe("Salade Niçoise", "Salade méditerranéenne fraîche",
                RecipeStatus.PUBLISHED, 2, "PORTION", 10, 0, "Salades", new BigDecimal("5.00"), org);
        addIngredient(salade, ingredients.get("Tomates fraîches"), new BigDecimal("200"), "G");
        addIngredient(salade, ingredients.get("Oignons"), new BigDecimal("50"), "G");
        addIngredient(salade, ingredients.get("Ail"), new BigDecimal("5"), "G");
        addIngredient(salade, ingredients.get("Huile d'olive"), new BigDecimal("50"), "ML");
        addIngredient(salade, ingredients.get("Sel"), new BigDecimal("3"), "G");
        addStep(salade, 1, "Laver et couper les tomates en quartiers");
        addStep(salade, 2, "Émincer finement les oignons");
        addStep(salade, 3, "Hacher l'ail finement");
        addStep(salade, 4, "Mélanger dans un saladier");
        addStep(salade, 5, "Arroser d'huile d'olive et assaisonner");
        recipes.add(salade);

        // Tarte aux tomates
        var tarte = createRecipe("Tarte aux tomates", "Tarte salée avec fromage et tomates",
                RecipeStatus.PUBLISHED, 4, "PORTION", 15, 30, "Tartes", new BigDecimal("16.00"), org);
        addIngredient(tarte, ingredients.get("Farine de blé"), new BigDecimal("200"), "G");
        addIngredient(tarte, ingredients.get("Beurre"), new BigDecimal("100"), "G");
        addIngredient(tarte, ingredients.get("Tomates fraîches"), new BigDecimal("300"), "G");
        addIngredient(tarte, ingredients.get("Oignons"), new BigDecimal("100"), "G");
        addIngredient(tarte, ingredients.get("Fromage Emmental"), new BigDecimal("100"), "G");
        addIngredient(tarte, ingredients.get("Sel"), new BigDecimal("3"), "G");
        addStep(tarte, 1, "Préparer la pâte brisée avec farine, beurre et sel");
        addStep(tarte, 2, "Laisser reposer 30 minutes");
        addStep(tarte, 3, "Étaler la pâte dans un moule");
        addStep(tarte, 4, "Faire revenir les oignons à la poêle");
        addStep(tarte, 5, "Ajouter les tomates et laisser réduire 10 minutes");
        addStep(tarte, 6, "Verser la préparation sur la pâte");
        addStep(tarte, 7, "Couvrir de fromage râpé");
        addStep(tarte, 8, "Cuire au four à 200°C pendant 30 minutes");
        recipes.add(tarte);

        recipeRepository.saveAll(recipes);
        log.info("Seeded {} demo recipes", recipes.size());
    }

    private Ingredient createIngredient(Organization org, String name, Unit unit, BigDecimal cost,
                                       String category, String supplier, Allergen... allergens) {
        var ing = new Ingredient();
        ing.setOrganization(org);
        ing.setName(name);
        ing.setUnit(unit);
        ing.setCostPerUnit(cost);
        ing.setCategory(category);
        ing.setSupplier(supplier);
        if (allergens != null && allergens.length > 0) {
            ing.setAllergens(new HashSet<>(java.util.List.of(allergens)));
        }
        return ing;
    }

    private Recipe createRecipe(String name, String description, RecipeStatus status,
                                int yield, String yieldUnit, int prepTime, int cookTime,
                                String category, BigDecimal sellingPrice, Organization org) {
        var recipe = new Recipe();
        recipe.setOrganization(org);
        recipe.setName(name);
        recipe.setDescription(description);
        recipe.setStatus(status);
        recipe.setYieldQuantity(new BigDecimal(yield));
        recipe.setYieldUnit(yieldUnit);
        recipe.setPreparationTimeMinutes(prepTime);
        recipe.setCookingTimeMinutes(cookTime);
        recipe.setCategory(category);
        recipe.setSellingPrice(sellingPrice);
        return recipe;
    }

    private void addIngredient(Recipe recipe, Ingredient ingredient, BigDecimal quantity, String unit) {
        var ri = new RecipeIngredient();
        ri.setRecipe(recipe);
        ri.setIngredient(ingredient);
        ri.setQuantity(quantity);
        ri.setUnit(unit);
        recipe.getIngredients().add(ri);
    }

    private void addStep(Recipe recipe, int stepNumber, String description) {
        var step = new RecipeStep();
        step.setRecipe(recipe);
        step.setStepNumber(stepNumber);
        step.setDescription(description);
        recipe.getSteps().add(step);
    }
}
