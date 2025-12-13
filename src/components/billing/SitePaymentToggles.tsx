import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Bitcoin, DollarSign, Activity, Loader2 } from 'lucide-react';
import { 
  useGlobalPaymentProviders, 
  useSitePaymentSettings, 
  useToggleSitePayment,
  PAYMENT_PROVIDERS,
  PaymentProvider 
} from '@/hooks/useGlobalPaymentProviders';
import { useSites } from '@/hooks/useDashboardData';
import { useToast } from '@/hooks/use-toast';

const providerIcons: Record<PaymentProvider, React.ReactNode> = {
  stripe: <CreditCard className="h-4 w-4" />,
  paypal: <DollarSign className="h-4 w-4" />,
  btc: <Bitcoin className="h-4 w-4" />,
  usdt: <DollarSign className="h-4 w-4 text-green-500" />,
  eth: <Activity className="h-4 w-4 text-purple-500" />,
};

interface SitePaymentTogglesProps {
  siteId: string;
}

export function SitePaymentToggles({ siteId }: SitePaymentTogglesProps) {
  const { toast } = useToast();
  const { data: globalProviders = [], isLoading: providersLoading } = useGlobalPaymentProviders();
  const { data: siteSettings = [], isLoading: settingsLoading } = useSitePaymentSettings(siteId);
  const togglePayment = useToggleSitePayment();
  
  const isLoading = providersLoading || settingsLoading;
  
  const connectedProviders = globalProviders.filter(p => p.is_connected);
  
  const isProviderEnabled = (provider: PaymentProvider): boolean => {
    const setting = siteSettings.find(s => s.provider === provider);
    // Default to enabled if no setting exists and provider is connected globally
    return setting ? setting.is_enabled : connectedProviders.some(p => p.provider === provider);
  };
  
  const handleToggle = async (provider: PaymentProvider, enabled: boolean) => {
    try {
      await togglePayment.mutateAsync({
        siteId,
        provider,
        isEnabled: enabled,
      });
      toast({
        title: enabled ? 'Payment method enabled' : 'Payment method disabled',
        description: `${PAYMENT_PROVIDERS[provider].name} is now ${enabled ? 'active' : 'inactive'} for this site`,
      });
    } catch (error) {
      toast({ title: 'Failed to update payment settings', variant: 'destructive' });
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  if (connectedProviders.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No payment providers connected</p>
          <p className="text-sm text-muted-foreground mt-1">
            Connect providers in Billing Management to enable payments
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Payment Methods</CardTitle>
        <CardDescription>Enable or disable payment methods for this site</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectedProviders.map(provider => {
          const info = PAYMENT_PROVIDERS[provider.provider as PaymentProvider];
          const isEnabled = isProviderEnabled(provider.provider as PaymentProvider);
          
          return (
            <div key={provider.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div 
                  className="h-8 w-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${info.color}20`, color: info.color }}
                >
                  {providerIcons[provider.provider as PaymentProvider]}
                </div>
                <div>
                  <p className="font-medium text-sm">{info.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{info.symbol}</span>
                    {provider.is_sandbox && (
                      <Badge variant="secondary" className="text-[10px]">Sandbox</Badge>
                    )}
                  </div>
                </div>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={(checked) => handleToggle(provider.provider as PaymentProvider, checked)}
                disabled={togglePayment.isPending}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function AllSitesPaymentToggles() {
  const { data: sites = [] } = useSites();
  
  if (sites.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No sites to configure
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {sites.map(site => (
        <div key={site.id}>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <div 
              className="h-3 w-3 rounded-full" 
              style={{ backgroundColor: site.app_color || '#3b82f6' }} 
            />
            {site.name}
          </h3>
          <SitePaymentToggles siteId={site.id} />
        </div>
      ))}
    </div>
  );
}
