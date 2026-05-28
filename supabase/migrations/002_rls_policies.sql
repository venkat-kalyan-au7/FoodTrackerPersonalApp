-- ============================================================
-- Migration: 002_rls_policies.sql
-- Description: Row Level Security policies
-- ============================================================

-- Enable RLS on all private tables
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE calorie_goals      ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods               ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_aliases        ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients  ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE favourites          ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_food_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations_audit   ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs         ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────
-- profiles
-- ────────────────────────────────────────────
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ────────────────────────────────────────────
-- calorie_goals
-- ────────────────────────────────────────────
CREATE POLICY "calorie_goals_select_own"
  ON calorie_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "calorie_goals_insert_own"
  ON calorie_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "calorie_goals_update_own"
  ON calorie_goals FOR UPDATE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────
-- foods
-- Global foods (owner_user_id IS NULL) are readable by all authenticated users
-- User-owned foods are readable/writable only by owner
-- ────────────────────────────────────────────
CREATE POLICY "foods_select_global_or_own"
  ON foods FOR SELECT
  USING (
    owner_user_id IS NULL
    OR owner_user_id = auth.uid()
  );

CREATE POLICY "foods_insert_own"
  ON foods FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "foods_update_own"
  ON foods FOR UPDATE
  USING (owner_user_id = auth.uid());

CREATE POLICY "foods_delete_own"
  ON foods FOR DELETE
  USING (owner_user_id = auth.uid());

-- ────────────────────────────────────────────
-- food_aliases
-- All users can read aliases (they reference global foods)
-- ────────────────────────────────────────────
CREATE POLICY "food_aliases_select_all"
  ON food_aliases FOR SELECT
  USING (auth.role() = 'authenticated');

-- ────────────────────────────────────────────
-- recipes
-- ────────────────────────────────────────────
CREATE POLICY "recipes_select_own"
  ON recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "recipes_insert_own"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recipes_update_own"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "recipes_delete_own"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────
-- recipe_ingredients
-- Access through recipe ownership
-- ────────────────────────────────────────────
CREATE POLICY "recipe_ingredients_select_own"
  ON recipe_ingredients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "recipe_ingredients_insert_own"
  ON recipe_ingredients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "recipe_ingredients_delete_own"
  ON recipe_ingredients FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────
-- food_logs
-- ────────────────────────────────────────────
CREATE POLICY "food_logs_select_own"
  ON food_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "food_logs_insert_own"
  ON food_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "food_logs_update_own"
  ON food_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "food_logs_delete_own"
  ON food_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────
-- favourites
-- ────────────────────────────────────────────
CREATE POLICY "favourites_select_own"
  ON favourites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "favourites_insert_own"
  ON favourites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favourites_delete_own"
  ON favourites FOR DELETE
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────
-- external_food_cache
-- All authenticated users can read (global cache)
-- Only service role can write (via backend)
-- ────────────────────────────────────────────
CREATE POLICY "external_cache_select_authenticated"
  ON external_food_cache FOR SELECT
  USING (auth.role() = 'authenticated');

-- ────────────────────────────────────────────
-- invitations_audit
-- Only admins can read/write - enforced via service role in backend
-- We use a restrictive policy and rely on backend admin middleware
-- ────────────────────────────────────────────
CREATE POLICY "invitations_admin_only"
  ON invitations_audit FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

-- ────────────────────────────────────────────
-- weight_logs
-- ────────────────────────────────────────────
CREATE POLICY "weight_logs_select_own"
  ON weight_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "weight_logs_insert_own"
  ON weight_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "weight_logs_update_own"
  ON weight_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "weight_logs_delete_own"
  ON weight_logs FOR DELETE
  USING (auth.uid() = user_id);
