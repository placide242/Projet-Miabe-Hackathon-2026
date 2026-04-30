
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL DEFAULT '',
  display_name TEXT NOT NULL DEFAULT '',
  market TEXT NOT NULL DEFAULT '',
  lokalpay_id TEXT NOT NULL UNIQUE DEFAULT ('LK-CG-' || floor(random() * 9000 + 1000)::int),
  score INT NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  score_level TEXT NOT NULL DEFAULT 'Débutant',
  total_transactions INT NOT NULL DEFAULT 0,
  total_volume BIGINT NOT NULL DEFAULT 0,
  first_transaction_at TIMESTAMP WITH TIME ZONE,
  last_transaction_at TIMESTAMP WITH TIME ZONE,
  avatar_initials TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, phone, display_name, market, avatar_initials)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'market', ''),
    UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'display_name', ''), 1) || 
           COALESCE(SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'display_name', '') FROM '^\S+\s+(\S)'), ''))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- TRANSACTIONS TABLE
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  montant INT NOT NULL CHECK (montant >= 100),
  partenaire TEXT NOT NULL DEFAULT '',
  produit TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'achat' CHECK (type IN ('achat', 'vente')),
  synced BOOLEAN NOT NULL DEFAULT true,
  tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public can view transactions by lokalpay_id" ON public.transactions FOR SELECT USING (true);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- EVALUATIONS TABLE
CREATE TABLE public.evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  evaluated_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note INT NOT NULL CHECK (note >= 1 AND note <= 5),
  commentaire TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(transaction_id, evaluator_id)
);

ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Evaluations are viewable by everyone" ON public.evaluations FOR SELECT USING (true);
CREATE POLICY "Users can create evaluations" ON public.evaluations FOR INSERT WITH CHECK (auth.uid() = evaluator_id);

-- DISPUTES TABLE
CREATE TABLE public.disputes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accused_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'rejected')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(transaction_id, reporter_id)
);

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view disputes involving them" ON public.disputes FOR SELECT 
  USING (auth.uid() = reporter_id OR auth.uid() = accused_id);
CREATE POLICY "Users can create disputes" ON public.disputes FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can update disputes they are involved in" ON public.disputes FOR UPDATE 
  USING (auth.uid() = reporter_id OR auth.uid() = accused_id);

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON public.disputes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SCORE CALCULATION FUNCTION
CREATE OR REPLACE FUNCTION public.calculate_reputation_score(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  tx_count INT;
  tx_volume BIGINT;
  tx_regularity FLOAT;
  dispute_count INT;
  months_active INT;
  n_norm FLOAT;
  m_norm FLOAT;
  r_norm FLOAT;
  l_norm FLOAT;
  a_norm FLOAT;
  final_score INT;
BEGIN
  SELECT COUNT(*), COALESCE(SUM(montant), 0)
  INTO tx_count, tx_volume
  FROM public.transactions
  WHERE user_id = p_user_id AND created_at >= now() - interval '12 months';

  SELECT COALESCE(1.0 - LEAST(STDDEV(diff) / 30.0, 1.0), 0)
  INTO tx_regularity
  FROM (
    SELECT EXTRACT(EPOCH FROM (created_at - LAG(created_at) OVER (ORDER BY created_at))) / 86400.0 as diff
    FROM public.transactions
    WHERE user_id = p_user_id AND created_at >= now() - interval '12 months'
  ) sub WHERE diff IS NOT NULL;

  SELECT COUNT(*) INTO dispute_count
  FROM public.disputes WHERE accused_id = p_user_id AND status = 'open';

  SELECT COALESCE(EXTRACT(MONTH FROM AGE(now(), MIN(created_at)))::INT, 0)
  INTO months_active FROM public.transactions WHERE user_id = p_user_id;

  n_norm := LEAST(tx_count::FLOAT / 200.0, 1.0);
  m_norm := LEAST(tx_volume::FLOAT / 5000000.0, 1.0);
  r_norm := COALESCE(tx_regularity, 0);
  l_norm := LEAST(dispute_count::FLOAT / 5.0, 1.0);
  a_norm := LEAST(months_active::FLOAT / 12.0, 1.0);

  final_score := ROUND(
    (0.3 * n_norm + 0.2 * m_norm + 0.2 * r_norm + 0.2 * (1.0 - l_norm) + 0.1 * a_norm) * 100
  )::INT;

  UPDATE public.profiles
  SET score = final_score,
      score_level = CASE
        WHEN final_score >= 80 THEN 'Or'
        WHEN final_score >= 60 THEN 'Argent'
        WHEN final_score >= 40 THEN 'Bronze'
        ELSE 'Débutant'
      END,
      total_transactions = tx_count,
      total_volume = tx_volume,
      last_transaction_at = (SELECT MAX(created_at) FROM public.transactions WHERE user_id = p_user_id),
      first_transaction_at = (SELECT MIN(created_at) FROM public.transactions WHERE user_id = p_user_id)
  WHERE user_id = p_user_id;

  RETURN final_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Auto-recalculate score after each transaction
CREATE OR REPLACE FUNCTION public.recalculate_score_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.calculate_reputation_score(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER after_transaction_insert
AFTER INSERT ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.recalculate_score_on_transaction();
