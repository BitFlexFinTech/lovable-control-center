import { Globe, Users, HardDrive, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tenant } from '@/types';
import { TenantStats, TenantBilling } from '@/types/monitoring';
import { useSites } from '@/hooks/useSupabaseSites';
import { useSupabaseUserCount } from '@/hooks/useSupabaseUsers';

interface TenantStatsCardProps {
  tenant: Tenant;
}

export function TenantStatsCard({ tenant }: TenantStatsCardProps) {
  const { data: allSites = [] } = useSites();
  const { data: userCount = 0 } = useSupabaseUserCount();

  // Calculate stats from Supabase data
  const tenantSites = allSites.filter(s => s.tenant_id === tenant.id);
  
  const stats: TenantStats = {
    totalSites: tenantSites.length,
    activeSites: tenantSites.filter(s => s.status === 'active' || s.status === 'live').length,
    totalUsers: userCount,
    storageUsed: Math.random() * 5 * 1024 * 1024 * 1024, // Simulated 0-5GB
    bandwidthUsed: Math.random() * 50 * 1024 * 1024 * 1024, // Simulated 0-50GB
    lastActivity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
  };

  const billing: TenantBilling = {
    plan: tenant.environment === 'production' ? 'professional' : 'starter',
    status: 'active',
    currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    amount: tenant.environment === 'production' ? 99 : 29,
    currency: 'USD',
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storagePercent = (stats.storageUsed / (10 * 1024 * 1024 * 1024)) * 100;
  const bandwidthPercent = (stats.bandwidthUsed / (100 * 1024 * 1024 * 1024)) * 100;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{tenant.name}</CardTitle>
          <Badge variant={
            tenant.environment === 'production' ? 'active' :
            tenant.environment === 'staging' ? 'warning' : 'secondary'
          }>
            {tenant.environment}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{tenant.slug}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold">{stats.totalSites}</p>
              <p className="text-xs text-muted-foreground">Sites</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold">{stats.totalUsers}</p>
              <p className="text-xs text-muted-foreground">Users</p>
            </div>
          </div>
        </div>

        {/* Storage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <span>Storage</span>
            </div>
            <span className="text-muted-foreground">
              {formatBytes(stats.storageUsed)} / 10 GB
            </span>
          </div>
          <Progress value={storagePercent} className="h-2" />
        </div>

        {/* Bandwidth */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span>Bandwidth</span>
            </div>
            <span className="text-muted-foreground">
              {formatBytes(stats.bandwidthUsed)} / 100 GB
            </span>
          </div>
          <Progress value={bandwidthPercent} className="h-2" />
        </div>

        {/* Billing */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <p className="text-sm font-medium capitalize">{billing.plan} Plan</p>
            <p className="text-xs text-muted-foreground">
              ${billing.amount}/month
            </p>
          </div>
          <Badge variant={billing.status === 'active' ? 'active' : 'warning'}>
            {billing.status}
          </Badge>
        </div>

        {/* Activity Indicator */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last activity</span>
          <span className="font-medium">
            {new Date(stats.lastActivity).toLocaleTimeString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
