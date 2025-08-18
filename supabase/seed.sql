-- Seed profiles for any existing auth users who do not yet have a profile
insert into public.profiles (id, role, email, first_name, last_name)
select
  u.id,
  'client'::public.user_role as role,
  u.email,
  null as first_name,
  null as last_name
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);

-- If you want a specific role for your current account, you can run for your user id:
-- update public.profiles set role = 'client' where id = '<YOUR_AUTH_USER_ID>'; 


