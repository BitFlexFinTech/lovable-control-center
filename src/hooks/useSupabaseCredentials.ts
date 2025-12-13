import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Credential {
  id: string;
  site_id: string;
  integration_id: string;
  email: string;
  password: string;
  additional_fields: Record<string, unknown>;
  status: 'demo' | 'live';
  created_at: string;
  updated_at: string;
}

export function useCredentials(siteId?: string) {
  return useQuery({
    queryKey: ['credentials', siteId],
    queryFn: async () => {
      let query = supabase.from('credentials').select(`
        *,
        site:sites(id, name, domain, app_color),
        integration:integrations(id, name, icon, category)
      `);
      
      if (siteId) {
        query = query.eq('site_id', siteId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credential: { site_id: string; integration_id: string; email: string; password: string; status?: string; additional_fields?: Record<string, unknown> }) => {
      const { data, error } = await supabase
        .from('credentials')
        .insert(credential as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
    },
  });
}

export function useBulkCreateCredentials() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: Array<{ site_id: string; integration_id: string; email: string; password: string; status?: string; additional_fields?: Record<string, unknown> }>) => {
      const { data, error } = await supabase
        .from('credentials')
        .insert(credentials as any)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
    },
  });
}

export function useUpdateCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; email?: string; password?: string; status?: string }) => {
      const { data, error } = await supabase
        .from('credentials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
    },
  });
}

export function useDeleteCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('credentials').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
    },
  });
}

export function usePromoteCredentialsToLive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (siteId: string) => {
      const { data, error } = await supabase
        .from('credentials')
        .update({ status: 'live' })
        .eq('site_id', siteId)
        .eq('status', 'demo')
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
    },
  });
}
