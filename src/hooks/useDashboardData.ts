import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateAISuggestions } from '@/utils/aiSuggestionAnalyzer';
import { AISuggestion } from '@/types';
import { useTenant } from '@/contexts/TenantContext';

export interface DashboardSite {
  id: string;
  name: string;
  domain: string | null;
  status: string | null;
  owner_type: string | null;
  lovable_url: string | null;
  app_color: string | null;
  health_status: string | null;
  uptime_percentage: number | null;
  response_time_ms: number | null;
  ssl_status: string | null;
  tenant_id: string | null;
  created_at: string;
}

export function useSites() {
  const { currentTenant } = useTenant();
  
  return useQuery({
    queryKey: ['sites', currentTenant?.id],
    queryFn: async () => {
      let query = supabase.from('sites').select('*').order('created_at', { ascending: false });
      
      if (currentTenant?.id) {
        query = query.eq('tenant_id', currentTenant.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DashboardSite[];
    },
  });
}

export function useSuggestions(sites: DashboardSite[] = []) {
  return useQuery({
    queryKey: ['suggestions', sites.map(s => s.id)],
    queryFn: () => {
      // Generate mock suggestions based on site data
      const suggestions: AISuggestion[] = sites.slice(0, 3).map(s => ({
        id: `suggestion-${s.id}`,
        siteId: s.id,
        type: 'performance' as const,
        title: `Optimize ${s.name}`,
        description: `Improve performance for ${s.name}`,
        priority: 'medium' as const,
        expectedImpact: '+15% load speed',
        targetKPI: 'Performance',
        category: 'performance' as const,
      }));
      return suggestions;
    },
    enabled: sites.length > 0,
    staleTime: 1000 * 60 * 10,
  });
}

export function useDashboardRefresh() {
  const queryClient = useQueryClient();
  
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['sites'] });
    await queryClient.invalidateQueries({ queryKey: ['suggestions'] });
  };
  
  return { refresh };
}
