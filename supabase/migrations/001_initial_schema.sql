-- ============================================================
-- Migration: 001_initial_schema.sql
-- Description: Initial database schema for Calorie Tracker
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────
-- profiles
-- One profile per authenticated Supabase user
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                TEXT NOT NULL,
  full_name            TEXT,
  role                 TEXT NOT NULL DEFAULT 'USER',
  gender               TEXT,
  date_of_birth        DATE,
  height_cm            NUMERIC,
  weight_kg            NUMERIC,
  target_weight_kg     NUMERIC,
  daily_calorie_goal   NUMERIC NOT NULL DEFAULT 2000,
  preferred_unit       TEXT NOT NULL DEFAULT 'GRAMS',
  profile_image_path   TEXT,
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT profiles_role_check        CHECK (role IN ('ADMIN', 'USER')),
  CONSTRAINT profiles_unit_check        CHECK (preferred_unit IN ('GRAMS', 'SERVINGS')),
  CONSTRAINT profiles_goal_positive     CHECK (daily_calorie_goal > 0),
  CONSTRAINT profiles_gender_check      CHECK (gender IS NULL OR gender IN ('MALE', 'FEMALE', 'OTHER'))
);

-- ────────────────────────────────────────────
-- calorie_goals
-- Tracks calorie goal history per user
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS calorie_goals (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  calorie_goal     NUMERIC NOT NULL,
  effective_from   DATE NOT NULL,
  effective_to     DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT calorie_goals_positive CHECK (calorie_goal > 0)
);

CREATE INDEX IF NOT EXISTS idx_calorie_goals_user_date ON calorie_goals(user_id, effective_from);

-- ────────────────────────────────────────────
-- foods
-- Global and user-owned food items
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS foods (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id               UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name                        TEXT NOT NULL,
  normalized_name             TEXT NOT NULL,
  description                 TEXT,
  food_type                   TEXT NOT NULL,
  source_type                 TEXT NOT NULL,
  source_reference_id         TEXT,
  calories_per_100g           NUMERIC,
  protein_per_100g            NUMERIC,
  carbs_per_100g              NUMERIC,
  fat_per_100g                NUMERIC,
  default_serving_name        TEXT,
  default_serving_weight_g    NUMERIC,
  image_path                  TEXT,
  is_verified                 BOOLEAN NOT NULL DEFAULT FALSE,
  requires_variation_warning  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT foods_type_check   CHECK (food_type IN ('SYSTEM', 'EXTERNAL', 'USER_MANUAL', 'RECIPE')),
  CONSTRAINT foods_source_check CHECK (source_type IN ('INDIAN_REFERENCE', 'USDA_FDC', 'USER_MANUAL', 'USER_RECIPE')),
  CONSTRAINT foods_calories_positive CHECK (calories_per_100g IS NULL OR calories_per_100g >= 0)
);

CREATE INDEX IF NOT EXISTS idx_foods_normalized_name  ON foods(normalized_name);
CREATE INDEX IF NOT EXISTS idx_foods_owner            ON foods(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_foods_type             ON foods(food_type);
CREATE INDEX IF NOT EXISTS idx_foods_source           ON foods(source_type);

-- ────────────────────────────────────────────
-- food_aliases
-- Regional and alternate names for foods
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS food_aliases (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_id             UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  alias               TEXT NOT NULL,
  normalized_alias    TEXT NOT NULL,
  language_or_region  TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aliases_normalized ON food_aliases(normalized_alias);
CREATE INDEX IF NOT EXISTS idx_aliases_food_id    ON food_aliases(food_id);

-- ────────────────────────────────────────────
-- recipes
-- User-created recipes
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recipes (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  food_id              UUID REFERENCES foods(id) ON DELETE SET NULL,
  recipe_name          TEXT NOT NULL,
  description          TEXT,
  instructions         TEXT,
  final_weight_g       NUMERIC,
  servings             NUMERIC,
  total_calories       NUMERIC NOT NULL,
  calories_per_100g    NUMERIC,
  calories_per_serving NUMERIC,
  image_path           TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT recipes_calories_positive CHECK (total_calories >= 0)
);

CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);

-- ────────────────────────────────────────────
-- recipe_ingredients
-- Ingredient snapshots for recipes
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id                   UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_food_id          UUID REFERENCES foods(id) ON DELETE SET NULL,
  ingredient_name_snapshot    TEXT NOT NULL,
  quantity                    NUMERIC NOT NULL,
  unit                        TEXT NOT NULL,
  weight_g                    NUMERIC NOT NULL,
  calories_per_100g_snapshot  NUMERIC NOT NULL,
  calories_snapshot           NUMERIC NOT NULL,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT recipe_ingredients_quantity_positive CHECK (quantity > 0),
  CONSTRAINT recipe_ingredients_weight_positive   CHECK (weight_g > 0)
);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);

-- ────────────────────────────────────────────
-- food_logs
-- Daily food consumption records
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS food_logs (
  id                         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  food_id                    UUID REFERENCES foods(id) ON DELETE SET NULL,
  consumed_date              DATE NOT NULL,
  meal_type                  TEXT NOT NULL,
  food_name_snapshot         TEXT NOT NULL,
  source_type_snapshot       TEXT NOT NULL,
  calories_per_100g_snapshot NUMERIC,
  consumed_weight_g          NUMERIC,
  serving_quantity           NUMERIC,
  serving_name_snapshot      TEXT,
  calculated_calories        NUMERIC NOT NULL,
  note                       TEXT,
  image_path                 TEXT,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT food_logs_meal_type_check CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS')),
  CONSTRAINT food_logs_calories_positive CHECK (calculated_calories >= 0)
);

CREATE INDEX IF NOT EXISTS idx_food_logs_user_date   ON food_logs(user_id, consumed_date);
CREATE INDEX IF NOT EXISTS idx_food_logs_user_meal   ON food_logs(user_id, meal_type);
CREATE INDEX IF NOT EXISTS idx_food_logs_food_id     ON food_logs(food_id);

-- ────────────────────────────────────────────
-- favourites
-- User's favourite food items
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favourites (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  food_id     UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT favourites_unique UNIQUE (user_id, food_id)
);

CREATE INDEX IF NOT EXISTS idx_favourites_user_id ON favourites(user_id);

-- ────────────────────────────────────────────
-- external_food_cache
-- Cache for external nutrition API results
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS external_food_cache (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider             TEXT NOT NULL,
  provider_food_id     TEXT NOT NULL,
  search_term          TEXT NOT NULL,
  raw_response_json    JSONB NOT NULL,
  transformed_food_id  UUID REFERENCES foods(id) ON DELETE SET NULL,
  cached_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at           TIMESTAMPTZ,

  CONSTRAINT external_food_cache_unique UNIQUE (provider, provider_food_id)
);

CREATE INDEX IF NOT EXISTS idx_external_cache_provider ON external_food_cache(provider, provider_food_id);

-- ────────────────────────────────────────────
-- invitations_audit
-- Tracks admin invitation activity
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invitations_audit (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invited_email       TEXT NOT NULL,
  invited_by_user_id  UUID NOT NULL REFERENCES profiles(id),
  status              TEXT NOT NULL DEFAULT 'PENDING',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at         TIMESTAMPTZ,

  CONSTRAINT invitations_status_check CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'DEACTIVATED'))
);

-- ────────────────────────────────────────────
-- weight_logs (optional, future use)
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weight_logs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recorded_date  DATE NOT NULL,
  weight_kg      NUMERIC NOT NULL,
  note           TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT weight_logs_positive CHECK (weight_kg > 0)
);

CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON weight_logs(user_id, recorded_date);

-- ────────────────────────────────────────────
-- Trigger: Auto-create profile on user signup
-- ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'USER')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
