CREATE TABLE ingredients (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name        VARCHAR(255) NOT NULL,
    unit        VARCHAR(50)  NOT NULL,
    cost_per_unit NUMERIC(10, 4) NOT NULL DEFAULT 0,
    category    VARCHAR(100),
    supplier    VARCHAR(255),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ingredient_allergens (
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    allergen      VARCHAR(50) NOT NULL,
    PRIMARY KEY (ingredient_id, allergen)
);

CREATE INDEX idx_ingredients_org ON ingredients(organization_id);
CREATE INDEX idx_ingredients_name ON ingredients(organization_id, name);

CREATE TRIGGER trg_ingredients_updated_at
    BEFORE UPDATE ON ingredients
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
