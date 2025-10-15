-- Referrer Applications Table
-- Migration: 0009
-- Purpose: Store applications from potential referrers (Select Circle members)
-- Created: 2025-10-15

create table if not exists public.referrer_applications (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  linkedin_url text not null,
  years_experience text not null check (years_experience in ('10-15 years', '15-20 years', '20+ years')),
  current_company text,
  current_title text,
  job_types text not null,
  industries text not null,
  network_description text,
  motivation text,
  referral_source text,
  referred_by_email text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.referrer_applications enable row level security;

-- Policy: Allow anyone to insert (public application)
-- Note: In production, consider adding rate limiting via API layer
create policy "referrer_applications_insert" on public.referrer_applications
  for insert with check (true);

-- Policy: Only authenticated admins can view applications
-- Note: This will need to be refined when admin role system is implemented
create policy "referrer_applications_select" on public.referrer_applications
  for select using (auth.role() = 'authenticated');

-- Policy: Only authenticated admins can update applications
create policy "referrer_applications_update" on public.referrer_applications
  for update using (auth.role() = 'authenticated');

-- Indexes for efficient querying
create index if not exists idx_referrer_applications_status on public.referrer_applications(status);
create index if not exists idx_referrer_applications_email on public.referrer_applications(email);
create index if not exists idx_referrer_applications_created_at on public.referrer_applications(created_at desc);

-- Trigger to update updated_at timestamp
create or replace function public.update_referrer_applications_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_referrer_applications_updated_at
  before update on public.referrer_applications
  for each row
  execute function public.update_referrer_applications_updated_at();

-- Comment on table and important columns
comment on table public.referrer_applications is 'Applications from potential referrers (Select Circle members) to join the platform';
comment on column public.referrer_applications.status is 'Application status: pending (default), approved, or rejected';
comment on column public.referrer_applications.years_experience is 'Senior executive experience level required for Select Circle';
comment on column public.referrer_applications.job_types is 'Comma-separated list of job types the referrer can support';
comment on column public.referrer_applications.industries is 'Comma-separated list of industries where referrer has network';
