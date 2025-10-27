-- Allow users to insert their own role during signup
CREATE POLICY "Users can insert their own role during signup"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Insert admin role for existing users that don't have roles
-- This will help any users who signed up before the policy was added
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get user IDs from auth.users that don't have roles yet
  FOR admin_user_id IN 
    SELECT id FROM auth.users 
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_id = auth.users.id
    )
  LOOP
    -- Insert admin role for users without roles
    -- You can manually change these to 'student' if needed after checking which users should be admins
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin');
  END LOOP;
END $$;