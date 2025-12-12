-- Create integrations catalog table
CREATE TABLE public.integrations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create site_integrations junction table
CREATE TABLE public.site_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  integration_id TEXT REFERENCES public.integrations(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending',
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(site_id, integration_id)
);

-- Create credentials table for Password Manager
CREATE TABLE public.credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  integration_id TEXT REFERENCES public.integrations(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  additional_fields JSONB DEFAULT '{}',
  status TEXT DEFAULT 'demo' CHECK (status IN ('demo', 'live')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create imported_apps table to track Lovable imports
CREATE TABLE public.imported_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  lovable_url TEXT NOT NULL,
  project_name TEXT NOT NULL,
  user_id UUID NOT NULL,
  imported_at TIMESTAMPTZ DEFAULT now()
);

-- Add lovable_url and app_color columns to sites table
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS lovable_url TEXT;
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS app_color TEXT DEFAULT '#3b82f6';

-- Enable RLS on all new tables
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imported_apps ENABLE ROW LEVEL SECURITY;

-- Integrations: Anyone can view, admins can manage
CREATE POLICY "Anyone can view integrations" ON public.integrations FOR SELECT USING (true);
CREATE POLICY "Admins can manage integrations" ON public.integrations FOR ALL USING (is_admin(auth.uid()));

-- Site integrations: Authenticated users can view, admins can manage
CREATE POLICY "Authenticated can view site_integrations" ON public.site_integrations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage site_integrations" ON public.site_integrations FOR ALL USING (is_admin(auth.uid()));

-- Credentials: Admins only (sensitive data)
CREATE POLICY "Admins can manage credentials" ON public.credentials FOR ALL USING (is_admin(auth.uid()));

-- Imported apps: Users can view their own, admins can view all
CREATE POLICY "Users can view own imported apps" ON public.imported_apps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all imported apps" ON public.imported_apps FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated can insert imported apps" ON public.imported_apps FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed integrations catalog
INSERT INTO public.integrations (id, name, description, icon, category, status) VALUES
  ('namecheap', 'Namecheap', 'Domain registration and DNS management', '🌐', 'Domain', 'pending'),
  ('supabase', 'Supabase', 'Database, Authentication, Realtime & Storage', '⚡', 'Database', 'active'),
  ('lovable-cloud', 'Lovable Cloud', 'App hosting and deployment platform', '💜', 'Hosting', 'active'),
  ('letsencrypt', 'Let''s Encrypt', 'Free SSL/TLS certificate provisioning', '🔒', 'Infrastructure', 'active'),
  ('stripe', 'Stripe', 'Payment processing and subscription management', '💳', 'Payments', 'pending'),
  ('paypal', 'PayPal', 'Online payment processing', '💰', 'Payments', 'pending'),
  ('sendgrid', 'SendGrid', 'Transactional and marketing emails', '✉️', 'Email', 'active'),
  ('gmail-api', 'Gmail API', 'Google email sync via OAuth 2.0', '📧', 'Email', 'pending'),
  ('microsoft-graph', 'Microsoft Graph', 'Outlook email sync via OAuth 2.0', '📬', 'Email', 'pending'),
  ('mailchimp', 'Mailchimp', 'Email marketing automation', '🐵', 'Email', 'pending'),
  ('google-analytics', 'Google Analytics', 'Website traffic and user behavior', '📊', 'Analytics', 'active'),
  ('mixpanel', 'Mixpanel', 'Product analytics and insights', '📈', 'Analytics', 'pending'),
  ('aws-s3', 'AWS S3', 'Cloud file storage', '☁️', 'Storage', 'active'),
  ('cloudinary', 'Cloudinary', 'Image and video management', '🖼️', 'Storage', 'pending'),
  ('github', 'GitHub', 'Version control and deployments', '🐙', 'Development', 'pending'),
  ('vercel', 'Vercel', 'Frontend deployment and hosting', '▲', 'Development', 'pending'),
  ('slack', 'Slack', 'Team notifications and alerts', '💬', 'Communication', 'active'),
  ('discord', 'Discord', 'Community messaging and voice', '🎮', 'Communication', 'pending'),
  ('instagram', 'Instagram', 'Social media management and posting', '📸', 'Social', 'pending'),
  ('facebook', 'Facebook', 'Social media and advertising', '👥', 'Social', 'pending'),
  ('tiktok', 'TikTok', 'Short-form video platform', '🎵', 'Social', 'pending'),
  ('twitter', 'X (Twitter)', 'Social networking and microblogging', '𝕏', 'Social', 'pending'),
  ('youtube', 'YouTube', 'Video hosting and streaming', '▶️', 'Social', 'pending'),
  ('linkedin', 'LinkedIn', 'Professional networking', '💼', 'Social', 'pending');

-- Seed default tenant if not exists
INSERT INTO public.tenants (id, name, slug, environment, base_url)
VALUES ('00000000-0000-0000-0000-000000000001', 'Control Center', 'control-center', 'production', 'https://control-center.lovable.app')
ON CONFLICT DO NOTHING;

-- Seed Control Center site if not exists  
INSERT INTO public.sites (id, tenant_id, name, domain, status, owner_type, lovable_url, app_color)
VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Control Center', 'control-center.lovable.app', 'live', 'admin', 'https://lovable.dev/projects/control-center', '#06b6d4')
ON CONFLICT DO NOTHING;