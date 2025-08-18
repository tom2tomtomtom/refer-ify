-- =============================================
-- STEP 1: GET YOUR USER ID
-- Run this first to find your user ID
-- =============================================

SELECT 
  id as user_id,
  email,
  'Copy this UUID for the next step' as instruction
FROM auth.users 
WHERE email = 'thyde_uk@icloud.com';

-- Alternative if the above doesn't work:
SELECT 
  id as user_id,
  email,
  'Copy this UUID for the next step' as instruction  
FROM public.profiles 
WHERE email = 'thyde_uk@icloud.com';
