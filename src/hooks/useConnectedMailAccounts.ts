import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ConnectedMailAccount {
  id: string;
  user_id: string;
  email: string;
  display_name: string | null;
  imap_host: string | null;
  imap_port: number;
  smtp_host: string | null;
  smtp_port: number;
  provider: string;
  is_connected: boolean;
  last_synced_at: string | null;
  mailboxes: string[];
  created_at: string;
  updated_at: string;
}

export interface IMAPConfig {
  email: string;
  password: string;
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
  displayName?: string;
}

// Common IMAP configurations for popular providers
export const IMAP_PRESETS: Record<string, { imapHost: string; imapPort: number; smtpHost: string; smtpPort: number }> = {
  icloud: {
    imapHost: 'imap.mail.me.com',
    imapPort: 993,
    smtpHost: 'smtp.mail.me.com',
    smtpPort: 587,
  },
  gmail: {
    imapHost: 'imap.gmail.com',
    imapPort: 993,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
  },
  outlook: {
    imapHost: 'outlook.office365.com',
    imapPort: 993,
    smtpHost: 'smtp.office365.com',
    smtpPort: 587,
  },
  yahoo: {
    imapHost: 'imap.mail.yahoo.com',
    imapPort: 993,
    smtpHost: 'smtp.mail.yahoo.com',
    smtpPort: 587,
  },
};

export function useConnectedMailAccounts() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['connected-mail-accounts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('connected_mail_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ConnectedMailAccount[];
    },
    enabled: !!user?.id,
  });
}

export function useConnectMailAccount() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (config: IMAPConfig) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // In a real implementation, we would:
      // 1. Validate IMAP credentials by attempting connection
      // 2. Encrypt the password before storing
      // 3. Fetch mailbox list from IMAP server
      
      // For now, simulate success and store config
      const { data, error } = await supabase
        .from('connected_mail_accounts')
        .insert({
          user_id: user.id,
          email: config.email,
          display_name: config.displayName || config.email.split('@')[0],
          imap_host: config.imapHost,
          imap_port: config.imapPort,
          smtp_host: config.smtpHost,
          smtp_port: config.smtpPort,
          provider: 'imap',
          is_connected: true,
          mailboxes: ['INBOX', 'Sent', 'Drafts', 'Trash', 'Spam'],
          last_synced_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connected-mail-accounts'] });
    },
  });
}

export function useDisconnectMailAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = await supabase
        .from('connected_mail_accounts')
        .update({ is_connected: false })
        .eq('id', accountId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connected-mail-accounts'] });
    },
  });
}

export function useSyncMailAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (accountId: string) => {
      // In a real implementation, we would trigger an edge function to sync emails
      // For now, just update the last_synced_at timestamp
      const { error } = await supabase
        .from('connected_mail_accounts')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', accountId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connected-mail-accounts'] });
    },
  });
}
