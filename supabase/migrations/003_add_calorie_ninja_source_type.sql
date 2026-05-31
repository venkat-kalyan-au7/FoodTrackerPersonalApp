-- ============================================================
-- Migration: 003_add_calorie_ninja_source_type.sql
-- Description: Extend foods source_type constraint to include
--              OPEN_FOOD_FACTS and CALORIE_NINJA data sources.
-- Run this in your Supabase SQL editor.
-- ============================================================

ALTER TABLE foods DROP CONSTRAINT IF EXISTS foods_source_check;

ALTER TABLE foods ADD CONSTRAINT foods_source_check
  CHECK (source_type IN (
    'INDIAN_REFERENCE',
    'USDA_FDC',
    'OPEN_FOOD_FACTS',
    'CALORIE_NINJA',
    'USER_MANUAL',
    'USER_RECIPE'
  ));
