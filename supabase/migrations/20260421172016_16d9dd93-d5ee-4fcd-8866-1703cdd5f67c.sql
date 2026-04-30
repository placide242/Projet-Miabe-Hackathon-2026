ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS show_phone boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_email boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_volume boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS bio text DEFAULT '';