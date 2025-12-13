-- Phase 1: Email Accounts table for site email persistence
CREATE TABLE public.email_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'custom',
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.email_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email accounts" ON public.email_accounts FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Authenticated can view email accounts" ON public.email_accounts FOR SELECT USING (auth.uid() IS NOT NULL);

-- Phase 2: NexusPay Payment Gateway enum and transaction status
CREATE TYPE public.payment_gateway AS ENUM ('stripe', 'paypal', 'btc', 'usdt', 'eth');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'confirmed', 'failed', 'refunded', 'cancelled');

-- NexusPay Transactions table (Unified Data Schema)
CREATE TABLE public.nexuspay_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  gateway_source public.payment_gateway NOT NULL,
  amount_usd DECIMAL(12,2) NOT NULL,
  native_amount DECIMAL(18,8) NOT NULL,
  crypto_network TEXT,
  fees_usd DECIMAL(8,2) DEFAULT 0,
  gateway_ref_id TEXT NOT NULL,
  status public.transaction_status DEFAULT 'pending',
  customer_email TEXT,
  customer_name TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.nexuspay_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage transactions" ON public.nexuspay_transactions FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Authenticated can view transactions" ON public.nexuspay_transactions FOR SELECT USING (auth.uid() IS NOT NULL);

-- GodMode Sessions table (time-bounded, auditable)
CREATE TABLE public.godmode_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  reason TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  actions_log JSONB DEFAULT '[]',
  CONSTRAINT valid_session CHECK (expires_at > started_at)
);

ALTER TABLE public.godmode_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage godmode sessions" ON public.godmode_sessions FOR ALL USING (has_role(auth.uid(), 'super_admin')) WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Payment Provider Connections table
CREATE TABLE public.payment_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  provider public.payment_gateway NOT NULL,
  is_connected BOOLEAN DEFAULT false,
  is_sandbox BOOLEAN DEFAULT true,
  credentials_encrypted TEXT,
  webhook_secret TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(site_id, provider)
);

ALTER TABLE public.payment_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payment providers" ON public.payment_providers FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Authenticated can view payment providers" ON public.payment_providers FOR SELECT USING (auth.uid() IS NOT NULL);

-- Security Scan Results table
CREATE TABLE public.security_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  findings JSONB DEFAULT '[]',
  severity_counts JSONB DEFAULT '{"critical": 0, "high": 0, "medium": 0, "low": 0}',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.security_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage security scans" ON public.security_scans FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Feature Toggles table (for competitor parity features)
CREATE TABLE public.feature_toggles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key TEXT NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.feature_toggles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage feature toggles" ON public.feature_toggles FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Authenticated can view feature toggles" ON public.feature_toggles FOR SELECT USING (auth.uid() IS NOT NULL);

-- Insert default feature toggles
INSERT INTO public.feature_toggles (feature_key, is_enabled, description) VALUES
  ('behavioral_cohort_analysis', false, 'Enable behavioral cohort analysis for transaction patterns'),
  ('crypto_volatility_alerts', false, 'Enable real-time crypto volatility alerts'),
  ('advanced_fraud_detection', false, 'Enable AI-powered fraud detection'),
  ('multi_currency_reporting', false, 'Enable multi-currency revenue reporting');

-- Triggers for updated_at
CREATE TRIGGER update_email_accounts_updated_at BEFORE UPDATE ON public.email_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_nexuspay_transactions_updated_at BEFORE UPDATE ON public.nexuspay_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_providers_updated_at BEFORE UPDATE ON public.payment_providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feature_toggles_updated_at BEFORE UPDATE ON public.feature_toggles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();