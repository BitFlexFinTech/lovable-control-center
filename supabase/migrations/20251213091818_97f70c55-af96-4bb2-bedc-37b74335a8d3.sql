-- 1. User social accounts (for logged-in user's personal accounts)
CREATE TABLE public.user_social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  username TEXT,
  display_name TEXT,
  profile_image_url TEXT,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  profile_data JSONB DEFAULT '{}',
  is_connected BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ DEFAULT now(),
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Global payment providers (user-level, shared across sites)
CREATE TABLE public.global_payment_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  display_name TEXT,
  credentials_encrypted TEXT,
  is_sandbox BOOLEAN DEFAULT true,
  is_connected BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- 3. Site payment settings (enable/disable per site)
CREATE TABLE public.site_payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(site_id, provider)
);

-- 4. Connected mail accounts (for IMAP/Mac Mail)
CREATE TABLE public.connected_mail_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  imap_host TEXT,
  imap_port INTEGER DEFAULT 993,
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 587,
  credentials_encrypted TEXT,
  provider TEXT DEFAULT 'imap',
  is_connected BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  mailboxes JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Currency balances for billing
CREATE TABLE public.currency_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  currency TEXT NOT NULL,
  symbol TEXT NOT NULL,
  balance DECIMAL(18, 8) DEFAULT 0,
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, currency)
);

-- Enable RLS on all new tables
ALTER TABLE public.user_social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_payment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_mail_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currency_balances ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_social_accounts
CREATE POLICY "Users can view own social accounts" ON public.user_social_accounts
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social accounts" ON public.user_social_accounts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social accounts" ON public.user_social_accounts
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social accounts" ON public.user_social_accounts
FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for global_payment_providers
CREATE POLICY "Users can view own payment providers" ON public.global_payment_providers
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment providers" ON public.global_payment_providers
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment providers" ON public.global_payment_providers
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment providers" ON public.global_payment_providers
FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for site_payment_settings
CREATE POLICY "Admins can manage site payment settings" ON public.site_payment_settings
FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Authenticated can view site payment settings" ON public.site_payment_settings
FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS policies for connected_mail_accounts
CREATE POLICY "Users can view own mail accounts" ON public.connected_mail_accounts
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mail accounts" ON public.connected_mail_accounts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mail accounts" ON public.connected_mail_accounts
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mail accounts" ON public.connected_mail_accounts
FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for currency_balances
CREATE POLICY "Users can view own balances" ON public.currency_balances
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own balances" ON public.currency_balances
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own balances" ON public.currency_balances
FOR UPDATE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_global_payment_providers_updated_at
BEFORE UPDATE ON public.global_payment_providers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_payment_settings_updated_at
BEFORE UPDATE ON public.site_payment_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_connected_mail_accounts_updated_at
BEFORE UPDATE ON public.connected_mail_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();