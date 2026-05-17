-- V8: Bulk seed ~120 kitchen ingredients for the demo org
-- Uses WHERE NOT EXISTS per name to be safe against re-runs and partial states

DO $$
DECLARE
  org UUID := '00000000-0000-0000-0000-000000000001';
BEGIN

  -- ─── Insert ingredients that don't already exist ───────────────────────────
  INSERT INTO ingredients (id, organization_id, name, unit, cost_per_unit, category, supplier, created_at, updated_at)
  SELECT gen_random_uuid(), org, v.name, v.unit, v.cost, v.cat, NULL, NOW(), NOW()
  FROM (VALUES
    -- Produits laitiers
    ('Beurre doux',          'KG',     18.5000, 'Produits laitiers'),
    ('Beurre demi-sel',      'KG',     19.0000, 'Produits laitiers'),
    ('Lait entier',          'L',       1.8000, 'Produits laitiers'),
    ('Lait demi-écrémé',     'L',       1.5000, 'Produits laitiers'),
    ('Crème fraîche 30%',    'L',       8.0000, 'Produits laitiers'),
    ('Crème fleurette',      'L',       9.5000, 'Produits laitiers'),
    ('Fromage blanc',        'KG',      6.5000, 'Produits laitiers'),
    ('Yaourt nature',        'KG',      3.2000, 'Produits laitiers'),
    ('Mozzarella',           'KG',     22.0000, 'Produits laitiers'),
    ('Parmesan',             'KG',     45.0000, 'Produits laitiers'),
    ('Gruyère',              'KG',     32.0000, 'Produits laitiers'),
    ('Ricotta',              'KG',     18.0000, 'Produits laitiers'),
    ('Brie',                 'KG',     38.0000, 'Produits laitiers'),
    ('Feta',                 'KG',     28.0000, 'Produits laitiers'),
    ('Mascarpone',           'KG',     24.0000, 'Produits laitiers'),
    ('Crème sure',           'KG',      9.0000, 'Produits laitiers'),
    -- Œufs
    ('Œuf frais',            'PIECE',   0.4000, 'Œufs'),
    ('Jaune d''œuf',         'PIECE',   0.3000, 'Œufs'),
    ('Blanc d''œuf',         'PIECE',   0.2000, 'Œufs'),
    -- Farines & céréales
    ('Farine T55',           'KG',      1.2000, 'Farines & céréales'),
    ('Farine T45',           'KG',      1.4000, 'Farines & céréales'),
    ('Farine complète T110', 'KG',      1.6000, 'Farines & céréales'),
    ('Fécule de maïs',       'KG',      3.5000, 'Farines & céréales'),
    ('Semoule fine',         'KG',      1.1000, 'Farines & céréales'),
    ('Semoule moyenne',      'KG',      1.1000, 'Farines & céréales'),
    ('Riz basmati',          'KG',      3.8000, 'Farines & céréales'),
    ('Riz arborio',          'KG',      5.2000, 'Farines & céréales'),
    ('Riz blanc',            'KG',      2.8000, 'Farines & céréales'),
    ('Pâtes sèches',         'KG',      2.2000, 'Farines & céréales'),
    ('Couscous',             'KG',      1.5000, 'Farines & céréales'),
    ('Chapelure',            'KG',      2.8000, 'Farines & céréales'),
    ('Avoine',               'KG',      3.2000, 'Farines & céréales'),
    ('Polenta',              'KG',      2.5000, 'Farines & céréales'),
    ('Farine de riz',        'KG',      2.8000, 'Farines & céréales'),
    -- Sucres & pâtisserie
    ('Sucre blanc',          'KG',      1.8000, 'Sucres & pâtisserie'),
    ('Sucre glace',          'KG',      2.2000, 'Sucres & pâtisserie'),
    ('Cassonade',            'KG',      3.5000, 'Sucres & pâtisserie'),
    ('Miel',                 'KG',     22.0000, 'Sucres & pâtisserie'),
    ('Chocolat noir 70%',    'KG',     38.0000, 'Sucres & pâtisserie'),
    ('Chocolat au lait',     'KG',     32.0000, 'Sucres & pâtisserie'),
    ('Chocolat blanc',       'KG',     35.0000, 'Sucres & pâtisserie'),
    ('Poudre de cacao',      'KG',     28.0000, 'Sucres & pâtisserie'),
    ('Levure chimique',      'KG',     12.0000, 'Sucres & pâtisserie'),
    ('Levure sèche boulangère','KG',   18.0000, 'Sucres & pâtisserie'),
    ('Bicarbonate de soude', 'KG',      4.5000, 'Sucres & pâtisserie'),
    ('Vanille gousse',       'PIECE',   3.5000, 'Sucres & pâtisserie'),
    ('Extrait de vanille',   'L',      45.0000, 'Sucres & pâtisserie'),
    ('Gélatine feuilles',    'KG',     95.0000, 'Sucres & pâtisserie'),
    ('Agar-agar',            'KG',    120.0000, 'Sucres & pâtisserie'),
    -- Huiles & matières grasses
    ('Huile d''olive vierge','L',      14.5000, 'Huiles & graisses'),
    ('Huile de tournesol',   'L',       4.2000, 'Huiles & graisses'),
    ('Huile de sésame',      'L',      18.0000, 'Huiles & graisses'),
    ('Huile de colza',       'L',       5.5000, 'Huiles & graisses'),
    ('Beurre clarifié',      'KG',     22.0000, 'Huiles & graisses'),
    ('Saindoux',             'KG',     12.0000, 'Huiles & graisses'),
    -- Viandes
    ('Poulet entier',        'KG',      8.5000, 'Viandes'),
    ('Blanc de poulet',      'KG',     14.0000, 'Viandes'),
    ('Cuisse de poulet',     'KG',      9.5000, 'Viandes'),
    ('Aile de poulet',       'KG',      7.0000, 'Viandes'),
    ('Bœuf haché',           'KG',     28.0000, 'Viandes'),
    ('Filet de bœuf',        'KG',     55.0000, 'Viandes'),
    ('Côte de bœuf',         'KG',     38.0000, 'Viandes'),
    ('Paleron de bœuf',      'KG',     22.0000, 'Viandes'),
    ('Agneau épaule',        'KG',     32.0000, 'Viandes'),
    ('Gigot d''agneau',      'KG',     35.0000, 'Viandes'),
    ('Côtelette d''agneau',  'KG',     38.0000, 'Viandes'),
    ('Merguez',              'KG',     18.0000, 'Viandes'),
    ('Veau escalope',        'KG',     42.0000, 'Viandes'),
    ('Foie de veau',         'KG',     18.0000, 'Viandes'),
    ('Lardons fumés',        'KG',     22.0000, 'Viandes'),
    ('Poitrine de porc',     'KG',     16.0000, 'Viandes'),
    ('Filet mignon de porc', 'KG',     28.0000, 'Viandes'),
    -- Poissons & fruits de mer
    ('Thon frais',           'KG',     32.0000, 'Poissons'),
    ('Daurade',              'KG',     28.0000, 'Poissons'),
    ('Loup de mer',          'KG',     35.0000, 'Poissons'),
    ('Saumon filet',         'KG',     48.0000, 'Poissons'),
    ('Sardines fraîches',    'KG',      8.5000, 'Poissons'),
    ('Maquereau',            'KG',     12.0000, 'Poissons'),
    ('Crevettes décortiquées','KG',    45.0000, 'Poissons'),
    ('Moules',               'KG',     12.0000, 'Poissons'),
    ('Calamars',             'KG',     22.0000, 'Poissons'),
    ('Poulpe',               'KG',     18.0000, 'Poissons'),
    -- Légumes
    ('Tomate',               'KG',      1.8000, 'Légumes'),
    ('Tomate cerise',        'KG',      4.5000, 'Légumes'),
    ('Oignon blanc',         'KG',      0.8000, 'Légumes'),
    ('Oignon rouge',         'KG',      1.2000, 'Légumes'),
    ('Échalote',             'KG',      3.5000, 'Légumes'),
    ('Ail',                  'KG',      5.5000, 'Légumes'),
    ('Poivron rouge',        'KG',      2.8000, 'Légumes'),
    ('Poivron vert',         'KG',      2.2000, 'Légumes'),
    ('Poivron jaune',        'KG',      3.2000, 'Légumes'),
    ('Courgette',            'KG',      1.5000, 'Légumes'),
    ('Aubergine',            'KG',      1.8000, 'Légumes'),
    ('Carotte',              'KG',      0.9000, 'Légumes'),
    ('Pomme de terre',       'KG',      0.7000, 'Légumes'),
    ('Pomme de terre à chair ferme','KG',1.0000,'Légumes'),
    ('Champignon de Paris',  'KG',      8.5000, 'Légumes'),
    ('Champignon shiitake',  'KG',     22.0000, 'Légumes'),
    ('Épinard',              'KG',      2.5000, 'Légumes'),
    ('Brocoli',              'KG',      3.2000, 'Légumes'),
    ('Chou-fleur',           'KG',      2.0000, 'Légumes'),
    ('Chou blanc',           'KG',      1.2000, 'Légumes'),
    ('Concombre',            'KG',      1.2000, 'Légumes'),
    ('Courgette ronde',      'KG',      2.0000, 'Légumes'),
    ('Artichaut',            'PIECE',   1.5000, 'Légumes'),
    ('Asperge verte',        'KG',      8.5000, 'Légumes'),
    ('Salade verte',         'PIECE',   0.8000, 'Légumes'),
    ('Céleri branche',       'BUNCH',   1.5000, 'Légumes'),
    ('Persil plat',          'BUNCH',   0.4000, 'Légumes'),
    ('Coriandre fraîche',    'BUNCH',   0.4000, 'Légumes'),
    ('Menthe fraîche',       'BUNCH',   0.5000, 'Légumes'),
    ('Basilic frais',        'BUNCH',   0.8000, 'Légumes'),
    ('Thym frais',           'BUNCH',   0.6000, 'Légumes'),
    ('Romarin frais',        'BUNCH',   0.6000, 'Légumes'),
    ('Laurier',              'BUNCH',   0.5000, 'Légumes'),
    -- Fruits
    ('Citron jaune',         'KG',      2.5000, 'Fruits'),
    ('Citron vert',          'KG',      4.5000, 'Fruits'),
    ('Orange',               'KG',      1.5000, 'Fruits'),
    ('Pomme golden',         'KG',      2.2000, 'Fruits'),
    ('Poire',                'KG',      2.8000, 'Fruits'),
    ('Banane',               'KG',      1.8000, 'Fruits'),
    ('Fraises',              'KG',      8.5000, 'Fruits'),
    ('Framboises',           'KG',     18.0000, 'Fruits'),
    ('Abricot',              'KG',      3.5000, 'Fruits'),
    ('Figue fraîche',        'KG',      4.0000, 'Fruits'),
    ('Grenade',              'KG',      2.8000, 'Fruits'),
    ('Mangue',               'KG',      5.5000, 'Fruits'),
    ('Ananas',               'KG',      3.8000, 'Fruits'),
    -- Épices & condiments
    ('Sel fin',              'KG',      0.5000, 'Épices & condiments'),
    ('Poivre noir moulu',    'KG',     18.0000, 'Épices & condiments'),
    ('Poivre noir grains',   'KG',     20.0000, 'Épices & condiments'),
    ('Cumin moulu',          'KG',     12.0000, 'Épices & condiments'),
    ('Cumin grains',         'KG',     13.0000, 'Épices & condiments'),
    ('Paprika doux',         'KG',     10.0000, 'Épices & condiments'),
    ('Paprika fumé',         'KG',     14.0000, 'Épices & condiments'),
    ('Curcuma',              'KG',     14.0000, 'Épices & condiments'),
    ('Cannelle moulue',      'KG',     16.0000, 'Épices & condiments'),
    ('Coriandre moulue',     'KG',     12.0000, 'Épices & condiments'),
    ('Piment de Cayenne',    'KG',     18.0000, 'Épices & condiments'),
    ('Ras el hanout',        'KG',     22.0000, 'Épices & condiments'),
    ('Harissa',              'KG',      8.5000, 'Épices & condiments'),
    ('Concentré de tomate',  'KG',      5.5000, 'Épices & condiments'),
    ('Moutarde de Dijon',    'KG',      8.0000, 'Épices & condiments'),
    ('Vinaigre blanc',       'L',       1.8000, 'Épices & condiments'),
    ('Vinaigre balsamique',  'L',      12.0000, 'Épices & condiments'),
    ('Sauce soja',           'L',       8.5000, 'Épices & condiments'),
    ('Nuoc-mâm',             'L',       6.5000, 'Épices & condiments'),
    ('Sauce Worcester',      'L',       9.0000, 'Épices & condiments'),
    ('Tabasco',              'L',      22.0000, 'Épices & condiments'),
    -- Conserves & secs
    ('Tomates pelées',       'KG',      3.2000, 'Conserves'),
    ('Pois chiches cuits',   'KG',      2.8000, 'Conserves'),
    ('Lentilles vertes',     'KG',      2.5000, 'Conserves'),
    ('Lentilles corail',     'KG',      3.0000, 'Conserves'),
    ('Haricots rouges',      'KG',      3.0000, 'Conserves'),
    ('Thon en conserve',     'KG',     18.0000, 'Conserves'),
    ('Sardines en conserve', 'KG',     12.0000, 'Conserves'),
    ('Fond de veau',         'L',      12.0000, 'Conserves'),
    ('Fond de volaille',     'L',       8.5000, 'Conserves'),
    ('Bouillon de légumes',  'L',       5.0000, 'Conserves')
  ) AS v(name, unit, cost, cat)
  WHERE NOT EXISTS (
    SELECT 1 FROM ingredients i
    WHERE i.name = v.name AND i.organization_id = org
  );

  -- ─── Allergens ─────────────────────────────────────────────────────────────

  -- MILK: produits laitiers
  INSERT INTO ingredient_allergens (ingredient_id, allergen)
    SELECT i.id, 'MILK' FROM ingredients i
    WHERE i.organization_id = org AND i.category = 'Produits laitiers'
      AND NOT EXISTS (SELECT 1 FROM ingredient_allergens ia WHERE ia.ingredient_id = i.id AND ia.allergen = 'MILK');

  -- EGGS: œufs
  INSERT INTO ingredient_allergens (ingredient_id, allergen)
    SELECT i.id, 'EGGS' FROM ingredients i
    WHERE i.organization_id = org AND i.category = 'Œufs'
      AND NOT EXISTS (SELECT 1 FROM ingredient_allergens ia WHERE ia.ingredient_id = i.id AND ia.allergen = 'EGGS');

  -- GLUTEN: farines & céréales, pâtes, chapelure
  INSERT INTO ingredient_allergens (ingredient_id, allergen)
    SELECT i.id, 'GLUTEN' FROM ingredients i
    WHERE i.organization_id = org
      AND i.category = 'Farines & céréales'
      AND NOT EXISTS (SELECT 1 FROM ingredient_allergens ia WHERE ia.ingredient_id = i.id AND ia.allergen = 'GLUTEN');

  -- FISH
  INSERT INTO ingredient_allergens (ingredient_id, allergen)
    SELECT i.id, 'FISH' FROM ingredients i
    WHERE i.organization_id = org
      AND i.name IN ('Thon frais','Daurade','Loup de mer','Saumon filet','Sardines fraîches','Maquereau',
                     'Thon en conserve','Sardines en conserve')
      AND NOT EXISTS (SELECT 1 FROM ingredient_allergens ia WHERE ia.ingredient_id = i.id AND ia.allergen = 'FISH');

  -- CRUSTACEANS
  INSERT INTO ingredient_allergens (ingredient_id, allergen)
    SELECT i.id, 'CRUSTACEANS' FROM ingredients i
    WHERE i.organization_id = org AND i.name IN ('Crevettes décortiquées')
      AND NOT EXISTS (SELECT 1 FROM ingredient_allergens ia WHERE ia.ingredient_id = i.id AND ia.allergen = 'CRUSTACEANS');

  -- MOLLUSCS
  INSERT INTO ingredient_allergens (ingredient_id, allergen)
    SELECT i.id, 'MOLLUSCS' FROM ingredients i
    WHERE i.organization_id = org AND i.name IN ('Moules','Calamars','Poulpe')
      AND NOT EXISTS (SELECT 1 FROM ingredient_allergens ia WHERE ia.ingredient_id = i.id AND ia.allergen = 'MOLLUSCS');

  -- SESAME
  INSERT INTO ingredient_allergens (ingredient_id, allergen)
    SELECT i.id, 'SESAME' FROM ingredients i
    WHERE i.organization_id = org AND i.name IN ('Huile de sésame')
      AND NOT EXISTS (SELECT 1 FROM ingredient_allergens ia WHERE ia.ingredient_id = i.id AND ia.allergen = 'SESAME');

  -- SOYBEANS
  INSERT INTO ingredient_allergens (ingredient_id, allergen)
    SELECT i.id, 'SOYBEANS' FROM ingredients i
    WHERE i.organization_id = org AND i.name IN ('Sauce soja', 'Nuoc-mâm')
      AND NOT EXISTS (SELECT 1 FROM ingredient_allergens ia WHERE ia.ingredient_id = i.id AND ia.allergen = 'SOYBEANS');

  -- MUSTARD
  INSERT INTO ingredient_allergens (ingredient_id, allergen)
    SELECT i.id, 'MUSTARD' FROM ingredients i
    WHERE i.organization_id = org AND i.name IN ('Moutarde de Dijon')
      AND NOT EXISTS (SELECT 1 FROM ingredient_allergens ia WHERE ia.ingredient_id = i.id AND ia.allergen = 'MUSTARD');

  -- CELERY
  INSERT INTO ingredient_allergens (ingredient_id, allergen)
    SELECT i.id, 'CELERY' FROM ingredients i
    WHERE i.organization_id = org AND i.name IN ('Céleri branche')
      AND NOT EXISTS (SELECT 1 FROM ingredient_allergens ia WHERE ia.ingredient_id = i.id AND ia.allergen = 'CELERY');

END $$;
