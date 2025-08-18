-- Additional referral metadata for executive referrals
alter table public.referrals
  add column if not exists current_company text,
  add column if not exists current_title text,
  add column if not exists relationship_context text;


