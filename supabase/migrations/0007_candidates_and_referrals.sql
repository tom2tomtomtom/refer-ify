-- Candidates master profile table
create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  first_name text,
  last_name text,
  phone text,
  linkedin_url text,
  current_company text,
  current_title text,
  years_experience int,
  location text,
  salary_expectation_min int,
  salary_expectation_max int,
  work_authorization text,
  availability text,
  resume_url text,
  resume_filename text,
  created_at timestamptz default now()
);

-- Candidate referrals join/metadata table
create table if not exists public.candidate_referrals (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid references public.referrals(id) on delete cascade,
  candidate_id uuid references public.candidates(id) on delete cascade,
  referrer_notes text,
  relationship_to_candidate text,
  referral_reason text,
  candidate_consent_given boolean default false,
  candidate_consent_date timestamptz,
  referrer_confidence int,
  created_at timestamptz default now()
);

-- Basic RLS (adjust as needed)
alter table public.candidates enable row level security;
alter table public.candidate_referrals enable row level security;

-- Allow owners (by email match) and network roles to view/insert in dev
create policy if not exists candidates_read for public.candidates
  using (true);
create policy if not exists candidates_insert for public.candidates
  with check (true);

create policy if not exists candidate_referrals_read for public.candidate_referrals
  using (true);
create policy if not exists candidate_referrals_insert for public.candidate_referrals
  with check (true);

