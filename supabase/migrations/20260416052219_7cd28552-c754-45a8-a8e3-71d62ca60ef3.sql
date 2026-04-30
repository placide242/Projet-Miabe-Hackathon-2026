
-- Table for professional meetings between merchants
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID NOT NULL,
  invitee_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own meetings"
ON public.meetings FOR SELECT
USING (auth.uid() = organizer_id OR auth.uid() = invitee_id);

CREATE POLICY "Users can create meetings"
ON public.meetings FOR INSERT
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update their own meetings"
ON public.meetings FOR UPDATE
USING (auth.uid() = organizer_id OR auth.uid() = invitee_id);

CREATE TRIGGER update_meetings_updated_at
BEFORE UPDATE ON public.meetings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Table for mobile money operator links
CREATE TABLE public.operator_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  operator_name TEXT NOT NULL,
  phone_number TEXT NOT NULL DEFAULT '',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.operator_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own operators"
ON public.operator_links FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own operators"
ON public.operator_links FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own operators"
ON public.operator_links FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own operators"
ON public.operator_links FOR DELETE
USING (auth.uid() = user_id);

-- Public can view operator links (for profile pages)
CREATE POLICY "Public can view operator links"
ON public.operator_links FOR SELECT
USING (true);

-- Add solvency and reliability metrics to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS solvency_score INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS reliability_pct FLOAT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS debt_capacity BIGINT NOT NULL DEFAULT 0;

-- Enable realtime for meetings
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
