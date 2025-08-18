-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Enums
create type public.user_role as enum ('founding_circle','select_circle','client','candidate');
create type public.job_status as enum ('draft','active','paused','filled');
create type public.subscription_tier as enum ('connect','priority','exclusive');
create type public.referral_status as enum ('submitted','reviewed','shortlisted','hired','rejected');

-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role,
  email text,
  first_name text,
  last_name text,
  company text,
  linkedin_url text,
  created_at timestamp with time zone default now()
);

-- Jobs table
create table if not exists public.jobs (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  description text,
  requirements jsonb,
  salary_min integer,
  salary_max integer,
  currency text,
  status public.job_status default 'draft',
  subscription_tier public.subscription_tier,
  created_at timestamp with time zone default now()
);

-- Referrals table
create table if not exists public.referrals (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  candidate_email text,
  candidate_resume_url text,
  status public.referral_status default 'submitted',
  ai_match_score numeric,
  consent_given boolean default false,
  created_at timestamp with time zone default now()
);

-- Subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  tier public.subscription_tier,
  stripe_subscription_id text,
  status text,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone
);

-- RLS
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.referrals enable row level security;
alter table public.subscriptions enable row level security;

-- Profiles policies
create policy "profiles_select_self" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_self" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_self" on public.profiles for update using (auth.uid() = id);

-- Jobs policies
create policy "jobs_read_all" on public.jobs for select using (true);
create policy "jobs_client_manage" on public.jobs for insert with check (auth.uid() = client_id);
create policy "jobs_update_client" on public.jobs for update using (auth.uid() = client_id);

-- Referrals policies
create policy "referrals_read_own" on public.referrals for select using (auth.uid() = referrer_id);
create policy "referrals_insert_self" on public.referrals for insert with check (auth.uid() = referrer_id);

-- Subscriptions policies
create policy "subscriptions_read_own" on public.subscriptions for select using (auth.uid() = client_id);
create policy "subscriptions_manage_own" on public.subscriptions for insert with check (auth.uid() = client_id);

-- Storage bucket for resumes and policies
insert into storage.buckets (id, name, public) values ('resumes','resumes', false)
on conflict (id) do nothing;

-- Allow authenticated users to upload to their own folder
create policy "resumes_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'resumes' and (auth.uid()::text || '/') = substring(name from 1 for length(auth.uid()::text) + 1)
  );

-- Allow owners to read their own resumes
create policy "resumes_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'resumes' and (auth.uid()::text || '/') = substring(name from 1 for length(auth.uid()::text) + 1)
  );


