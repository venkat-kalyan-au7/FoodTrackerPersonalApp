-- ============================================================
-- Migration: 002_add_macros_and_fiber.sql
-- Description: Add fiber to foods; add per-log macro tracking to food_logs
-- Run this in your Supabase SQL editor
-- ============================================================

-- Add fiber column to foods table
ALTER TABLE foods ADD COLUMN IF NOT EXISTS fiber_per_100g NUMERIC;

-- Add macro snapshot + calculated macro columns to food_logs
ALTER TABLE food_logs
  ADD COLUMN IF NOT EXISTS protein_per_100g_snapshot NUMERIC,
  ADD COLUMN IF NOT EXISTS carbs_per_100g_snapshot   NUMERIC,
  ADD COLUMN IF NOT EXISTS fat_per_100g_snapshot     NUMERIC,
  ADD COLUMN IF NOT EXISTS fiber_per_100g_snapshot   NUMERIC,
  ADD COLUMN IF NOT EXISTS calculated_protein        NUMERIC,
  ADD COLUMN IF NOT EXISTS calculated_carbs          NUMERIC,
  ADD COLUMN IF NOT EXISTS calculated_fat            NUMERIC,
  ADD COLUMN IF NOT EXISTS calculated_fiber          NUMERIC;
