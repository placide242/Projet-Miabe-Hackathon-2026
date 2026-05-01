-- 1. Enum des permissions sensibles
DO $$ BEGIN
  CREATE TYPE public.app_permission AS ENUM (
    'admin.view',
    'admin.export_data',
    'users.manage',
    'roles.manage',
    'content.moderate',
    'transactions.view_all',
    'credits.approve',
    'microfinance.manage'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Table role_permissions
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  permission public.app_permission NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, permission)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 3. RLS
DROP POLICY IF EXISTS "Authenticated can read role_permissions" ON public.role_permissions;
CREATE POLICY "Authenticated can read role_permissions"
  ON public.role_permissions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can insert role_permissions" ON public.role_permissions;
CREATE POLICY "Admins can insert role_permissions"
  ON public.role_permissions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update role_permissions" ON public.role_permissions;
CREATE POLICY "Admins can update role_permissions"
  ON public.role_permissions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete role_permissions" ON public.role_permissions;
CREATE POLICY "Admins can delete role_permissions"
  ON public.role_permissions FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Fonction has_permission (anti-récursion via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission public.app_permission)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = _user_id AND rp.permission = _permission
  )
$$;

-- 5. Mapping par défaut
-- admin : toutes les permissions
INSERT INTO public.role_permissions (role, permission)
SELECT 'admin'::public.app_role, p
FROM unnest(enum_range(NULL::public.app_permission)) AS p
ON CONFLICT DO NOTHING;

-- moderator
INSERT INTO public.role_permissions (role, permission) VALUES
  ('moderator', 'admin.view'),
  ('moderator', 'content.moderate'),
  ('moderator', 'transactions.view_all')
ON CONFLICT DO NOTHING;

-- agent
INSERT INTO public.role_permissions (role, permission) VALUES
  ('agent', 'credits.approve'),
  ('agent', 'transactions.view_all'),
  ('agent', 'microfinance.manage')
ON CONFLICT DO NOTHING;