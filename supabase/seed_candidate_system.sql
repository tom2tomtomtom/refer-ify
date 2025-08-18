-- =============================================
-- CANDIDATE REFERRAL SYSTEM SEED DATA
-- Creates sample candidates and referrals for testing
-- Run after 0008_candidate_referral_system.sql migration
-- =============================================

-- Sample candidates with diverse backgrounds
INSERT INTO public.candidates (
  email, first_name, last_name, current_company, current_title, 
  years_experience, location, salary_expectation_min, salary_expectation_max,
  availability, work_authorization, skills, preferences
) VALUES 
  (
    'alex.rodriguez@techcorp.com', 'Alex', 'Rodriguez', 'TechCorp', 'Senior Software Engineer',
    8, 'San Francisco, CA', 180000, 220000, '1_month', 'us_citizen',
    '{"programming_languages": ["Python", "JavaScript", "Go"], "frameworks": ["React", "Django", "FastAPI"], "leadership": ["Team Lead", "Mentoring"], "domains": ["FinTech", "AI/ML"]}',
    '{"remote_work": "hybrid", "travel": "minimal", "company_size": "startup_to_midsize"}'
  ),
  (
    'maria.gonzalez@datasci.io', 'Maria', 'Gonzalez', 'DataSci Solutions', 'VP of Data Science',
    12, 'New York, NY', 250000, 300000, '2_weeks', 'green_card',
    '{"programming_languages": ["Python", "R", "SQL"], "ml_frameworks": ["TensorFlow", "PyTorch", "Scikit-learn"], "leadership": ["Team Management", "Strategic Planning"], "domains": ["Healthcare", "Finance", "E-commerce"]}',
    '{"remote_work": "remote_first", "travel": "quarterly", "company_size": "enterprise"}'
  ),
  (
    'david.kim@startupx.com', 'David', 'Kim', 'StartupX', 'Head of Product',
    10, 'Austin, TX', 200000, 250000, 'immediate', 'us_citizen',
    '{"product_management": ["Strategy", "Roadmapping", "User Research"], "technical": ["SQL", "Analytics", "A/B Testing"], "leadership": ["Cross-functional", "Stakeholder Management"], "domains": ["SaaS", "Consumer Apps", "B2B"]}',
    '{"remote_work": "flexible", "travel": "monthly", "company_size": "growth_stage"}'
  ),
  (
    'sarah.chen@consultco.com', 'Sarah', 'Chen', 'ConsultCo', 'Senior Manager',
    6, 'Seattle, WA', 160000, 190000, '3_months', 'h1b',
    '{"consulting": ["Strategy", "Operations", "Digital Transformation"], "technical": ["Excel", "PowerBI", "Tableau"], "industries": ["Healthcare", "Retail", "Technology"]}',
    '{"remote_work": "in_person", "travel": "weekly", "company_size": "any"}'
  ),
  (
    'james.wilson@securityfirm.com', 'James', 'Wilson', 'SecFirm', 'Cybersecurity Director',
    15, 'Washington, DC', 280000, 350000, 'not_looking', 'us_citizen',
    '{"security": ["CISO", "Risk Management", "Compliance"], "technical": ["Cloud Security", "Zero Trust", "Incident Response"], "certifications": ["CISSP", "CISM"], "domains": ["Financial Services", "Government", "Healthcare"]}',
    '{"remote_work": "hybrid", "travel": "minimal", "company_size": "enterprise"}'
  )
ON CONFLICT (email) DO NOTHING;

-- Create some candidate skills entries
INSERT INTO public.candidate_skills (candidate_id, skill_name, skill_category, proficiency_level, years_experience, source) 
SELECT 
  c.id,
  skill.skill_name,
  skill.category,
  skill.level,
  skill.years,
  'resume'
FROM public.candidates c
CROSS JOIN (
  VALUES 
    ('Python', 'programming', 5, 8),
    ('JavaScript', 'programming', 4, 6),
    ('React', 'framework', 4, 5),
    ('Team Leadership', 'leadership', 4, 3),
    ('Machine Learning', 'technical', 5, 4)
) AS skill(skill_name, category, level, years)
WHERE c.email = 'alex.rodriguez@techcorp.com'
ON CONFLICT (candidate_id, skill_name) DO NOTHING;

-- Sample referrals with enhanced candidate data
-- First, get some job IDs to create referrals against
INSERT INTO public.referrals (
  job_id, referrer_id, candidate_email, candidate_first_name, candidate_last_name,
  candidate_phone, candidate_linkedin, referrer_relationship, referrer_confidence,
  status, ai_match_score, consent_given, candidate_resume_url
)
SELECT 
  j.id as job_id,
  '34c467cd-1bca-400c-bcd6-769481b06afe' as referrer_id,
  ref.email,
  ref.first_name,
  ref.last_name,
  ref.phone,
  ref.linkedin,
  ref.relationship,
  ref.confidence,
  ref.status::public.referral_status,
  ref.match_score,
  true,
  ref.resume_url
FROM public.jobs j
CROSS JOIN (
  VALUES 
    ('alex.rodriguez@techcorp.com', 'Alex', 'Rodriguez', '+1-555-0123', 'https://linkedin.com/in/alexrodriguez', 'former_colleague', 5, 'submitted', 0.85, '/resumes/alex_rodriguez_resume.pdf'),
    ('maria.gonzalez@datasci.io', 'Maria', 'Gonzalez', '+1-555-0124', 'https://linkedin.com/in/mariagonzalez', 'conference_connection', 4, 'reviewed', 0.92, '/resumes/maria_gonzalez_resume.pdf'),
    ('david.kim@startupx.com', 'David', 'Kim', '+1-555-0125', 'https://linkedin.com/in/davidkim', 'mutual_connection', 4, 'shortlisted', 0.78, '/resumes/david_kim_resume.pdf')
) AS ref(email, first_name, last_name, phone, linkedin, relationship, confidence, status, match_score, resume_url)
WHERE j.status = 'active'
LIMIT 3
ON CONFLICT DO NOTHING;

-- Sample AI match analysis results
INSERT INTO public.ai_match_analysis (
  candidate_id, job_id, ai_match_score, skill_match_score, experience_match_score, culture_fit_score,
  ai_analysis, missing_skills, strengths, concerns, recommendation
)
SELECT 
  c.id as candidate_id,
  j.id as job_id,
  analysis.overall_score,
  analysis.skill_score,
  analysis.exp_score,
  analysis.culture_score,
  analysis.ai_analysis::jsonb,
  analysis.missing_skills::jsonb,
  analysis.strengths::jsonb,
  analysis.concerns::jsonb,
  analysis.recommendation::text
FROM public.candidates c
CROSS JOIN public.jobs j
CROSS JOIN (
  VALUES (
    0.85, 0.90, 0.80, 0.85,
    '{"summary": "Strong technical background with relevant experience in fintech and AI/ML. Good cultural fit for startup environment.", "technical_assessment": "Excellent programming skills, particularly in Python and modern frameworks", "experience_relevance": "8 years experience aligns well with senior role requirements"}',
    '["Kubernetes", "GraphQL"]',
    '["Strong Python/React skills", "FinTech domain experience", "Leadership experience", "Startup background"]',
    '["Limited experience with specific tech stack", "Salary expectations may be high"]',
    'strong_match'
  )
) AS analysis(overall_score, skill_score, exp_score, culture_score, ai_analysis, missing_skills, strengths, concerns, recommendation)
WHERE c.email = 'alex.rodriguez@techcorp.com' 
AND j.status = 'active'
LIMIT 1
ON CONFLICT (candidate_id, job_id) DO NOTHING;

-- Sample candidate interactions
INSERT INTO public.candidate_interactions (
  candidate_id, job_id, interaction_type, notes, completed_at, outcome, next_steps, created_by
)
SELECT 
  c.id as candidate_id,
  j.id as job_id,
  interaction.type::text,
  interaction.notes,
  interaction.completed_at::timestamp with time zone,
  interaction.outcome,
  interaction.next_steps,
  '34c467cd-1bca-400c-bcd6-769481b06afe' as created_by
FROM public.candidates c
CROSS JOIN public.jobs j
CROSS JOIN (
  VALUES 
    ('referral_submitted', 'Initial referral submitted with strong recommendation', '2024-08-15 10:00:00+00', 'Referral accepted for review', 'Schedule initial screening call', true),
    ('screening_call', 'Initial 30-min screening call completed', '2024-08-16 14:00:00+00', 'Positive screening, moving to technical interview', 'Schedule technical interview with engineering team', true)
) AS interaction(type, notes, completed_at, outcome, next_steps, include)
WHERE c.email = 'alex.rodriguez@techcorp.com' 
AND j.status = 'active'
AND interaction.include = true
LIMIT 1;

-- Verification queries
SELECT 'Candidates Created' as table_name, count(*) as records FROM public.candidates
UNION ALL
SELECT 'Sample Referrals' as table_name, count(*) as records FROM public.referrals WHERE candidate_email IN ('alex.rodriguez@techcorp.com', 'maria.gonzalez@datasci.io', 'david.kim@startupx.com')
UNION ALL
SELECT 'AI Analysis Records' as table_name, count(*) as records FROM public.ai_match_analysis
UNION ALL
SELECT 'Candidate Interactions' as table_name, count(*) as records FROM public.candidate_interactions
UNION ALL
SELECT 'Candidate Skills' as table_name, count(*) as records FROM public.candidate_skills;
