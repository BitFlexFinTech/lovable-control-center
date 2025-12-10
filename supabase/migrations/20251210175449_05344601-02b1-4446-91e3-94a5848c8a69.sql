-- Fix security definer view by dropping and recreating without security definer
DROP VIEW IF EXISTS public.users_with_roles;

CREATE VIEW public.users_with_roles 
WITH (security_invoker = true)
AS
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

-- Fix end_impersonation_session function with proper search_path
CREATE OR REPLACE FUNCTION public.end_impersonation_session()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_active = false AND OLD.is_active = true THEN
    NEW.ended_at = now();
  END IF;
  RETURN NEW;
END;
$$;