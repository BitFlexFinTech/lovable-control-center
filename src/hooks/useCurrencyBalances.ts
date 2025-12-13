import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CurrencyBalance {
  id: string;
  user_id: string;
  currency: string;
  symbol: string;
  balance: number;
  last_updated_at: string;
  created_at: string;
}

export const SUPPORTED_CURRENCIES: Record<string, { name: string; symbol: string; icon: string; color: string }> = {
  USD: { name: 'US Dollar', symbol: '$', icon: '💵', color: '#22C55E' },
  BTC: { name: 'Bitcoin', symbol: '₿', icon: '₿', color: '#F7931A' },
  ETH: { name: 'Ethereum', symbol: 'Ξ', icon: 'Ξ', color: '#627EEA' },
  USDT: { name: 'Tether', symbol: '₮', icon: '₮', color: '#26A17B' },
};

// Mock exchange rates (in real app, fetch from API)
const EXCHANGE_RATES: Record<string, number> = {
  BTC: 67432.50,
  ETH: 3892.18,
  USDT: 1.00,
  USD: 1.00,
};

export function useCurrencyBalances() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['currency-balances', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('currency_balances')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // If no balances exist, return defaults
      if (!data || data.length === 0) {
        return Object.entries(SUPPORTED_CURRENCIES).map(([currency, info]) => ({
          id: `default-${currency}`,
          user_id: user.id,
          currency,
          symbol: info.symbol,
          balance: 0,
          last_updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })) as CurrencyBalance[];
      }
      
      return data as CurrencyBalance[];
    },
    enabled: !!user?.id,
  });
}

export function useUpdateBalance() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      currency, 
      balance 
    }: { 
      currency: string; 
      balance: number;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const info = SUPPORTED_CURRENCIES[currency];
      if (!info) throw new Error('Unsupported currency');
      
      const { data, error } = await supabase
        .from('currency_balances')
        .upsert({
          user_id: user.id,
          currency,
          symbol: info.symbol,
          balance,
          last_updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,currency' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currency-balances'] });
    },
  });
}

export function calculateTotalUSD(balances: CurrencyBalance[]): number {
  return balances.reduce((total, balance) => {
    const rate = EXCHANGE_RATES[balance.currency] || 0;
    return total + (balance.balance * rate);
  }, 0);
}

export function formatCurrencyAmount(amount: number, currency: string): string {
  const info = SUPPORTED_CURRENCIES[currency];
  if (!info) return `${amount}`;
  
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
  
  // For crypto, show more decimals
  if (['BTC', 'ETH'].includes(currency)) {
    return `${info.symbol}${amount.toFixed(8)}`;
  }
  
  return `${info.symbol}${amount.toFixed(2)}`;
}
