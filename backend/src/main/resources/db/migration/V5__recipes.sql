CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    yield_quantity NUMERIC(10, 3) NOT NULL DEFAULT 1,
    yield_unit VARCHAR(100) NOT NULL DEFAULT 'portion',
    preparation_time_minutes INTEGER,
    cooking_time_minutes INTEGER,
    category VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id),
    quantity NUMERIC(10, 4) NOT NULL,
    unit VARCHAR(50) NOT NULL
);

CREATE TABLE recipe_sub_recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    sub_recipe_id UUID NOT NULL REFERENCES recipes(id),
    quantity NUMERIC(10, 4) NOT NULL,
    CONSTRAINT no_self_reference CHECK (recipe_id != sub_recipe_id)
);

CREATE TABLE recipe_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    description TEXT NOT NULL,
    UNIQUE (recipe_id, step_number)
);

CREATE INDEX idx_recipes_org ON recipes(organization_id);
CREATE INDEX idx_recipes_org_status ON recipes(organization_id, status);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_steps_recipe ON recipe_steps(recipe_id);
CREATE INDEX idx_recipe_sub_recipes_recipe ON recipe_sub_recipes(recipe_id);

CREATE TRIGGER trg_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
