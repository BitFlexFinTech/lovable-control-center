import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type PaymentProvider = 'stripe' | 'paypal' | 'btc' | 'usdt' | 'eth';

export interface GlobalPaymentProvider {
  id: string;
  user_id: string;
  provider: PaymentProvider;
  display_name: string | null;
  is_sandbox: boolean;
  is_connected: boolean;
  created_at: string;
  updated_at: string;
}

export interface SitePaymentSetting {
  id: string;
  site_id: string;
  provider: PaymentProvider;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const PAYMENT_PROVIDERS: Record<PaymentProvider, { name: string; icon: string; color: string; symbol: string }> = {
  stripe: { name: 'Stripe', icon: '💳', color: '#635BFF', symbol: 'USD' },
  paypal: { name: 'PayPal', icon: '🅿️', color: '#003087', symbol: 'USD' },
  btc: { name: 'Bitcoin', icon: '₿', color: '#F7931A', symbol: 'BTC' },
  usdt: { name: 'USDT', icon: '💵', color: '#26A17B', symbol: 'USDT' },
  eth: { name: 'Ethereum', icon: 'Ξ', color: '#627EEA', symbol: 'ETH' },
};

export function useGlobalPaymentProviders() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['global-payment-providers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('global_payment_providers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as GlobalPaymentProvider[];
    },
    enabled: !!user?.id,
  });
}

export function useConnectGlobalProvider() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      provider, 
      displayName,
      isSandbox = true 
    }: { 
      provider: PaymentProvider; 
      displayName?: string;
      isSandbox?: boolean;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('global_payment_providers')
        .upsert({
          user_id: user.id,
          provider,
          display_name: displayName || PAYMENT_PROVIDERS[provider].name,
          is_sandbox: isSandbox,
          is_connected: true,
        }, { onConflict: 'user_id,provider' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-payment-providers'] });
    },
  });
}

export function useSitePaymentSettings(siteId?: string) {
  return useQuery({
    queryKey: ['site-payment-settings', siteId],
    queryFn: async () => {
      if (!siteId) return [];
      
      const { data, error } = await supabase
        .from('site_payment_settings')
        .select('*')
        .eq('site_id', siteId);
      
      if (error) throw error;
      return data as SitePaymentSetting[];
    },
    enabled: !!siteId,
  });
}

export function useToggleSitePayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      siteId, 
      provider, 
      isEnabled 
    }: { 
      siteId: string; 
      provider: PaymentProvider; 
      isEnabled: boolean;
    }) => {
      const { data, error } = await supabase
        .from('site_payment_settings')
        .upsert({
          site_id: siteId,
          provider,
          is_enabled: isEnabled,
        }, { onConflict: 'site_id,provider' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['site-payment-settings', variables.siteId] });
    },
  });
}
