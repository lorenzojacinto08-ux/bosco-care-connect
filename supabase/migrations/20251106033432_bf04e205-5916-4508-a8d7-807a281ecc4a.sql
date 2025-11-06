-- Add rejection_reason field to student_applications
ALTER TABLE public.student_applications
ADD COLUMN rejection_reason TEXT;