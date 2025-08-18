-- Add missing columns to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS location_type text,
ADD COLUMN IF NOT EXISTS location_city text,
ADD COLUMN IF NOT EXISTS skills text[],
ADD COLUMN IF NOT EXISTS experience_level text,
ADD COLUMN IF NOT EXISTS job_type text;

-- Update jobs table with default values for existing rows
UPDATE public.jobs 
SET 
  location_type = 'remote',
  experience_level = 'mid',
  job_type = 'full_time'
WHERE location_type IS NULL OR experience_level IS NULL OR job_type IS NULL;
