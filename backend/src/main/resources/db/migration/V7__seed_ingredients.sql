-- V7: Seed ~120 common kitchen ingredients for the demo organization
-- Only inserts if the demo org has fewer than 5 ingredients (idempotent guard)

DO $$ BEGIN
  IF (SELECT COUNT(*) FROM ingredients WHERE organization_id = '00000000-0000-0000-0000-000000000001') < 5 THEN

    -- =========================================================
    -- Produits laitiers
    -- =========================================================
    INSERT INTO ingredients (id, organization_id, name, unit, cost_per_unit, category, supplier, created_at, updated_at) VALUES
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Beurre',             'KG', 18.5000, 'Produits laitiers', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Lait entier',         'L',  1.8000, 'Produits laitiers', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Crème fraîche 30%',   'L',  8.0000, 'Produits laitiers', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Crème fleurette',     'L',  9.5000, 'Produits laitiers', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Fromage blanc',       'KG', 6.5000, 'Produits laitiers', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Yaourt nature',       'KG', 3.2000, 'Produits laitiers', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Mozzarella',          'KG', 22.0000,'Produits laitiers', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Parmesan',            'KG', 45.0000,'Produits laitiers', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Emmental',            'KG', 28.0000,'Produits laitiers', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Gruyère',             'KG', 32.0000,'Produits laitiers', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Ricotta',             'KG', 18.0000,'Produits laitiers', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Brie',                'KG', 38.0000,'Produits laitiers', NULL, NOW(), NOW());

    INSERT INTO ingredient_allergens (ingredient_id, allergen)
      SELECT i.id, 'MILK' FROM ingredients i
      WHERE i.organization_id = '00000000-0000-0000-0000-000000000001'
        AND i.category = 'Produits laitiers'
        AND NOT EXISTS (
          SELECT 1 FROM ingredient_allergens ia WHERE ia.ingredient_id = i.id AND ia.allergen = 'MILK'
        );

    -- =========================================================
    -- Oeufs
    -- =========================================================
    INSERT INTO ingredients (id, organization_id, name, unit, cost_per_unit, category, supplier, created_at, updated_at) VALUES
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Œuf', 'PIECE', 0.4000, 'Œufs', NULL, NOW(), NOW());

    INSERT INTO ingredient_allergens (ingredient_id, allergen)
      SELECT i.id, 'EGGS' FROM ingredients i
      WHERE i.organization_id = '00000000-0000-0000-0000-000000000001'
        AND i.name = 'Œuf'
        AND NOT EXISTS (
          SELECT 1 FROM ingredient_allergens ia WHERE ia.ingredient_id = i.id AND ia.allergen = 'EGGS'
        );

    -- =========================================================
    -- Farines & céréales
    -- =========================================================
    INSERT INTO ingredients (id, organization_id, name, unit, cost_per_unit, category, supplier, created_at, updated_at) VALUES
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Farine T55',       'KG', 1.2000, 'Farines & céréales', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Farine T45',       'KG', 1.4000, 'Farines & céréales', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Fécule de maïs',   'KG', 3.5000, 'Farines & céréales', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Semoule fine',     'KG', 1.1000, 'Farines & céréales', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Semoule moyenne',  'KG', 1.1000, 'Farines & céréales', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Riz basmati',      'KG', 3.8000, 'Farines & céréales', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Riz arborio',      'KG', 5.2000, 'Farines & céréales', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Pâtes sèches',     'KG', 2.2000, 'Farines & céréales', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Couscous',         'KG', 1.5000, 'Farines & céréales', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Chapelure',        'KG', 2.8000, 'Farines & céréales', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Avoine',           'KG', 3.2000, 'Farines & céréales', NULL, NOW(), NOW());

    INSERT INTO ingredient_allergens (ingredient_id, allergen)
      SELECT i.id, 'GLUTEN' FROM ingredients i
      WHERE i.organization_id = '00000000-0000-0000-0000-000000000001'
        AND i.name IN ('Farine T55', 'Farine T45', 'Fécule de maïs', 'Semoule fine', 'Semoule moyenne',
                       'Pâtes sèches', 'Couscous', 'Chapelure', 'Avoine')
        AND NOT EXISTS (
          SELECT 1 FROM ingredient_allergens ia WHERE ia.ingredient_id = i.id AND ia.allergen = 'GLUTEN'
        );

    -- =========================================================
    -- Sucres & confiserie
    -- =========================================================
    INSERT INTO ingredients (id, organization_id, name, unit, cost_per_unit, category, supplier, created_at, updated_at) VALUES
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Sucre blanc',         'KG',    1.8000, 'Sucres & confiserie', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Sucre glace',          'KG',    2.2000, 'Sucres & confiserie', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Cassonade',            'KG',    3.5000, 'Sucres & confiserie', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Miel',                 'KG',   22.0000, 'Sucres & confiserie', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Chocolat noir 70%',    'KG',   38.0000, 'Sucres & confiserie', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Chocolat au lait',     'KG',   32.0000, 'Sucres & confiserie', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Chocolat blanc',       'KG',   35.0000, 'Sucres & confiserie', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Poudre de cacao',      'KG',   28.0000, 'Sucres & confiserie', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Levure chimique',      'KG',   12.0000, 'Sucres & confiserie', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Levure sèche',         'KG',   18.0000, 'Sucres & confiserie', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Bicarbonate',          'KG',    4.5000, 'Sucres & confiserie', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Vanille gousse',       'PIECE', 3.5000, 'Sucres & confiserie', NULL, NOW(), NOW());

    -- =========================================================
    -- Huiles & matières grasses
    -- =========================================================
    INSERT INTO ingredients (id, organization_id, name, unit, cost_per_unit, category, supplier, created_at, updated_at) VALUES
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Huile d''olive vierge', 'L',  14.5000, 'Huiles & matières grasses', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Huile de tournesol',    'L',   4.2000, 'Huiles & matières grasses', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Huile de sésame',       'L',  18.0000, 'Huiles & matières grasses', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Beurre clarifié',       'KG', 22.0000, 'Huiles & matières grasses', NULL, NOW(), NOW());

    INSERT INTO ingredient_allergens (ingredient_id, allergen)
      SELECT i.id, 'MILK' FROM ingredients i
      WHERE i.organization_id = '00000000-0000-0000-0000-000000000001'
        AND i.name = 'Beurre clarifié'
        AND NOT EXISTS (
          SELECT 1 FROM ingredient_allergens ia WHERE ia.ingredient_id = i.id AND ia.allergen = 'MILK'
        );

    INSERT INTO ingredient_allergens (ingredient_id, allergen)
      SELECT i.id, 'SESAME' FROM ingredients i
      WHERE i.organization_id = '00000000-0000-0000-0000-000000000001'
        AND i.name = 'Huile de sésame'
        AND NOT EXISTS (
          SELECT 1 FROM ingredient_allergens ia WHERE ia.ingredient_id = i.id AND ia.allergen = 'SESAME'
        );

    -- =========================================================
    -- Viandes
    -- =========================================================
    INSERT INTO ingredients (id, organization_id, name, unit, cost_per_unit, category, supplier, created_at, updated_at) VALUES
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Poulet entier',    'KG',  8.5000, 'Viandes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Blanc de poulet',  'KG', 14.0000, 'Viandes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Cuisse de poulet', 'KG',  9.5000, 'Viandes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Bœuf haché',       'KG', 28.0000, 'Viandes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Filet de bœuf',    'KG', 55.0000, 'Viandes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Côte de bœuf',     'KG', 38.0000, 'Viandes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Agneau épaule',    'KG', 32.0000, 'Viandes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Gigot d''agneau',  'KG', 35.0000, 'Viandes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Merguez',          'KG', 18.0000, 'Viandes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Veau escalope',    'KG', 42.0000, 'Viandes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Foie de veau',     'KG', 18.0000, 'Viandes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Lardons',          'KG', 22.0000, 'Viandes', NULL, NOW(), NOW());

    -- =========================================================
    -- Poissons & fruits de mer
    -- =========================================================
    INSERT INTO ingredients (id, organization_id, name, unit, cost_per_unit, category, supplier, created_at, updated_at) VALUES
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Thon frais',               'KG', 32.0000, 'Poissons & fruits de mer', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Daurade',                  'KG', 28.0000, 'Poissons & fruits de mer', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Loup de mer',              'KG', 35.0000, 'Poissons & fruits de mer', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Crevettes décortiquées',   'KG', 45.0000, 'Poissons & fruits de mer', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Saumon filet',             'KG', 48.0000, 'Poissons & fruits de mer', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Sardines',                 'KG',  8.5000, 'Poissons & fruits de mer', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Moules',                   'KG', 12.0000, 'Poissons & fruits de mer', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Calamars',                 'KG', 22.0000, 'Poissons & fruits de mer', NULL, NOW(), NOW());

    INSERT INTO ingredient_allergens (ingredient_id, allergen)
      SELECT i.id, 'FISH' FROM ingredients i
      WHERE i.organization_id = '00000000-0000-0000-0000-000000000001'
        AND i.name IN ('Thon frais', 'Daurade', 'Loup de mer', 'Saumon filet', 'Sardines')
        AND NOT EXISTS (
          SELECT 1 FROM ingredient_allergens ia WHERE ia.ingredient_id = i.id AND ia.allergen = 'FISH'
        );

    INSERT INTO ingredient_allergens (ingredient_id, allergen)
      SELECT i.id, 'CRUSTACEANS' FROM ingredients i
      WHERE i.organization_id = '00000000-0000-0000-0000-000000000001'
        AND i.name = 'Crevettes décortiquées'
        AND NOT EXISTS (
          SELECT 1 FROM ingredient_allergens ia WHERE ia.ingredient_id = i.id AND ia.allergen = 'CRUSTACEANS'
        );

    INSERT INTO ingredient_allergens (ingredient_id, allergen)
      SELECT i.id, 'MOLLUSCS' FROM ingredients i
      WHERE i.organization_id = '00000000-0000-0000-0000-000000000001'
        AND i.name IN ('Moules', 'Calamars')
        AND NOT EXISTS (
          SELECT 1 FROM ingredient_allergens ia WHERE ia.ingredient_id = i.id AND ia.allergen = 'MOLLUSCS'
        );

    -- =========================================================
    -- Légumes
    -- =========================================================
    INSERT INTO ingredients (id, organization_id, name, unit, cost_per_unit, category, supplier, created_at, updated_at) VALUES
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Tomate',               'KG',    1.8000, 'Légumes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Tomate cerise',         'KG',    4.5000, 'Légumes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Oignon',                'KG',    0.8000, 'Légumes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Oignon rouge',          'KG',    1.2000, 'Légumes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Ail',                   'KG',    5.5000, 'Légumes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Poivron rouge',         'KG',    2.8000, 'Légumes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Poivron vert',          'KG',    2.2000, 'Légumes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Courgette',             'KG',    1.5000, 'Légumes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Aubergine',             'KG',    1.8000, 'Légumes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Carotte',               'KG',    0.9000, 'Légumes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Pomme de terre',        'KG',    0.7000, 'Légumes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Champignon de Paris',   'KG',    8.5000, 'Légumes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Épinard',               'KG',    2.5000, 'Légumes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Brocoli',               'KG',    3.2000, 'Légumes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Chou-fleur',            'KG',    2.0000, 'Légumes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Céleri branche',        'BUNCH', 1.5000, 'Légumes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Concombre',             'KG',    1.2000, 'Légumes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Salade verte',          'PIECE', 0.8000, 'Légumes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Persil',                'BUNCH', 0.4000, 'Légumes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Coriandre',             'BUNCH', 0.4000, 'Légumes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Menthe fraîche',        'BUNCH', 0.5000, 'Légumes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Basilic frais',         'BUNCH', 0.8000, 'Légumes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Thym',                  'BUNCH', 0.6000, 'Légumes', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Romarin',               'BUNCH', 0.6000, 'Légumes', NULL, NOW(), NOW());

    -- Céleri: allergen CELERY
    INSERT INTO ingredient_allergens (ingredient_id, allergen)
      SELECT i.id, 'CELERY' FROM ingredients i
      WHERE i.organization_id = '00000000-0000-0000-0000-000000000001'
        AND i.name = 'Céleri branche'
        AND NOT EXISTS (
          SELECT 1 FROM ingredient_allergens ia WHERE ia.ingredient_id = i.id AND ia.allergen = 'CELERY'
        );

    -- =========================================================
    -- Fruits
    -- =========================================================
    INSERT INTO ingredients (id, organization_id, name, unit, cost_per_unit, category, supplier, created_at, updated_at) VALUES
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Citron',        'KG',  2.5000, 'Fruits', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Citron vert',   'KG',  4.5000, 'Fruits', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Orange',        'KG',  1.5000, 'Fruits', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Pomme',         'KG',  2.2000, 'Fruits', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Poire',         'KG',  2.8000, 'Fruits', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Banane',        'KG',  1.8000, 'Fruits', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Fraises',       'KG',  8.5000, 'Fruits', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Framboises',    'KG', 18.0000, 'Fruits', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Abricot',       'KG',  3.5000, 'Fruits', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Figue fraîche', 'KG',  4.0000, 'Fruits', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Grenade',       'KG',  2.8000, 'Fruits', NULL, NOW(), NOW());

    -- =========================================================
    -- Épices & condiments
    -- =========================================================
    INSERT INTO ingredients (id, organization_id, name, unit, cost_per_unit, category, supplier, created_at, updated_at) VALUES
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Sel fin',                 'KG',  0.5000, 'Épices & condiments', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Poivre noir moulu',       'KG', 18.0000, 'Épices & condiments', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Cumin moulu',             'KG', 12.0000, 'Épices & condiments', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Paprika doux',            'KG', 10.0000, 'Épices & condiments', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Curcuma',                 'KG', 14.0000, 'Épices & condiments', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Cannelle moulue',         'KG', 16.0000, 'Épices & condiments', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Coriandre moulue',        'KG', 12.0000, 'Épices & condiments', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Harissa',                 'KG',  8.5000, 'Épices & condiments', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Concentré de tomate',     'KG',  5.5000, 'Épices & condiments', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Moutarde',                'KG',  8.0000, 'Épices & condiments', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Vinaigre blanc',          'L',   1.8000, 'Épices & condiments', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Vinaigre balsamique',     'L',  12.0000, 'Épices & condiments', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Sauce soja',              'L',   8.5000, 'Épices & condiments', NULL, NOW(), NOW());

    INSERT INTO ingredient_allergens (ingredient_id, allergen)
      SELECT i.id, 'MUSTARD' FROM ingredients i
      WHERE i.organization_id = '00000000-0000-0000-0000-000000000001'
        AND i.name = 'Moutarde'
        AND NOT EXISTS (
          SELECT 1 FROM ingredient_allergens ia WHERE ia.ingredient_id = i.id AND ia.allergen = 'MUSTARD'
        );

    INSERT INTO ingredient_allergens (ingredient_id, allergen)
      SELECT i.id, 'SOYBEANS' FROM ingredients i
      WHERE i.organization_id = '00000000-0000-0000-0000-000000000001'
        AND i.name = 'Sauce soja'
        AND NOT EXISTS (
          SELECT 1 FROM ingredient_allergens ia WHERE ia.ingredient_id = i.id AND ia.allergen = 'SOYBEANS'
        );

    -- =========================================================
    -- Conserves & secs
    -- =========================================================
    INSERT INTO ingredients (id, organization_id, name, unit, cost_per_unit, category, supplier, created_at, updated_at) VALUES
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Tomates pelées',     'KG', 3.2000, 'Conserves & secs', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Pois chiches cuits', 'KG', 2.8000, 'Conserves & secs', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Lentilles sèches',   'KG', 2.5000, 'Conserves & secs', NULL, NOW(), NOW()),
      (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Haricots rouges',    'KG', 3.0000, 'Conserves & secs', NULL, NOW(), NOW());

  END IF;
END $$;
