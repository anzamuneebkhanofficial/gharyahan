-- ==============================================================================
-- Migration 003: Fix Supabase Security Advisor Critical Finding
-- Issue: Table "public.spatial_ref_sys" is public, but RLS has not been enabled.
-- Context: PostGIS installs spatial_ref_sys into schema "public". Since PostgREST
-- exposes the "public" schema, Supabase Security Advisor flags it as a CRITICAL
-- risk unless Row Level Security is enabled.
-- ==============================================================================

-- 1. Enable Row Level Security on the PostGIS spatial_ref_sys table
ALTER TABLE IF EXISTS public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- 2. Grant public read-only access so coordinate system conversions & ST_Transform queries work
DROP POLICY IF EXISTS "Allow public read-only access to spatial_ref_sys" ON public.spatial_ref_sys;
CREATE POLICY "Allow public read-only access to spatial_ref_sys"
  ON public.spatial_ref_sys
  FOR SELECT
  TO public
  USING (true);

-- 3. Restrict mutations (INSERT, UPDATE, DELETE) exclusively to superusers / postgres service role
REVOKE INSERT, UPDATE, DELETE ON public.spatial_ref_sys FROM anon, authenticated;
