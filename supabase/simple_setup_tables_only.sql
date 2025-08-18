-- =============================================
-- SIMPLE SETUP: TABLES ONLY (NO SEED DATA)
-- This creates the tables without any sample data
-- The dashboard will work with empty tables and real data as you use it
-- =============================================

-- Just run the migration to create tables
-- Skip seed data for now - dashboard works with empty tables

-- After tables are created, verify they exist:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'founding_metrics',
  'advisory_sessions', 
  'select_circle_invitations',
  'network_activity',
  'revenue_distributions'
);

-- Check if your profile exists:
SELECT id, email, role, first_name, last_name 
FROM public.profiles 
WHERE email = 'thyde_uk@icloud.com';
