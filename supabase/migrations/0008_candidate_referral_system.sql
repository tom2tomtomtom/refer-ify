-- =============================================
-- CANDIDATE REFERRAL SYSTEM TABLES
-- Migration: 0008_candidate_referral_system.sql
-- Extends existing referrals table and adds candidate management
-- =============================================

-- Enhanced candidate profiles (separate from user profiles)
create table if not exists public.candidates (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  first_name text,
  last_name text,
  phone text,
  linkedin_url text,
  current_company text,
  current_title text,
  years_experience integer,
  location text,
  salary_expectation_min integer,
  salary_expectation_max integer,
  currency text default 'USD',
  availability text check (availability in ('immediate', '2_weeks', '1_month', '3_months', 'not_looking')),
  work_authorization text check (work_authorization in ('us_citizen', 'green_card', 'h1b', 'opt', 'requires_sponsorship')),
  resume_url text,
  resume_filename text,
  ai_summary text,
  skills jsonb,
  preferences jsonb, -- remote work, salary range, location preferences
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Candidate referral tracking (extends existing referrals)
create table if not exists public.candidate_referrals (
  id uuid primary key default uuid_generate_v4(),
  referral_id uuid not null references public.referrals(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  referrer_notes text,
  relationship_to_candidate text, -- how referrer knows the candidate
  referral_reason text, -- why they're recommending this person
  candidate_consent_given boolean default false,
  candidate_consent_date timestamp with time zone,
  referrer_confidence integer check (referrer_confidence between 1 and 5),
  created_at timestamp with time zone default now(),
  unique(referral_id, candidate_id)
);

-- AI matching and analysis results
create table if not exists public.ai_match_analysis (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  ai_match_score numeric check (ai_match_score between 0 and 1),
  skill_match_score numeric check (skill_match_score between 0 and 1),
  experience_match_score numeric check (experience_match_score between 0 and 1),
  culture_fit_score numeric check (culture_fit_score between 0 and 1),
  ai_analysis jsonb, -- detailed AI analysis breakdown
  missing_skills jsonb, -- skills required but not present
  strengths jsonb, -- candidate's key strengths for this role
  concerns jsonb, -- potential concerns or gaps
  recommendation text check (recommendation in ('strong_match', 'good_match', 'possible_match', 'poor_match')),
  analyzed_at timestamp with time zone default now(),
  ai_model_version text default 'gpt-4-turbo',
  unique(candidate_id, job_id)
);

-- Candidate interaction tracking
create table if not exists public.candidate_interactions (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  interaction_type text not null check (interaction_type in ('referral_submitted', 'resume_uploaded', 'screening_call', 'client_interview', 'offer_extended', 'offer_accepted', 'offer_declined', 'withdrawn')),
  notes text,
  scheduled_for timestamp with time zone,
  completed_at timestamp with time zone,
  outcome text,
  next_steps text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Candidate skills and expertise tracking
create table if not exists public.candidate_skills (
  id uuid primary key default uuid_generate_v4(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  skill_name text not null,
  skill_category text, -- e.g., 'programming', 'leadership', 'domain_knowledge'
  proficiency_level integer check (proficiency_level between 1 and 5),
  years_experience numeric,
  verified boolean default false,
  source text default 'resume', -- 'resume', 'linkedin', 'interview', 'reference'
  created_at timestamp with time zone default now(),
  unique(candidate_id, skill_name)
);

-- =============================================
-- ENHANCE EXISTING REFERRALS TABLE
-- Add new columns to existing referrals table
-- =============================================

-- Add candidate management fields to existing referrals table
alter table public.referrals 
add column if not exists candidate_first_name text,
add column if not exists candidate_last_name text,
add column if not exists candidate_phone text,
add column if not exists candidate_linkedin text,
add column if not exists referrer_relationship text,
add column if not exists referrer_confidence integer check (referrer_confidence between 1 and 5),
add column if not exists client_feedback text,
add column if not exists interview_scheduled_at timestamp with time zone,
add column if not exists interview_completed_at timestamp with time zone,
add column if not exists final_outcome text,
add column if not exists updated_at timestamp with time zone default now();

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

alter table public.candidates enable row level security;
alter table public.candidate_referrals enable row level security;
alter table public.ai_match_analysis enable row level security;
alter table public.candidate_interactions enable row level security;
alter table public.candidate_skills enable row level security;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Candidates policies
create policy "candidates_referrers_read" on public.candidates 
  for select using (
    id in (
      select cr.candidate_id from public.candidate_referrals cr
      join public.referrals r on r.id = cr.referral_id
      where r.referrer_id = auth.uid()
    )
  );

create policy "candidates_clients_read" on public.candidates 
  for select using (
    id in (
      select cr.candidate_id from public.candidate_referrals cr
      join public.referrals r on r.id = cr.referral_id
      join public.jobs j on j.id = r.job_id
      where j.client_id = auth.uid()
    )
  );

-- Candidate referrals policies
create policy "candidate_referrals_referrer" on public.candidate_referrals 
  for all using (
    referral_id in (
      select id from public.referrals where referrer_id = auth.uid()
    )
  );

-- AI match analysis policies
create policy "ai_match_analysis_involved_parties" on public.ai_match_analysis 
  for select using (
    job_id in (select id from public.jobs where client_id = auth.uid()) or
    candidate_id in (
      select cr.candidate_id from public.candidate_referrals cr
      join public.referrals r on r.id = cr.referral_id
      where r.referrer_id = auth.uid()
    )
  );

-- Candidate interactions policies
create policy "candidate_interactions_involved_parties" on public.candidate_interactions 
  for all using (
    created_by = auth.uid() or
    job_id in (select id from public.jobs where client_id = auth.uid()) or
    candidate_id in (
      select cr.candidate_id from public.candidate_referrals cr
      join public.referrals r on r.id = cr.referral_id
      where r.referrer_id = auth.uid()
    )
  );

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

create index if not exists idx_candidates_email on public.candidates(email);
create index if not exists idx_candidates_skills on public.candidates using gin(skills);
create index if not exists idx_candidate_referrals_referral on public.candidate_referrals(referral_id);
create index if not exists idx_candidate_referrals_candidate on public.candidate_referrals(candidate_id);
create index if not exists idx_ai_match_analysis_candidate_job on public.ai_match_analysis(candidate_id, job_id);
create index if not exists idx_ai_match_analysis_score on public.ai_match_analysis(ai_match_score desc);
create index if not exists idx_candidate_interactions_candidate on public.candidate_interactions(candidate_id);
create index if not exists idx_candidate_skills_candidate on public.candidate_skills(candidate_id);

-- =============================================
-- FUNCTIONS FOR AUTOMATION
-- =============================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_candidates_updated_at before update on public.candidates
  for each row execute procedure update_updated_at_column();

create trigger update_referrals_updated_at before update on public.referrals
  for each row execute procedure update_updated_at_column();

-- Function to create candidate profile from referral
create or replace function create_candidate_from_referral()
returns trigger as $$
begin
  -- Create candidate profile if email doesn't exist
  if NEW.candidate_email is not null then
    insert into public.candidates (
      email, 
      first_name, 
      last_name, 
      phone, 
      linkedin_url,
      resume_url
    ) values (
      NEW.candidate_email,
      NEW.candidate_first_name,
      NEW.candidate_last_name,
      NEW.candidate_phone,
      NEW.candidate_linkedin,
      NEW.candidate_resume_url
    ) on conflict (email) do update set
      first_name = coalesce(EXCLUDED.first_name, candidates.first_name),
      last_name = coalesce(EXCLUDED.last_name, candidates.last_name),
      phone = coalesce(EXCLUDED.phone, candidates.phone),
      linkedin_url = coalesce(EXCLUDED.linkedin_url, candidates.linkedin_url),
      resume_url = coalesce(EXCLUDED.resume_url, candidates.resume_url),
      updated_at = now();
  end if;
  
  return NEW;
end;
$$ language plpgsql;

-- Trigger to auto-create candidate profiles
create trigger create_candidate_from_referral_trigger
  after insert or update on public.referrals
  for each row execute procedure create_candidate_from_referral();
