# Refer-ify Setup Checklist

## ✅ Step 1: Database Setup
1. Open Supabase dashboard → SQL Editor
2. Copy/paste contents from `supabase/migrations/0001_init.sql` and run it
3. This creates your tables (profiles, jobs, referrals, subscriptions)

## ✅ Step 2: Authentication Setup
1. In Supabase → Authentication → Providers:
   - Enable "Email" provider (for magic links)
   - Enable "LinkedIn (OIDC)" provider with your Client ID/Secret

2. In Supabase → Authentication → URL Configuration:
   - Site URL: `http://localhost:3000`
   - Additional Redirect URLs: `http://localhost:3000/callback`

## ✅ Step 3: Test Login
1. Visit: http://localhost:3000/login
2. Try either:
   - Enter your email → "Send Link" → check your email
   - OR "Continue with LinkedIn" (if LinkedIn is working)

## ✅ Step 4: Verify Success
After login, check:
- Visit: http://localhost:3000/api/auth
- Should show: `{"user": {...your user data...}}`

## ✅ Step 5: Create Your Profile
1. In Supabase → SQL Editor, run:
```sql
-- Run the seed to create profiles for existing users
INSERT INTO public.profiles (id, role, email, first_name, last_name)
SELECT 
  u.id,
  'client'::public.user_role as role,
  u.email,
  null as first_name,
  null as last_name
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);
```

## ✅ Step 6: Test Dashboards
Visit these URLs (should work after login):
- http://localhost:3000/client
- http://localhost:3000/candidate
- http://localhost:3000/select-circle
- http://localhost:3000/founding-circle

---

## 🚨 If Something Goes Wrong:

**404 on callback?**
- Check Supabase redirect URL is exactly: `http://localhost:3000/callback`

**Can't sign in?**
- Enable Email provider in Supabase
- Try magic link instead of LinkedIn

**Dashboard says "unauthorized"?**
- Run the profile creation SQL above
- Check your role with: `SELECT * FROM public.profiles WHERE id = auth.uid();`

**Still stuck?**
- Check: http://localhost:3000/api/auth shows your user
- Check: Supabase → Authentication → Users shows your account
