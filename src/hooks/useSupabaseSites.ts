import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export interface Site {
  id: string;
  tenant_id: string | null;
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
  created_at: string;
  updated_at: string;
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
      return data as Site[];
    },
  });
}

export function useSite(id: string) {
  return useQuery({
    queryKey: ['sites', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as Site | null;
    },
    enabled: !!id,
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (site: { name: string; tenant_id?: string; domain?: string; status?: string; owner_type?: string; lovable_url?: string; app_color?: string }) => {
      const { data, error } = await supabase.from('sites').insert(site).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });
}

export function useUpdateSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Site> & { id: string }) => {
      const { data, error } = await supabase
        .from('sites')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });
}

export function useDeleteSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sites').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });
}
