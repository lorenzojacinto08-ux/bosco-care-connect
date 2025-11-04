-- Create student_applications table
CREATE TABLE IF NOT EXISTS public.student_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  email_address TEXT NOT NULL,
  phone_number TEXT,
  address TEXT,
  grade_year_level TEXT NOT NULL,
  section_program TEXT,
  education_level TEXT NOT NULL,
  parent_guardian_name TEXT,
  guardian_contact TEXT,
  guardian_relationship TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.student_applications ENABLE ROW LEVEL SECURITY;

-- Students can create their own application (only one)
CREATE POLICY "Students can create their own application"
ON public.student_applications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Students can view their own application
CREATE POLICY "Students can view their own application"
ON public.student_applications
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON public.student_applications
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all applications
CREATE POLICY "Admins can update all applications"
ON public.student_applications
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete applications
CREATE POLICY "Admins can delete applications"
ON public.student_applications
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_student_applications_updated_at
BEFORE UPDATE ON public.student_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();