-- Allow clients to read and update referrals for their own jobs
drop policy if exists "referrals_client_read" on public.referrals;
create policy "referrals_client_read" on public.referrals
for select to authenticated
using (
  exists (
    select 1 from public.jobs j
    where j.id = referrals.job_id and j.client_id = auth.uid()
  )
);

drop policy if exists "referrals_client_update" on public.referrals;
create policy "referrals_client_update" on public.referrals
for update to authenticated
using (
  exists (
    select 1 from public.jobs j
    where j.id = referrals.job_id and j.client_id = auth.uid()
  )
);


