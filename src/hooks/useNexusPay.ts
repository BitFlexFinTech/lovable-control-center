import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type PaymentGateway = 'stripe' | 'paypal' | 'btc' | 'usdt' | 'eth';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'refunded' | 'cancelled';

export interface NexusPayTransaction {
  id: string;
  site_id: string;
  gateway_source: PaymentGateway;
  amount_usd: number;
  native_amount: number;
  crypto_network: string | null;
  fees_usd: number;
  gateway_ref_id: string;
  status: TransactionStatus;
  customer_email: string | null;
  customer_name: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PaymentProvider {
  id: string;
  site_id: string;
  provider: PaymentGateway;
  is_connected: boolean;
  is_sandbox: boolean;
  last_synced_at: string | null;
  created_at: string;
}

export interface GodModeSession {
  id: string;
  admin_user_id: string;
  started_at: string;
  expires_at: string;
  ended_at: string | null;
  is_active: boolean;
  reason: string;
  ip_address: string | null;
  user_agent: string | null;
  actions_log: unknown[];
}

// Transactions
export function useNexusPayTransactions(siteId?: string) {
  return useQuery({
    queryKey: ['nexuspay-transactions', siteId],
    queryFn: async () => {
      let query = supabase.from('nexuspay_transactions').select(`
        *,
        site:sites(id, name, domain)
      `);
      
      if (siteId && siteId !== 'all') {
        query = query.eq('site_id', siteId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as NexusPayTransaction[];
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: Omit<NexusPayTransaction, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('nexuspay_transactions')
        .insert(transaction as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nexuspay-transactions'] });
    },
  });
}

// Payment Providers
export function usePaymentProviders(siteId?: string) {
  return useQuery({
    queryKey: ['payment-providers', siteId],
    queryFn: async () => {
      let query = supabase.from('payment_providers').select('*');
      
      if (siteId) {
        query = query.eq('site_id', siteId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PaymentProvider[];
    },
  });
}

export function useConnectPaymentProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ siteId, provider, isSandbox = true }: { siteId: string; provider: PaymentGateway; isSandbox?: boolean }) => {
      const { data, error } = await supabase
        .from('payment_providers')
        .upsert({
          site_id: siteId,
          provider,
          is_connected: true,
          is_sandbox: isSandbox,
          last_synced_at: new Date().toISOString()
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-providers'] });
    },
  });
}

export function useDisconnectPaymentProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('payment_providers')
        .update({ is_connected: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-providers'] });
    },
  });
}

// GodMode Sessions
export function useGodModeSessions() {
  return useQuery({
    queryKey: ['godmode-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('godmode_sessions')
        .select('*')
        .order('started_at', { ascending: false });
      if (error) throw error;
      return data as GodModeSession[];
    },
  });
}

export function useActiveGodModeSession() {
  return useQuery({
    queryKey: ['godmode-session-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('godmode_sessions')
        .select('*')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as GodModeSession | null;
    },
  });
}

export function useStartGodMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ adminUserId, reason, durationMinutes = 30 }: { adminUserId: string; reason: string; durationMinutes?: number }) => {
      const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('godmode_sessions')
        .insert({
          admin_user_id: adminUserId,
          reason,
          expires_at: expiresAt,
          is_active: true
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['godmode-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['godmode-session-active'] });
    },
  });
}

export function useDeactivateGodMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('godmode_sessions')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('id', sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['godmode-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['godmode-session-active'] });
    },
  });
}

// Feature Toggles
export function useFeatureToggles() {
  return useQuery({
    queryKey: ['feature-toggles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_toggles')
        .select('*');
      if (error) throw error;
      return data;
    },
  });
}

export function useToggleFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ featureKey, isEnabled }: { featureKey: string; isEnabled: boolean }) => {
      const { error } = await supabase
        .from('feature_toggles')
        .update({ is_enabled: isEnabled })
        .eq('feature_key', featureKey);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-toggles'] });
    },
  });
}

// Security Scans
export function useSecurityScans() {
  return useQuery({
    queryKey: ['security-scans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_scans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });
}

// KPI Calculations
export function useNexusPayKPIs(siteId?: string) {
  const { data: transactions } = useNexusPayTransactions(siteId);

  const kpis = {
    totalRevenue: 0,
    totalFees: 0,
    netRevenue: 0,
    transactionCount: 0,
    successRate: 0,
    averageTransactionValue: 0,
    pendingValue: 0,
    byGateway: {} as Record<PaymentGateway, { count: number; total: number }>,
  };

  if (transactions) {
    const confirmed = transactions.filter(t => t.status === 'confirmed');
    const pending = transactions.filter(t => t.status === 'pending');

    kpis.totalRevenue = confirmed.reduce((sum, t) => sum + Number(t.amount_usd), 0);
    kpis.totalFees = confirmed.reduce((sum, t) => sum + Number(t.fees_usd), 0);
    kpis.netRevenue = kpis.totalRevenue - kpis.totalFees;
    kpis.transactionCount = transactions.length;
    kpis.successRate = transactions.length > 0 ? (confirmed.length / transactions.length) * 100 : 0;
    kpis.averageTransactionValue = confirmed.length > 0 ? kpis.totalRevenue / confirmed.length : 0;
    kpis.pendingValue = pending.reduce((sum, t) => sum + Number(t.amount_usd), 0);

    // By gateway
    transactions.forEach(t => {
      if (!kpis.byGateway[t.gateway_source]) {
        kpis.byGateway[t.gateway_source] = { count: 0, total: 0 };
      }
      kpis.byGateway[t.gateway_source].count++;
      if (t.status === 'confirmed') {
        kpis.byGateway[t.gateway_source].total += Number(t.amount_usd);
      }
    });
  }

  return kpis;
}
