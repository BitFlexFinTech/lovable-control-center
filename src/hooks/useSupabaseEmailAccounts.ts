import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EmailAccount {
  id: string;
  site_id: string;
  tenant_id: string | null;
  name: string;
  email: string;
  type: string;
  password: string | null;
  created_at: string;
  updated_at: string;
}

export function useEmailAccounts(siteId?: string) {
  return useQuery({
    queryKey: ['email-accounts', siteId],
    queryFn: async () => {
      let query = supabase.from('email_accounts').select(`
        *,
        site:sites(id, name, domain)
      `);
      
      if (siteId) {
        query = query.eq('site_id', siteId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateEmailAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (account: { site_id: string; tenant_id?: string | null; name: string; email: string; type: string; password?: string }) => {
      const { data, error } = await supabase
        .from('email_accounts')
        .insert(account as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-accounts'] });
    },
  });
}

export function useBulkCreateEmailAccounts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accounts: Array<{ site_id: string; tenant_id?: string | null; name: string; email: string; type: string; password?: string }>) => {
      const { data, error } = await supabase
        .from('email_accounts')
        .insert(accounts as any)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-accounts'] });
    },
  });
}

export function useDeleteEmailAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('email_accounts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-accounts'] });
    },
  });
}
