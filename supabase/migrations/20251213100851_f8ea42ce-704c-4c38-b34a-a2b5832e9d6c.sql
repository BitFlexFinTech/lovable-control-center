-- Create analysis_runs table
CREATE TABLE public.analysis_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  findings JSONB DEFAULT '[]'::jsonb,
  sites_analyzed INTEGER DEFAULT 0,
  severity_counts JSONB DEFAULT '{"critical": 0, "high": 0, "medium": 0, "low": 0}'::jsonb,
  implemented_actions JSONB DEFAULT '[]'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analysis_runs ENABLE ROW LEVEL SECURITY;

-- Admins can manage analysis runs
CREATE POLICY "Admins can manage analysis runs"
ON public.analysis_runs
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Add index for performance
CREATE INDEX idx_analysis_runs_status ON public.analysis_runs(status);
CREATE INDEX idx_analysis_runs_created_at ON public.analysis_runs(created_at DESC);