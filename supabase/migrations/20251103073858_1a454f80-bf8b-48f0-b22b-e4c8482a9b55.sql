-- Allow admins to view all profiles so admin pages can fetch student emails/names
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));