import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Integration {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string;
  status: string | null;
  created_at: string;
}

export interface SiteIntegration {
  id: string;
  site_id: string;
  integration_id: string;
  status: string | null;
  config: Record<string, unknown>;
  created_at: string;
}

export function useIntegrations() {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .order('category');
      if (error) throw error;
      return data as Integration[];
    },
  });
}

export function useSiteIntegrations(siteId?: string) {
  return useQuery({
    queryKey: ['site-integrations', siteId],
    queryFn: async () => {
      let query = supabase.from('site_integrations').select(`
        *,
        integration:integrations(*)
      `);
      
      if (siteId) {
        query = query.eq('site_id', siteId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: siteId ? !!siteId : true,
  });
}

export function useAddSiteIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ siteId, integrationId }: { siteId: string; integrationId: string }) => {
      const { data, error } = await supabase
        .from('site_integrations')
        .insert({ site_id: siteId, integration_id: integrationId, status: 'pending' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-integrations'] });
    },
  });
}

export function useUpdateIntegrationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('integrations')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}
