-- Tighten jobs SELECT access and enforce tier-based visibility for referrers

-- Remove overly broad policy if it exists
drop policy if exists "jobs_read_all" on public.jobs;

-- Clients: may read their own jobs (any status)
create policy if not exists "jobs_client_select_own" on public.jobs
for select to authenticated
using (auth.uid() = client_id);

-- Founding Circle: may read ALL active jobs (all tiers)
create policy if not exists "jobs_founders_feed" on public.jobs
for select to authenticated
using (
  status = 'active'::public.job_status and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'founding_circle'::public.user_role
  )
);

-- Select Circle: may read active jobs in Connect or Priority tiers only
create policy if not exists "jobs_select_circle_feed" on public.jobs
for select to authenticated
using (
  status = 'active'::public.job_status and subscription_tier in ('connect'::public.subscription_tier,'priority'::public.subscription_tier) and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'select_circle'::public.user_role
  )
);


