-- =============================================
-- PHASE 1: FIX ALL RLS POLICIES (PERMISSIVE)
-- =============================================

-- Fix sites table policies
DROP POLICY IF EXISTS "Admins can manage sites" ON sites;
DROP POLICY IF EXISTS "Authenticated users can view sites" ON sites;

CREATE POLICY "Admins can manage sites" ON sites
  FOR ALL USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view sites" ON sites
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix imported_apps table policies
DROP POLICY IF EXISTS "Admins can view all imported apps" ON imported_apps;
DROP POLICY IF EXISTS "Users can view own imported apps" ON imported_apps;
DROP POLICY IF EXISTS "Authenticated can insert imported apps" ON imported_apps;

CREATE POLICY "Admins can view all imported apps" ON imported_apps
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Users can view own imported apps" ON imported_apps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated can insert imported apps" ON imported_apps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage imported apps" ON imported_apps
  FOR ALL USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Fix site_integrations table policies
DROP POLICY IF EXISTS "Admins can manage site_integrations" ON site_integrations;
DROP POLICY IF EXISTS "Authenticated can view site_integrations" ON site_integrations;

CREATE POLICY "Admins can manage site_integrations" ON site_integrations
  FOR ALL USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Authenticated can view site_integrations" ON site_integrations
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix credentials table policies
DROP POLICY IF EXISTS "Admins can manage credentials" ON credentials;

CREATE POLICY "Admins can manage credentials" ON credentials
  FOR ALL USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Fix tenants table policies
DROP POLICY IF EXISTS "Admins can manage tenants" ON tenants;
DROP POLICY IF EXISTS "Authenticated users can view tenants" ON tenants;

CREATE POLICY "Admins can manage tenants" ON tenants
  FOR ALL USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view tenants" ON tenants
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix integrations table policies
DROP POLICY IF EXISTS "Admins can manage integrations" ON integrations;
DROP POLICY IF EXISTS "Anyone can view integrations" ON integrations;

CREATE POLICY "Admins can manage integrations" ON integrations
  FOR ALL USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Anyone can view integrations" ON integrations
  FOR SELECT USING (true);

-- Fix role_permissions table policies
DROP POLICY IF EXISTS "Authenticated users can view permissions" ON role_permissions;
DROP POLICY IF EXISTS "Super admins can manage permissions" ON role_permissions;

CREATE POLICY "Authenticated users can view permissions" ON role_permissions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Super admins can manage permissions" ON role_permissions
  FOR ALL USING (has_role(auth.uid(), 'super_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- =============================================
-- PHASE 2: CREATE NEW TABLES FOR PERSISTENCE
-- =============================================

-- API Keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  key TEXT NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own api keys" ON api_keys
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all api keys" ON api_keys
  FOR SELECT USING (is_admin(auth.uid()));

-- Webhooks table
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  failure_count INT DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own webhooks" ON webhooks
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all webhooks" ON webhooks
  FOR SELECT USING (is_admin(auth.uid()));

-- Emails table for Mail App
CREATE TABLE IF NOT EXISTS public.emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  account_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  recipients JSONB NOT NULL DEFAULT '[]',
  subject TEXT NOT NULL,
  body_preview TEXT,
  body TEXT,
  folder TEXT DEFAULT 'inbox',
  status TEXT DEFAULT 'unread',
  flags TEXT[] DEFAULT '{}',
  starred BOOLEAN DEFAULT false,
  is_draft BOOLEAN DEFAULT false,
  thread_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own emails" ON emails
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Error logs table
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL DEFAULT 'error',
  message TEXT NOT NULL,
  component TEXT,
  stack_trace TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view error logs" ON error_logs
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "System can insert error logs" ON error_logs
  FOR INSERT WITH CHECK (true);

-- Enable realtime for emails
ALTER PUBLICATION supabase_realtime ADD TABLE public.emails;