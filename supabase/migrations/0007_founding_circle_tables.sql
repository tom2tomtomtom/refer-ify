-- =============================================
-- FOUNDING CIRCLE DASHBOARD TABLES
-- Migration: 0007_founding_circle_tables.sql
-- =============================================

-- Founding metrics tracking (monthly performance data)
create table if not exists public.founding_metrics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  month date not null,
  network_revenue numeric default 0,
  direct_referrals numeric default 0,
  advisory_revenue numeric default 0,
  active_network_members integer default 0,
  successful_placements integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, month)
);

-- Advisory sessions (1-on-1 consulting sessions)
create table if not exists public.advisory_sessions (
  id uuid primary key default uuid_generate_v4(),
  founder_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid references public.profiles(id) on delete set null,
  duration_hours numeric not null default 1.0,
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'no_show')),
  session_date timestamp with time zone,
  session_type text default 'strategy' check (session_type in ('strategy', 'hiring', 'network', 'market_intel')),
  hourly_rate numeric default 500,
  notes text,
  outcome text,
  follow_up_required boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Select circle invitations tracking
create table if not exists public.select_circle_invitations (
  id uuid primary key default uuid_generate_v4(),
  founder_id uuid not null references public.profiles(id) on delete cascade,
  invited_email text not null,
  invited_name text,
  invited_company text,
  invited_title text,
  status text default 'sent' check (status in ('sent', 'opened', 'accepted', 'declined', 'expired')),
  invitation_message text,
  relationship_context text,
  expected_expertise text[],
  sent_at timestamp with time zone default now(),
  opened_at timestamp with time zone,
  responded_at timestamp with time zone,
  accepted_at timestamp with time zone,
  expires_at timestamp with time zone default (now() + interval '30 days'),
  created_at timestamp with time zone default now(),
  unique(founder_id, invited_email)
);

-- Network growth tracking (member activity and performance)
create table if not exists public.network_activity (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references public.profiles(id) on delete cascade,
  activity_type text not null check (activity_type in ('referral_made', 'referral_success', 'job_viewed', 'login', 'profile_updated')),
  activity_data jsonb,
  points_earned integer default 0,
  created_at timestamp with time zone default now()
);

-- Revenue calculations and distributions
create table if not exists public.revenue_distributions (
  id uuid primary key default uuid_generate_v4(),
  referral_id uuid not null references public.referrals(id) on delete cascade,
  founding_member_id uuid references public.profiles(id) on delete set null,
  select_member_id uuid references public.profiles(id) on delete set null,
  placement_fee numeric not null,
  platform_share numeric not null default 0.45,
  select_share numeric not null default 0.40,
  founding_share numeric not null default 0.15,
  status text default 'calculated' check (status in ('calculated', 'paid', 'disputed')),
  paid_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

alter table public.founding_metrics enable row level security;
alter table public.advisory_sessions enable row level security;
alter table public.select_circle_invitations enable row level security;
alter table public.network_activity enable row level security;
alter table public.revenue_distributions enable row level security;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Founding metrics policies
create policy "founding_metrics_own_data" on public.founding_metrics 
  for all using (auth.uid() = user_id);

-- Advisory sessions policies  
create policy "advisory_sessions_founder_access" on public.advisory_sessions 
  for all using (auth.uid() = founder_id);

create policy "advisory_sessions_client_read" on public.advisory_sessions 
  for select using (auth.uid() = client_id);

-- Invitations policies
create policy "invitations_founder_manage" on public.select_circle_invitations 
  for all using (auth.uid() = founder_id);

-- Network activity policies
create policy "network_activity_own_data" on public.network_activity 
  for all using (auth.uid() = member_id);

create policy "network_activity_founding_read" on public.network_activity 
  for select using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'founding_circle'
    )
  );

-- Revenue distributions policies
create policy "revenue_distributions_involved_parties" on public.revenue_distributions 
  for select using (
    auth.uid() = founding_member_id or 
    auth.uid() = select_member_id or
    auth.uid() in (
      select referrer_id from public.referrals where id = referral_id
    )
  );

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

create index if not exists idx_founding_metrics_user_month on public.founding_metrics(user_id, month desc);
create index if not exists idx_advisory_sessions_founder on public.advisory_sessions(founder_id, session_date desc);
create index if not exists idx_invitations_founder_status on public.select_circle_invitations(founder_id, status);
create index if not exists idx_network_activity_member_date on public.network_activity(member_id, created_at desc);
create index if not exists idx_revenue_distributions_referral on public.revenue_distributions(referral_id);

-- =============================================
-- FUNCTIONS FOR AUTOMATIC CALCULATIONS
-- =============================================

-- Function to update founding metrics when referrals are successful
create or replace function update_founding_metrics()
returns trigger as $$
begin
  -- Update metrics when a referral becomes successful
  if NEW.status = 'hired' and OLD.status != 'hired' then
    insert into public.founding_metrics (user_id, month, successful_placements)
    values (NEW.referrer_id, date_trunc('month', NEW.created_at)::date, 1)
    on conflict (user_id, month) 
    do update set 
      successful_placements = founding_metrics.successful_placements + 1,
      updated_at = now();
  end if;
  
  return NEW;
end;
$$ language plpgsql;

-- Trigger to automatically update metrics
create trigger update_founding_metrics_trigger
  after update on public.referrals
  for each row execute procedure update_founding_metrics();

-- =============================================
-- INITIAL DATA POPULATION
-- =============================================

-- Add some sample data for founding circle members
-- This will be populated with real data once the tables exist
