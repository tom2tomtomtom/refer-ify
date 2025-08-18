-- =============================================
-- FIX: Create Profile First, Then Seed Data
-- Your user exists in auth.users but missing from profiles table
-- =============================================

-- Step 1: Create your profile record
INSERT INTO public.profiles (id, role, email, first_name, last_name, company, created_at)
VALUES (
  '34c467cd-1bca-400c-bcd6-769481b06afe',
  'founding_circle',
  'thyde_uk@icloud.com',
  'Thomas',
  'Dowuona-Hyde',
  'Refer-ify',
  now()
)
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  company = EXCLUDED.company;

-- Step 2: Verify profile was created
SELECT id, email, role, first_name, last_name, company 
FROM public.profiles 
WHERE id = '34c467cd-1bca-400c-bcd6-769481b06afe';

-- Step 3: Now run the founding metrics (this should work)
INSERT INTO public.founding_metrics (user_id, month, network_revenue, direct_referrals, advisory_revenue, active_network_members, successful_placements) 
VALUES 
  ('34c467cd-1bca-400c-bcd6-769481b06afe', '2024-08-01', 47250, 8500, 12000, 23, 3),
  ('34c467cd-1bca-400c-bcd6-769481b06afe', '2024-07-01', 42100, 7200, 8500, 21, 2),
  ('34c467cd-1bca-400c-bcd6-769481b06afe', '2024-06-01', 38900, 6800, 11000, 19, 4),
  ('34c467cd-1bca-400c-bcd6-769481b06afe', '2024-05-01', 35200, 5900, 9500, 18, 2),
  ('34c467cd-1bca-400c-bcd6-769481b06afe', '2024-04-01', 31800, 5200, 7800, 16, 3),
  ('34c467cd-1bca-400c-bcd6-769481b06afe', '2024-03-01', 28500, 4800, 6200, 15, 1)
ON CONFLICT (user_id, month) DO UPDATE SET
  network_revenue = EXCLUDED.network_revenue,
  direct_referrals = EXCLUDED.direct_referrals,
  advisory_revenue = EXCLUDED.advisory_revenue,
  active_network_members = EXCLUDED.active_network_members,
  successful_placements = EXCLUDED.successful_placements,
  updated_at = now();

-- Step 4: Add advisory sessions
INSERT INTO public.advisory_sessions (founder_id, duration_hours, status, session_date, session_type, hourly_rate, notes, outcome)
VALUES 
  ('34c467cd-1bca-400c-bcd6-769481b06afe', 2.0, 'scheduled', '2024-08-25 14:00:00+00', 'strategy', 750, 'Executive search strategy for Series B startup', NULL),
  ('34c467cd-1bca-400c-bcd6-769481b06afe', 1.5, 'completed', '2024-08-15 10:00:00+00', 'hiring', 500, 'CTO hiring roadmap for fintech company', 'Recommended executive search approach, provided 3 referrals'),
  ('34c467cd-1bca-400c-bcd6-769481b06afe', 3.0, 'scheduled', '2024-08-28 09:00:00+00', 'network', 600, 'Network expansion strategy for international markets', NULL),
  ('34c467cd-1bca-400c-bcd6-769481b06afe', 1.0, 'completed', '2024-08-12 16:00:00+00', 'market_intel', 400, 'Market intelligence on executive compensation trends', 'Provided comprehensive salary benchmarking report'),
  ('34c467cd-1bca-400c-bcd6-769481b06afe', 2.5, 'completed', '2024-08-08 11:00:00+00', 'strategy', 750, 'Board advisory on executive succession planning', 'Created succession framework, identified 2 internal candidates');

-- Step 5: Add invitations
INSERT INTO public.select_circle_invitations (founder_id, invited_email, invited_name, invited_company, invited_title, status, invitation_message, relationship_context, expected_expertise)
VALUES 
  ('34c467cd-1bca-400c-bcd6-769481b06afe', 'sarah.chen@meta.com', 'Sarah Chen', 'Meta', 'VP Engineering', 'accepted', 'Your expertise in scaling engineering teams would be invaluable to our network.', 'Worked together at previous startup', ARRAY['Engineering Leadership', 'Team Scaling', 'Product Development']),
  ('34c467cd-1bca-400c-bcd6-769481b06afe', 'michael.torres@stripe.com', 'Michael Torres', 'Stripe', 'Head of Revenue Operations', 'sent', 'We would love to have your revenue operations expertise in our select circle.', 'Met at SaaStr conference', ARRAY['Revenue Operations', 'Sales Strategy', 'Go-to-Market']),
  ('34c467cd-1bca-400c-bcd6-769481b06afe', 'jane.williams@openai.com', 'Jane Williams', 'OpenAI', 'Director of Talent', 'opened', 'Your talent acquisition experience would be perfect for our executive network.', 'Former colleague recommendation', ARRAY['Executive Recruiting', 'Talent Strategy', 'AI/ML Hiring']),
  ('34c467cd-1bca-400c-bcd6-769481b06afe', 'david.kim@sequoia.com', 'David Kim', 'Sequoia Capital', 'Principal', 'accepted', 'Your investment perspective would add tremendous value to our founder network.', 'Portfolio company connection', ARRAY['Investment Strategy', 'Due Diligence', 'Board Advisory']),
  ('34c467cd-1bca-400c-bcd6-769481b06afe', 'lisa.zhang@airbnb.com', 'Lisa Zhang', 'Airbnb', 'VP Product', 'declined', 'Your product leadership would be amazing for our community.', 'Stanford Alumni network', ARRAY['Product Strategy', 'User Experience', 'Growth'])
ON CONFLICT (founder_id, invited_email) DO UPDATE SET
  status = EXCLUDED.status,
  invited_name = EXCLUDED.invited_name,
  invited_company = EXCLUDED.invited_company;

-- Step 6: Add network activity
INSERT INTO public.network_activity (member_id, activity_type, activity_data, points_earned)
VALUES 
  ('34c467cd-1bca-400c-bcd6-769481b06afe', 'referral_success', '{"job_title": "VP Engineering", "company": "TechCorp", "placement_fee": 45000}', 150),
  ('34c467cd-1bca-400c-bcd6-769481b06afe', 'referral_made', '{"job_title": "Head of Sales", "company": "StartupXYZ"}', 25),
  ('34c467cd-1bca-400c-bcd6-769481b06afe', 'referral_success', '{"job_title": "Chief Marketing Officer", "company": "ScaleUp Inc", "placement_fee": 52000}', 175),
  ('34c467cd-1bca-400c-bcd6-769481b06afe', 'profile_updated', '{"fields_updated": ["expertise", "availability"]}', 10);

-- Final verification
SELECT 'Profile Created' as status, count(*) as records FROM public.profiles WHERE id = '34c467cd-1bca-400c-bcd6-769481b06afe'
UNION ALL
SELECT 'Founding Metrics' as status, count(*) as records FROM public.founding_metrics WHERE user_id = '34c467cd-1bca-400c-bcd6-769481b06afe'
UNION ALL
SELECT 'Advisory Sessions' as status, count(*) as records FROM public.advisory_sessions WHERE founder_id = '34c467cd-1bca-400c-bcd6-769481b06afe'  
UNION ALL
SELECT 'Invitations' as status, count(*) as records FROM public.select_circle_invitations WHERE founder_id = '34c467cd-1bca-400c-bcd6-769481b06afe'
UNION ALL
SELECT 'Network Activity' as status, count(*) as records FROM public.network_activity WHERE member_id = '34c467cd-1bca-400c-bcd6-769481b06afe';
