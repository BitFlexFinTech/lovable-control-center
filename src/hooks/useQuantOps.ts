import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { 
  QuantOpsPersona, 
  RecommendationCard, 
  ApplyEvent, 
  TimelineEvent,
  MetricsSnapshot 
} from '@/types/quantops';

// Fetch QuantOps personas
export function useQuantOpsPersonas(siteId?: string) {
  return useQuery({
    queryKey: ['quantops-personas', siteId],
    queryFn: async () => {
      let query = supabase
        .from('quantops_personas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (siteId) {
        query = query.eq('site_id', siteId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(p => ({
        id: p.id,
        siteId: p.site_id,
        name: p.name,
        codename: p.codename,
        role: p.role,
        description: p.description || '',
        avatarUrl: p.avatar_url || '',
        systemPrompt: p.system_prompt || '',
        capabilities: (p.capabilities as string[]) || [],
        githubConfig: (p.github_config as Record<string, unknown>) || {},
        lovableConfig: (p.lovable_config as Record<string, unknown>) || {},
        kpiThresholds: (p.kpi_thresholds as Record<string, unknown>) || {},
        status: p.status || 'active',
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })) as unknown as QuantOpsPersona[];
    },
  });
}

// Fetch recommendation cards
export function useRecommendationCards(personaId?: string, status?: string) {
  return useQuery({
    queryKey: ['quantops-cards', personaId, status],
    queryFn: async () => {
      let query = supabase
        .from('quantops_recommendation_cards')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (personaId) {
        query = query.eq('persona_id', personaId);
      }
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(c => ({
        id: c.id,
        personaId: c.persona_id,
        siteId: c.site_id,
        cardType: c.card_type,
        title: c.title,
        description: c.description || '',
        priority: c.priority || 'medium',
        impactScore: c.impact_score || 50,
        riskLevel: c.risk_level || 'low',
        status: c.status || 'pending',
        triggerMetrics: (c.trigger_metrics as Record<string, unknown>) || {},
        proposedChanges: (c.proposed_changes as unknown[]) || [],
        codePatches: (c.code_patches as unknown[]) || [],
        testRequirements: (c.test_requirements as unknown[]) || [],
        rollbackPlan: (c.rollback_plan as Record<string, unknown>) || {},
        estimatedImprovement: (c.estimated_improvement as Record<string, unknown>) || {},
        expiresAt: c.expires_at,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      })) as unknown as RecommendationCard[];
    },
  });
}

// Fetch apply events (timeline)
export function useApplyEvents(personaId?: string, limit: number = 50) {
  return useQuery({
    queryKey: ['quantops-events', personaId, limit],
    queryFn: async () => {
      let query = supabase
        .from('quantops_apply_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (personaId) {
        query = query.eq('persona_id', personaId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(e => ({
        id: e.id,
        cardId: e.card_id,
        personaId: e.persona_id,
        siteId: e.site_id,
        actorUserId: e.actor_user_id,
        actorRole: e.actor_role,
        commitSha: e.commit_sha,
        prUrl: e.pr_url,
        prNumber: e.pr_number,
        buildId: e.build_id,
        environment: e.environment,
        result: e.result,
        rollbackRef: e.rollback_ref,
        testsPassed: e.tests_passed,
        metricsSnapshot: (e.metrics_snapshot as Record<string, unknown>) || {},
        errorSummary: e.error_summary,
        breachedThresholds: (e.breached_thresholds as unknown[]) || [],
        durationMs: e.duration_ms,
        createdAt: e.created_at,
      })) as unknown as ApplyEvent[];
    },
  });
}

// Convert apply events to timeline format
export function useTimelineEvents(personaId?: string) {
  const { data: events, ...rest } = useApplyEvents(personaId);
  const { data: cards } = useRecommendationCards(personaId);
  
  const timelineEvents: TimelineEvent[] = (events || []).map(e => {
    const card = cards?.find(c => c.id === e.cardId);
    return {
      id: e.id,
      type: e.result === 'success' ? 'applied' : e.result === 'rolled_back' ? 'rolled_back' : 'failed',
      cardId: e.cardId,
      cardTitle: card?.title || 'Unknown',
      commitSha: e.commitSha,
      prUrl: e.prUrl,
      buildId: e.buildId,
      environment: e.environment,
      metrics: e.metricsSnapshot as MetricsSnapshot,
      errorSummary: e.errorSummary,
      timestamp: e.createdAt,
    };
  });
  
  return { data: timelineEvents, ...rest };
}

// Apply a recommendation card
export function useApplyCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ cardId, environment }: { cardId: string; environment: string }) => {
      const { data, error } = await supabase.functions.invoke('quantops-apply-changes', {
        body: { cardId, environment },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quantops-cards'] });
      queryClient.invalidateQueries({ queryKey: ['quantops-events'] });
    },
  });
}

// Rollback an apply event
export function useRollbackEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventId: string) => {
      const { data, error } = await supabase.functions.invoke('quantops-trigger-rollback', {
        body: { eventId },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quantops-cards'] });
      queryClient.invalidateQueries({ queryKey: ['quantops-events'] });
    },
  });
}

// Dismiss a card
export function useDismissCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cardId: string) => {
      const { error } = await supabase
        .from('quantops_recommendation_cards')
        .update({ status: 'dismissed' })
        .eq('id', cardId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quantops-cards'] });
    },
  });
}

// Rollback an apply event
export function useRollbackEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventId: string) => {
      const { data, error } = await supabase.functions.invoke('quantops-trigger-rollback', {
        body: { eventId },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quantops-cards'] });
      queryClient.invalidateQueries({ queryKey: ['quantops-events'] });
    },
  });
}

// Dismiss a card
export function useDismissCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cardId: string) => {
      const { error } = await supabase
        .from('quantops_recommendation_cards')
        .update({ status: 'dismissed' })
        .eq('id', cardId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quantops-cards'] });
    },
  });
}
