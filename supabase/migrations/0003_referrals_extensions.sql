-- Safely add 'interviewing' to referral_status enum if missing
do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_enum e on t.oid = e.enumtypid
    where t.typname = 'referral_status' and e.enumlabel = 'interviewing'
  ) then
    alter type public.referral_status add value 'interviewing';
  end if;
end$$;

-- Add additional referral columns if not present
alter table public.referrals
  add column if not exists candidate_name text,
  add column if not exists candidate_phone text,
  add column if not exists candidate_linkedin text,
  add column if not exists referrer_notes text,
  add column if not exists expected_salary integer,
  add column if not exists availability text,
  add column if not exists consent_timestamp timestamptz,
  add column if not exists consent_ip text,
  add column if not exists resume_storage_path text;

-- Helpful indexes
create index if not exists idx_referrals_job_id on public.referrals(job_id);
create index if not exists idx_referrals_referrer_id on public.referrals(referrer_id);
create index if not exists idx_referrals_status on public.referrals(status);


