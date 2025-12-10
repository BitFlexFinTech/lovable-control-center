-- Create users_with_roles view for easier querying
CREATE OR REPLACE VIEW public.users_with_roles AS
SELECT 
  p.id,
  p.user_id,
  p.full_name,
  p.email,
  p.avatar_url,
  p.created_at,
  p.updated_at,
  COALESCE(
    json_agg(
      json_build_object('role', ur.role, 'tenant_id', ur.tenant_id, 'id', ur.id)
    ) FILTER (WHERE ur.id IS NOT NULL),
    '[]'::json
  ) as roles
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
GROUP BY p.id, p.user_id, p.full_name, p.email, p.avatar_url, p.created_at, p.updated_at;

-- Create role_permissions table for permission matrix
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  feature TEXT NOT NULL,
  can_read BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role, feature)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage permissions"
ON public.role_permissions FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Authenticated users can view permissions"
ON public.role_permissions FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create admin_impersonation_sessions table
CREATE TABLE public.admin_impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  impersonated_role app_role NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  reason TEXT,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.admin_impersonation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage impersonation sessions"
ON public.admin_impersonation_sessions FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Create check_permission function for server-side validation
CREATE OR REPLACE FUNCTION public.check_permission(
  _user_id UUID,
  _feature TEXT,
  _action TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
  has_perm BOOLEAN := false;
BEGIN
  SELECT role INTO user_role FROM public.user_roles WHERE user_id = _user_id LIMIT 1;
  
  IF user_role IS NULL THEN
    RETURN false;
  END IF;
  
  IF user_role = 'super_admin' THEN
    RETURN true;
  END IF;
  
  SELECT 
    CASE _action
      WHEN 'read' THEN can_read
      WHEN 'create' THEN can_create
      WHEN 'update' THEN can_update
      WHEN 'delete' THEN can_delete
      ELSE false
    END INTO has_perm
  FROM public.role_permissions
  WHERE role = user_role AND feature = _feature;
  
  RETURN COALESCE(has_perm, false);
END;
$$;

-- Enable realtime on audit_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;

-- Seed default permissions
INSERT INTO public.role_permissions (role, feature, can_read, can_create, can_update, can_delete) VALUES
  ('super_admin', 'sites', true, true, true, true),
  ('super_admin', 'tenants', true, true, true, true),
  ('super_admin', 'users', true, true, true, true),
  ('super_admin', 'roles', true, true, true, true),
  ('super_admin', 'billing', true, true, true, true),
  ('super_admin', 'audit_logs', true, false, false, false),
  ('super_admin', 'integrations', true, true, true, true),
  ('super_admin', 'passwords', true, true, true, true),
  ('super_admin', 'mail', true, true, true, true),
  ('admin', 'sites', true, true, true, false),
  ('admin', 'tenants', true, false, true, false),
  ('admin', 'users', true, true, true, false),
  ('admin', 'roles', true, false, false, false),
  ('admin', 'billing', true, false, false, false),
  ('admin', 'audit_logs', true, false, false, false),
  ('admin', 'integrations', true, true, true, false),
  ('admin', 'passwords', true, true, true, true),
  ('admin', 'mail', true, true, true, true),
  ('editor', 'sites', true, false, true, false),
  ('editor', 'tenants', true, false, false, false),
  ('editor', 'users', false, false, false, false),
  ('editor', 'roles', false, false, false, false),
  ('editor', 'billing', false, false, false, false),
  ('editor', 'audit_logs', false, false, false, false),
  ('editor', 'integrations', true, false, false, false),
  ('editor', 'passwords', true, false, false, false),
  ('editor', 'mail', true, true, true, false);

-- Create trigger for updated_at on role_permissions
CREATE TRIGGER update_role_permissions_updated_at
BEFORE UPDATE ON public.role_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on admin_impersonation_sessions (using ended_at as update indicator)
CREATE OR REPLACE FUNCTION public.end_impersonation_session()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = false AND OLD.is_active = true THEN
    NEW.ended_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER end_impersonation_session_trigger
BEFORE UPDATE ON public.admin_impersonation_sessions
FOR EACH ROW
EXECUTE FUNCTION public.end_impersonation_session();