import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useSites } from '@/hooks/useSupabaseSites';
import { useSitePaymentSettings, useToggleSitePayment, PaymentProvider } from '@/hooks/useGlobalPaymentProviders';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, DollarSign, Bitcoin, Activity, Globe } from 'lucide-react';

const PROVIDERS: { id: PaymentProvider; name: string; icon: React.ReactNode }[] = [
  { id: 'stripe', name: 'Stripe', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'paypal', name: 'PayPal', icon: <DollarSign className="h-4 w-4" /> },
  { id: 'btc', name: 'BTC', icon: <Bitcoin className="h-4 w-4 text-orange-500" /> },
  { id: 'usdt', name: 'USDT', icon: <DollarSign className="h-4 w-4 text-green-500" /> },
  { id: 'eth', name: 'ETH', icon: <Activity className="h-4 w-4 text-purple-500" /> },
];

function SitePaymentRow({ siteId, siteName, siteColor }: { siteId: string; siteName: string; siteColor?: string | null }) {
  const { toast } = useToast();
  const { data: settings = [], isLoading } = useSitePaymentSettings(siteId);
  const togglePayment = useToggleSitePayment();

  const handleToggle = async (provider: PaymentProvider, currentEnabled: boolean) => {
    try {
      await togglePayment.mutateAsync({
        siteId,
        provider,
        isEnabled: !currentEnabled,
      });
      toast({
        title: `${provider.toUpperCase()} ${!currentEnabled ? 'enabled' : 'disabled'}`,
        description: `Payment method updated for ${siteName}`,
      });
    } catch (error) {
      toast({
        title: 'Failed to update',
        variant: 'destructive',
      });
    }
  };

  const getSettingForProvider = (provider: PaymentProvider) => {
    return settings.find(s => s.provider === provider);
  };

  if (isLoading) {
    return (
      <TableRow>
        <TableCell>
          <Skeleton className="h-4 w-32" />
        </TableCell>
        {PROVIDERS.map(p => (
          <TableCell key={p.id} className="text-center">
            <Skeleton className="h-5 w-10 mx-auto" />
          </TableCell>
        ))}
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          {siteColor && (
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: siteColor }} 
            />
          )}
          <span className="font-medium">{siteName}</span>
        </div>
      </TableCell>
      {PROVIDERS.map(provider => {
        const setting = getSettingForProvider(provider.id);
        const isEnabled = setting?.is_enabled ?? false;
        
        return (
          <TableCell key={provider.id} className="text-center">
            <Switch
              checked={isEnabled}
              onCheckedChange={() => handleToggle(provider.id, isEnabled)}
              disabled={togglePayment.isPending}
            />
          </TableCell>
        );
      })}
    </TableRow>
  );
}

export function UnifiedPaymentDashboard() {
  const { data: sites = [], isLoading } = useSites();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Payment Methods by Site</CardTitle>
            <CardDescription>
              Enable or disable payment methods for each site from one view
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : sites.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No sites found. Create a site to manage payments.</p>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[200px]">Site</TableHead>
                  {PROVIDERS.map(provider => (
                    <TableHead key={provider.id} className="text-center w-[100px]">
                      <div className="flex items-center justify-center gap-1.5">
                        {provider.icon}
                        <span className="text-xs">{provider.name}</span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map(site => (
                  <SitePaymentRow
                    key={site.id}
                    siteId={site.id}
                    siteName={site.name}
                    siteColor={site.app_color}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
