
-- ==========================================
-- 1. PROFILES : nouveaux champs
-- ==========================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profile_type TEXT NOT NULL DEFAULT 'merchant',
  ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS organization_name TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS license_number TEXT DEFAULT '';

-- check constraints
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_profile_type_check') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_profile_type_check
      CHECK (profile_type IN ('merchant','client','microfinance','partner'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_subscription_plan_check') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_subscription_plan_check
      CHECK (subscription_plan IN ('free','premium','business'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique_idx ON public.profiles (phone) WHERE phone <> '';
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique_idx ON public.profiles (lower(email)) WHERE email <> '';

-- ==========================================
-- 2. TRANSACTIONS : étendre types + destinataire + statut blockchain
-- ==========================================
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS recipient_id UUID,
  ADD COLUMN IF NOT EXISTS blockchain_status TEXT NOT NULL DEFAULT 'confirmed',
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cash';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transactions_type_check') THEN
    ALTER TABLE public.transactions ADD CONSTRAINT transactions_type_check
      CHECK (type IN ('achat','vente','emprunt','pret','remboursement','paiement'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transactions_blockchain_status_check') THEN
    ALTER TABLE public.transactions ADD CONSTRAINT transactions_blockchain_status_check
      CHECK (blockchain_status IN ('pending','confirmed','failed'));
  END IF;
END $$;

-- ==========================================
-- 3. SUBSCRIPTIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('free','premium','business')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled','expired')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  amount_fcfa INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own subscriptions" ON public.subscriptions;
CREATE POLICY "Users update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- 4. COMMISSIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  transaction_id UUID,
  type TEXT NOT NULL CHECK (type IN ('paiement','transfert','pret')),
  base_amount INTEGER NOT NULL,
  commission_amount INTEGER NOT NULL,
  rate NUMERIC(5,4) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own commissions" ON public.commissions;
CREATE POLICY "Users view own commissions" ON public.commissions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own commissions" ON public.commissions;
CREATE POLICY "Users insert own commissions" ON public.commissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 5. EVALUATIONS : permettre update de la moyenne
-- ==========================================
CREATE OR REPLACE FUNCTION public.update_avg_rating()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles p
  SET avg_rating = COALESCE((SELECT ROUND(AVG(note)::numeric, 2) FROM public.evaluations WHERE evaluated_id = NEW.evaluated_id), 0),
      rating_count = (SELECT COUNT(*) FROM public.evaluations WHERE evaluated_id = NEW.evaluated_id)
  WHERE p.user_id = NEW.evaluated_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_eval_update_avg ON public.evaluations;
CREATE TRIGGER trg_eval_update_avg
  AFTER INSERT ON public.evaluations
  FOR EACH ROW EXECUTE FUNCTION public.update_avg_rating();

-- ==========================================
-- 6. handle_new_user : prendre en compte profile_type, email, plan
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, phone, email, display_name, market, avatar_initials,
    profile_type, subscription_plan, organization_name, license_number, verified
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'market', ''),
    UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'display_name', 'U'), 1) || 
           COALESCE(SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'display_name', '') FROM '^\S+\s+(\S)'), '')),
    COALESCE(NEW.raw_user_meta_data->>'profile_type', 'merchant'),
    COALESCE(NEW.raw_user_meta_data->>'subscription_plan', 'free'),
    COALESCE(NEW.raw_user_meta_data->>'organization_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'license_number', ''),
    CASE WHEN COALESCE(NEW.raw_user_meta_data->>'subscription_plan', 'free') IN ('premium','business') THEN true ELSE false END
  );

  -- create initial subscription record
  INSERT INTO public.subscriptions (user_id, plan, amount_fcfa, expires_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'subscription_plan', 'free'),
    CASE COALESCE(NEW.raw_user_meta_data->>'subscription_plan', 'free')
      WHEN 'premium' THEN 2500
      WHEN 'business' THEN 10000
      ELSE 0 END,
    CASE WHEN COALESCE(NEW.raw_user_meta_data->>'subscription_plan', 'free') = 'free' THEN NULL ELSE now() + interval '30 days' END
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- recalc score trigger on transactions
DROP TRIGGER IF EXISTS trg_recalc_score ON public.transactions;
CREATE TRIGGER trg_recalc_score
  AFTER INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.recalculate_score_on_transaction();
