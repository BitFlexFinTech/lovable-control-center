-- =====================================================
-- PHASE 1: CORE STREAMENGINE & QUANTOPS FOUNDATION
-- =====================================================

-- YouTube Persona Types
CREATE TYPE public.youtube_persona_role AS ENUM ('content_strategist', 'seo_specialist', 'analytics_expert', 'monetization_manager', 'community_manager', 'live_producer');
CREATE TYPE public.video_status AS ENUM ('idea', 'scripting', 'filming', 'editing', 'review', 'scheduled', 'published', 'archived');
CREATE TYPE public.crisis_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.deal_status AS ENUM ('prospecting', 'outreach', 'negotiating', 'contracted', 'active', 'completed', 'cancelled');
CREATE TYPE public.collab_status AS ENUM ('discovered', 'analyzing', 'outreach', 'discussing', 'planning', 'scheduled', 'completed', 'declined');
CREATE TYPE public.apply_result AS ENUM ('pending', 'success', 'failed', 'rolled_back');
CREATE TYPE public.deploy_environment AS ENUM ('demo', 'paper', 'canary', 'live');

-- =====================================================
-- YOUTUBE CHANNELS (Core)
-- =====================================================
CREATE TABLE public.youtube_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES public.ai_personas(id),
  channel_id TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  channel_url TEXT,
  subscriber_count INTEGER DEFAULT 0,
  video_count INTEGER DEFAULT 0,
  view_count BIGINT DEFAULT 0,
  thumbnail_url TEXT,
  description TEXT,
  country TEXT,
  custom_url TEXT,
  keywords TEXT[],
  is_verified BOOLEAN DEFAULT false,
  is_monetized BOOLEAN DEFAULT false,
  health_score INTEGER DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.youtube_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage youtube_channels" ON public.youtube_channels FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated can view youtube_channels" ON public.youtube_channels FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- YOUTUBE PERSONAS
-- =====================================================
CREATE TABLE public.youtube_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  base_persona_id UUID REFERENCES public.ai_personas(id),
  channel_id UUID REFERENCES public.youtube_channels(id),
  role youtube_persona_role NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  system_prompt TEXT,
  capabilities JSONB DEFAULT '[]'::jsonb,
  daily_schedule JSONB DEFAULT '{}'::jsonb,
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.youtube_personas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage youtube_personas" ON public.youtube_personas FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated can view youtube_personas" ON public.youtube_personas FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- YOUTUBE VIDEOS
-- =====================================================
CREATE TABLE public.youtube_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.youtube_channels(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  status video_status DEFAULT 'idea',
  published_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  view_count BIGINT DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  dislike_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  tags TEXT[],
  category_id TEXT,
  is_monetized BOOLEAN DEFAULT false,
  is_shorts BOOLEAN DEFAULT false,
  seo_score INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0,
  avg_view_duration INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage youtube_videos" ON public.youtube_videos FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated can view youtube_videos" ON public.youtube_videos FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- YOUTUBE CONTENT CALENDAR
-- =====================================================
CREATE TABLE public.youtube_content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.youtube_channels(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.youtube_videos(id),
  persona_id UUID REFERENCES public.youtube_personas(id),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  status video_status DEFAULT 'idea',
  content_type TEXT DEFAULT 'video',
  priority TEXT DEFAULT 'medium',
  notes TEXT,
  checklist JSONB DEFAULT '[]'::jsonb,
  assigned_personas UUID[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.youtube_content_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage youtube_content_calendar" ON public.youtube_content_calendar FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated can view youtube_content_calendar" ON public.youtube_content_calendar FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- YOUTUBE ANALYTICS
-- =====================================================
CREATE TABLE public.youtube_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.youtube_channels(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.youtube_videos(id),
  date DATE NOT NULL,
  views BIGINT DEFAULT 0,
  watch_time_minutes BIGINT DEFAULT 0,
  subscribers_gained INTEGER DEFAULT 0,
  subscribers_lost INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0,
  avg_view_duration INTEGER DEFAULT 0,
  revenue_cents INTEGER DEFAULT 0,
  rpm_cents INTEGER DEFAULT 0,
  cpm_cents INTEGER DEFAULT 0,
  traffic_sources JSONB DEFAULT '{}'::jsonb,
  demographics JSONB DEFAULT '{}'::jsonb,
  devices JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.youtube_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage youtube_analytics" ON public.youtube_analytics FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated can view youtube_analytics" ON public.youtube_analytics FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- YOUTUBE SEO OPTIMIZATION
-- =====================================================
CREATE TABLE public.youtube_seo_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES public.youtube_videos(id) ON DELETE CASCADE,
  overall_score INTEGER DEFAULT 0,
  title_score INTEGER DEFAULT 0,
  description_score INTEGER DEFAULT 0,
  tags_score INTEGER DEFAULT 0,
  thumbnail_score INTEGER DEFAULT 0,
  recommendations JSONB DEFAULT '[]'::jsonb,
  keyword_analysis JSONB DEFAULT '{}'::jsonb,
  competitor_comparison JSONB DEFAULT '[]'::jsonb,
  trend_alignment JSONB DEFAULT '{}'::jsonb,
  analyzed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.youtube_seo_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage youtube_seo_analysis" ON public.youtube_seo_analysis FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated can view youtube_seo_analysis" ON public.youtube_seo_analysis FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- YOUTUBE CHANNEL HEALTH
-- =====================================================
CREATE TABLE public.youtube_channel_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.youtube_channels(id) ON DELETE CASCADE,
  overall_grade TEXT DEFAULT 'C',
  overall_score INTEGER DEFAULT 50,
  seo_score INTEGER DEFAULT 0,
  audience_score INTEGER DEFAULT 0,
  monetization_score INTEGER DEFAULT 0,
  content_score INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  growth_score INTEGER DEFAULT 0,
  consistency_score INTEGER DEFAULT 0,
  category_breakdown JSONB DEFAULT '{}'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  quick_wins JSONB DEFAULT '[]'::jsonb,
  calculated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.youtube_channel_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage youtube_channel_health" ON public.youtube_channel_health FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated can view youtube_channel_health" ON public.youtube_channel_health FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- YOUTUBE CRISIS MANAGEMENT
-- =====================================================
CREATE TABLE public.youtube_crisis_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.youtube_channels(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.youtube_videos(id),
  severity crisis_severity DEFAULT 'low',
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  detected_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  sentiment_score DECIMAL(3,2) DEFAULT 0,
  dislike_ratio DECIMAL(5,4) DEFAULT 0,
  negative_comment_count INTEGER DEFAULT 0,
  response_recommendations JSONB DEFAULT '[]'::jsonb,
  actions_taken JSONB DEFAULT '[]'::jsonb,
  escalation_level INTEGER DEFAULT 1,
  assigned_persona_id UUID REFERENCES public.youtube_personas(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.youtube_crisis_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage youtube_crisis_events" ON public.youtube_crisis_events FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated can view youtube_crisis_events" ON public.youtube_crisis_events FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- YOUTUBE BRAND DEALS
-- =====================================================
CREATE TABLE public.youtube_brand_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.youtube_channels(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  brand_logo_url TEXT,
  brand_website TEXT,
  contact_name TEXT,
  contact_email TEXT,
  status deal_status DEFAULT 'prospecting',
  deal_type TEXT DEFAULT 'sponsored_video',
  rate_offered_cents INTEGER DEFAULT 0,
  rate_negotiated_cents INTEGER DEFAULT 0,
  deliverables JSONB DEFAULT '[]'::jsonb,
  contract_url TEXT,
  contract_signed_at TIMESTAMPTZ,
  start_date DATE,
  end_date DATE,
  payment_terms TEXT,
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  assigned_persona_id UUID REFERENCES public.youtube_personas(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.youtube_brand_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage youtube_brand_deals" ON public.youtube_brand_deals FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated can view youtube_brand_deals" ON public.youtube_brand_deals FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- YOUTUBE COLLABORATIONS
-- =====================================================
CREATE TABLE public.youtube_collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.youtube_channels(id) ON DELETE CASCADE,
  partner_channel_id TEXT NOT NULL,
  partner_channel_name TEXT NOT NULL,
  partner_subscriber_count INTEGER DEFAULT 0,
  partner_thumbnail_url TEXT,
  status collab_status DEFAULT 'discovered',
  compatibility_score INTEGER DEFAULT 0,
  audience_overlap_percent DECIMAL(5,2) DEFAULT 0,
  content_synergy_score INTEGER DEFAULT 0,
  growth_potential_score INTEGER DEFAULT 0,
  collab_type TEXT,
  proposed_concept TEXT,
  outreach_message TEXT,
  response_received BOOLEAN DEFAULT false,
  scheduled_date DATE,
  video_id UUID REFERENCES public.youtube_videos(id),
  results JSONB DEFAULT '{}'::jsonb,
  assigned_persona_id UUID REFERENCES public.youtube_personas(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.youtube_collaborations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage youtube_collaborations" ON public.youtube_collaborations FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated can view youtube_collaborations" ON public.youtube_collaborations FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- YOUTUBE VIDEO IDEAS
-- =====================================================
CREATE TABLE public.youtube_video_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.youtube_channels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  source TEXT DEFAULT 'ai_generated',
  source_data JSONB DEFAULT '{}'::jsonb,
  score INTEGER DEFAULT 50,
  estimated_views BIGINT DEFAULT 0,
  estimated_ctr DECIMAL(5,2) DEFAULT 0,
  trend_relevance INTEGER DEFAULT 0,
  audience_match INTEGER DEFAULT 0,
  competition_level TEXT DEFAULT 'medium',
  tags TEXT[],
  keywords TEXT[],
  thumbnail_concepts JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'new',
  promoted_to_calendar BOOLEAN DEFAULT false,
  calendar_id UUID REFERENCES public.youtube_content_calendar(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.youtube_video_ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage youtube_video_ideas" ON public.youtube_video_ideas FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated can view youtube_video_ideas" ON public.youtube_video_ideas FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- YOUTUBE LIVE STREAMS
-- =====================================================
CREATE TABLE public.youtube_live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.youtube_channels(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.youtube_videos(id),
  stream_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_start TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled',
  peak_viewers INTEGER DEFAULT 0,
  avg_viewers INTEGER DEFAULT 0,
  total_chat_messages INTEGER DEFAULT 0,
  total_super_chats_cents INTEGER DEFAULT 0,
  total_memberships INTEGER DEFAULT 0,
  highlights JSONB DEFAULT '[]'::jsonb,
  moderation_stats JSONB DEFAULT '{}'::jsonb,
  post_stream_analytics JSONB DEFAULT '{}'::jsonb,
  assigned_persona_id UUID REFERENCES public.youtube_personas(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.youtube_live_streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage youtube_live_streams" ON public.youtube_live_streams FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated can view youtube_live_streams" ON public.youtube_live_streams FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- YOUTUBE MERCHANDISE
-- =====================================================
CREATE TABLE public.youtube_merch_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.youtube_channels(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  store_url TEXT,
  store_id TEXT,
  api_key_encrypted TEXT,
  is_connected BOOLEAN DEFAULT false,
  total_products INTEGER DEFAULT 0,
  total_sales_cents INTEGER DEFAULT 0,
  total_revenue_cents INTEGER DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.youtube_merch_stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage youtube_merch_stores" ON public.youtube_merch_stores FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated can view youtube_merch_stores" ON public.youtube_merch_stores FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- QUANTOPS PERSONAS
-- =====================================================
CREATE TABLE public.quantops_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  codename TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  system_prompt TEXT,
  capabilities JSONB DEFAULT '[]'::jsonb,
  github_config JSONB DEFAULT '{}'::jsonb,
  lovable_config JSONB DEFAULT '{}'::jsonb,
  kpi_thresholds JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.quantops_personas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage quantops_personas" ON public.quantops_personas FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated can view quantops_personas" ON public.quantops_personas FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- QUANTOPS RECOMMENDATION CARDS
-- =====================================================
CREATE TABLE public.quantops_recommendation_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID REFERENCES public.quantops_personas(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  impact_score INTEGER DEFAULT 50,
  risk_level TEXT DEFAULT 'low',
  status TEXT DEFAULT 'pending',
  trigger_metrics JSONB DEFAULT '{}'::jsonb,
  proposed_changes JSONB DEFAULT '[]'::jsonb,
  code_patches JSONB DEFAULT '[]'::jsonb,
  test_requirements JSONB DEFAULT '[]'::jsonb,
  rollback_plan JSONB DEFAULT '{}'::jsonb,
  estimated_improvement JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.quantops_recommendation_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage quantops_recommendation_cards" ON public.quantops_recommendation_cards FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated can view quantops_recommendation_cards" ON public.quantops_recommendation_cards FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- QUANTOPS APPLY EVENTS (Immutable Audit Trail)
-- =====================================================
CREATE TABLE public.quantops_apply_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES public.quantops_recommendation_cards(id),
  persona_id UUID REFERENCES public.quantops_personas(id),
  site_id UUID REFERENCES public.sites(id),
  actor_user_id UUID,
  actor_role TEXT NOT NULL,
  commit_sha TEXT,
  pr_url TEXT,
  pr_number INTEGER,
  build_id TEXT,
  environment deploy_environment NOT NULL,
  result apply_result DEFAULT 'pending',
  rollback_ref TEXT,
  tests_passed BOOLEAN,
  metrics_snapshot JSONB DEFAULT '{}'::jsonb,
  error_summary TEXT,
  breached_thresholds JSONB DEFAULT '[]'::jsonb,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.quantops_apply_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage quantops_apply_events" ON public.quantops_apply_events FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated can view quantops_apply_events" ON public.quantops_apply_events FOR SELECT USING (auth.uid() IS NOT NULL);

-- Make apply_events append-only (no updates or deletes)
CREATE POLICY "No updates on apply_events" ON public.quantops_apply_events FOR UPDATE USING (false);
CREATE POLICY "No deletes on apply_events" ON public.quantops_apply_events FOR DELETE USING (false);

-- =====================================================
-- QUANTOPS KPI THRESHOLDS
-- =====================================================
CREATE TABLE public.quantops_kpi_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID REFERENCES public.quantops_personas(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  warning_threshold DECIMAL(10,4),
  critical_threshold DECIMAL(10,4),
  direction TEXT DEFAULT 'below',
  auto_rollback BOOLEAN DEFAULT true,
  notification_channels TEXT[] DEFAULT ARRAY['dashboard'],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.quantops_kpi_thresholds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage quantops_kpi_thresholds" ON public.quantops_kpi_thresholds FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated can view quantops_kpi_thresholds" ON public.quantops_kpi_thresholds FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- YOUTUBE CHANNEL PORTFOLIOS (Multi-Channel Management)
-- =====================================================
CREATE TABLE public.youtube_channel_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  channels UUID[] DEFAULT ARRAY[]::UUID[],
  primary_channel_id UUID REFERENCES public.youtube_channels(id),
  total_subscribers BIGINT DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  total_videos INTEGER DEFAULT 0,
  aggregate_health_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.youtube_channel_portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own portfolios" ON public.youtube_channel_portfolios FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- YOUTUBE AUDIENCE INSIGHTS
-- =====================================================
CREATE TABLE public.youtube_audience_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.youtube_channels(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  age_groups JSONB DEFAULT '{}'::jsonb,
  gender_distribution JSONB DEFAULT '{}'::jsonb,
  geography JSONB DEFAULT '{}'::jsonb,
  interests JSONB DEFAULT '[]'::jsonb,
  watch_time_patterns JSONB DEFAULT '{}'::jsonb,
  device_types JSONB DEFAULT '{}'::jsonb,
  traffic_sources JSONB DEFAULT '{}'::jsonb,
  subscriber_growth_rate DECIMAL(5,2) DEFAULT 0,
  returning_viewer_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.youtube_audience_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage youtube_audience_insights" ON public.youtube_audience_insights FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated can view youtube_audience_insights" ON public.youtube_audience_insights FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- YOUTUBE MONETIZATION TRACKING
-- =====================================================
CREATE TABLE public.youtube_monetization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.youtube_channels(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  ad_revenue_cents INTEGER DEFAULT 0,
  super_chat_cents INTEGER DEFAULT 0,
  membership_cents INTEGER DEFAULT 0,
  merch_cents INTEGER DEFAULT 0,
  sponsorship_cents INTEGER DEFAULT 0,
  affiliate_cents INTEGER DEFAULT 0,
  total_cents INTEGER DEFAULT 0,
  estimated_rpm_cents INTEGER DEFAULT 0,
  estimated_cpm_cents INTEGER DEFAULT 0,
  monetized_playbacks BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.youtube_monetization ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage youtube_monetization" ON public.youtube_monetization FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Authenticated can view youtube_monetization" ON public.youtube_monetization FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_youtube_channels_site ON public.youtube_channels(site_id);
CREATE INDEX idx_youtube_videos_channel ON public.youtube_videos(channel_id);
CREATE INDEX idx_youtube_analytics_channel_date ON public.youtube_analytics(channel_id, date);
CREATE INDEX idx_youtube_content_calendar_date ON public.youtube_content_calendar(scheduled_date);
CREATE INDEX idx_quantops_cards_status ON public.quantops_recommendation_cards(status);
CREATE INDEX idx_quantops_events_result ON public.quantops_apply_events(result);
CREATE INDEX idx_youtube_crisis_severity ON public.youtube_crisis_events(severity, status);
CREATE INDEX idx_youtube_deals_status ON public.youtube_brand_deals(status);
CREATE INDEX idx_youtube_collabs_status ON public.youtube_collaborations(status);

-- =====================================================
-- UPDATE TRIGGERS
-- =====================================================
CREATE TRIGGER update_youtube_channels_updated_at BEFORE UPDATE ON public.youtube_channels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_youtube_personas_updated_at BEFORE UPDATE ON public.youtube_personas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_youtube_videos_updated_at BEFORE UPDATE ON public.youtube_videos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_youtube_content_calendar_updated_at BEFORE UPDATE ON public.youtube_content_calendar FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_youtube_crisis_events_updated_at BEFORE UPDATE ON public.youtube_crisis_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_youtube_brand_deals_updated_at BEFORE UPDATE ON public.youtube_brand_deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_youtube_collaborations_updated_at BEFORE UPDATE ON public.youtube_collaborations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_youtube_video_ideas_updated_at BEFORE UPDATE ON public.youtube_video_ideas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_youtube_live_streams_updated_at BEFORE UPDATE ON public.youtube_live_streams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_youtube_merch_stores_updated_at BEFORE UPDATE ON public.youtube_merch_stores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quantops_personas_updated_at BEFORE UPDATE ON public.quantops_personas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quantops_cards_updated_at BEFORE UPDATE ON public.quantops_recommendation_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quantops_thresholds_updated_at BEFORE UPDATE ON public.quantops_kpi_thresholds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_channel_portfolios_updated_at BEFORE UPDATE ON public.youtube_channel_portfolios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();