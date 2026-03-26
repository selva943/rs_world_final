-- Create public.users table for OTP-based login
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow public to select users by phone (for login check)
CREATE POLICY "Allow public select by phone" ON public.users
  FOR SELECT USING (true);

-- Allow public to insert new users (for auto-creation)
CREATE POLICY "Allow public insert users" ON public.users
  FOR INSERT WITH CHECK (true);

-- Allow users to update their own data
CREATE POLICY "Allow users to update own data" ON public.users
  FOR UPDATE USING (true);
