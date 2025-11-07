-- Add remarks column to guidance_schedules table
ALTER TABLE public.guidance_schedules
ADD COLUMN remarks TEXT;