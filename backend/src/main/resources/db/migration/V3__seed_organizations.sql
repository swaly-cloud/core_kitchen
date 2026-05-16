-- Seed: demo organization
-- Users are seeded via DataSeeder (Java) to use Spring's BCryptPasswordEncoder consistently.
INSERT INTO organizations (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Restaurant', 'demo')
ON CONFLICT (slug) DO NOTHING;
