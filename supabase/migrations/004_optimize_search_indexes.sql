-- ==============================================================================
-- Migration 004: Search & Filtering Performance Indexes
-- Run this in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Index property_type for fast type filtering (house, portion, flat, room)
CREATE INDEX IF NOT EXISTS properties_property_type_idx ON public.properties (property_type);

-- 2. Index bedrooms for minimum bedrooms range filter
CREATE INDEX IF NOT EXISTS properties_bedrooms_idx ON public.properties (bedrooms);

-- 3. Composite index on status and created_at for fast sorting of available rentals
CREATE INDEX IF NOT EXISTS properties_status_created_idx ON public.properties (status, created_at DESC);

-- 4. Index on expected_vacancy_date for fast upcoming vacancy filtering
CREATE INDEX IF NOT EXISTS properties_vacancy_date_idx ON public.properties (expected_vacancy_date) WHERE expected_vacancy_date IS NOT NULL;

-- 5. Index on has_discount for deal promotions
CREATE INDEX IF NOT EXISTS properties_discount_idx ON public.properties (has_discount) WHERE has_discount = true;

-- 6. Verify and optimize price indexes
CREATE INDEX IF NOT EXISTS properties_rent_price_btree ON public.properties (rent_price);
