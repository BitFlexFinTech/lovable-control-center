import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Bitcoin, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { useCurrencyBalances, SUPPORTED_CURRENCIES, calculateTotalUSD, formatCurrencyAmount } from '@/hooks/useCurrencyBalances';
import { cn } from '@/lib/utils';

const currencyIcons: Record<string, React.ReactNode> = {
  USD: <DollarSign className="h-5 w-5" />,
  BTC: <Bitcoin className="h-5 w-5" />,
  ETH: <Activity className="h-5 w-5" />,
  USDT: <DollarSign className="h-5 w-5" />,
};

// Mock 24h change data (in real app, fetch from price API)
const mockChanges: Record<string, number> = {
  USD: 0,
  BTC: 2.4,
  ETH: -0.8,
  USDT: 0.01,
};

export function CurrencyBalanceCards() {
  const { data: balances = [], isLoading } = useCurrencyBalances();
  
  const totalUSD = calculateTotalUSD(balances);
  
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-8 bg-muted rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Total Balance Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Balance (USD Equivalent)</p>
              <p className="text-3xl font-bold mt-1">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(totalUSD)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Individual Currency Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {balances.map(balance => {
          const info = SUPPORTED_CURRENCIES[balance.currency];
          if (!info) return null;
          
          const change = mockChanges[balance.currency] || 0;
          const isPositive = change >= 0;
          
          return (
            <Card key={balance.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{info.name}</CardTitle>
                <div 
                  className="h-8 w-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${info.color}20`, color: info.color }}
                >
                  {currencyIcons[balance.currency] || info.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrencyAmount(balance.balance, balance.currency)}
                </div>
                {balance.currency !== 'USD' && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      ≈ ${(balance.balance * (balance.currency === 'BTC' ? 67432.50 : balance.currency === 'ETH' ? 3892.18 : 1)).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs gap-0.5",
                        isPositive ? "text-status-active" : "text-status-inactive"
                      )}
                    >
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {isPositive ? '+' : ''}{change}%
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
