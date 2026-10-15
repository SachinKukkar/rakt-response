-- =============================================================================
-- Rakt Response - 1000 Bombay blood group (Oh)
--
-- * Adds 'Oh' (the Bombay phenotype) to public.blood_group. It is rare, its red
--   cells lack the H antigen, routine tests can mistake it for O, and people
--   with Oh can receive Oh blood only.
-- * Matching compares groups exactly everywhere, so an Oh request reaches Oh
--   donors only and Oh donors are never offered for other groups.
-- * Additive: existing rows, functions and policies are unchanged.
-- =============================================================================

alter type public.blood_group add value if not exists 'Oh';
