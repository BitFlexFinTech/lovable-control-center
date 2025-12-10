import { useState } from 'react';
import { 
  Activity, 
  Shield, 
  Mail, 
  Database,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Wifi
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useHealthMonitor } from '@/contexts/HealthMonitorContext';
import { cn } from '@/lib/utils';

// Health Status Widget
export function HealthStatusWidget() {
  const { siteHealths, overallHealth, isMonitoring, lastUpdate, refreshHealth } = useHealthMonitor();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshHealth();
    setIsRefreshing(false);
  };

  const healthySites = siteHealths.filter(h => h.health.status === 'healthy').length;
  const degradedSites = siteHealths.filter(h => h.health.status === 'degraded').length;
  const downSites = siteHealths.filter(h => h.health.status === 'down').length;

  return (
    <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center",
              overallHealth === 'healthy' ? 'bg-status-active/10' :
              overallHealth === 'degraded' ? 'bg-status-warning/10' : 'bg-status-inactive/10'
            )}>
              <Activity className={cn(
                "h-4 w-4",
                overallHealth === 'healthy' ? 'text-status-active' :
                overallHealth === 'degraded' ? 'text-status-warning' : 'text-status-inactive'
              )} />
            </div>
            <CardTitle className="text-sm font-medium">Health Monitor</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isMonitoring && (
              <div className="flex items-center gap-1.5">
                <Wifi className="h-3 w-3 text-status-active animate-pulse" />
                <span className="text-xs text-status-active">Live</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-status-active/10">
            <span className="text-lg font-bold text-status-active">{healthySites}</span>
            <p className="text-[10px] text-muted-foreground">Healthy</p>
          </div>
          <div className="p-2 rounded-lg bg-status-warning/10">
            <span className="text-lg font-bold text-status-warning">{degradedSites}</span>
            <p className="text-[10px] text-muted-foreground">Degraded</p>
          </div>
          <div className="p-2 rounded-lg bg-status-inactive/10">
            <span className="text-lg font-bold text-status-inactive">{downSites}</span>
            <p className="text-[10px] text-muted-foreground">Down</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Overall: {((healthySites / siteHealths.length) * 100).toFixed(0)}% healthy</span>
          {lastUpdate && (
            <span>Updated {new Date(lastUpdate).toLocaleTimeString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// SSL Status Widget
export function SSLStatusWidget() {
  // Mock SSL data
  const sslStats = {
    total: 6,
    active: 4,
    expiringSoon: 1,
    expired: 1,
  };

  return (
    <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '150ms' }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium">SSL Certificates</CardTitle>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
            Manage <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Valid certificates</span>
              <span className="font-medium">{sslStats.active}/{sslStats.total}</span>
            </div>
            <Progress value={(sslStats.active / sslStats.total) * 100} className="h-2" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {sslStats.expiringSoon > 0 && (
            <Badge variant="warning" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {sslStats.expiringSoon} expiring
            </Badge>
          )}
          {sslStats.expired > 0 && (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3 w-3" />
              {sslStats.expired} expired
            </Badge>
          )}
          {sslStats.expiringSoon === 0 && sslStats.expired === 0 && (
            <Badge variant="active" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              All valid
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Email Stats Widget
export function EmailStatsWidget() {
  // Mock email data
  const emailStats = {
    sent: 1250,
    delivered: 1180,
    opened: 890,
    bounced: 45,
    deliveryRate: 94.4,
    openRate: 75.4,
  };

  return (
    <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium">Email Pipeline</CardTitle>
          </div>
          <Badge variant="active" className="text-xs">SendGrid</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Delivery Rate</p>
            <p className="text-lg font-bold text-status-active">{emailStats.deliveryRate}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Open Rate</p>
            <p className="text-lg font-bold">{emailStats.openRate}%</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{emailStats.sent.toLocaleString()} sent today</span>
          {emailStats.bounced > 0 && (
            <Badge variant="outline" className="text-status-warning">
              {emailStats.bounced} bounced
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Backup Status Widget
export function BackupStatusWidget() {
  // Mock backup data
  const backupStats = {
    lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    nextBackup: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    totalBackups: 28,
    storageUsed: 2.4, // GB
    storageLimit: 10, // GB
  };

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <Card className="opacity-0 animate-fade-in" style={{ animationDelay: '250ms' }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Database className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium">Backups</CardTitle>
          </div>
          <Badge variant="active" className="gap-1 text-xs">
            <CheckCircle className="h-3 w-3" />
            Auto
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Last backup</p>
            <p className="text-sm font-medium">{formatTimeAgo(backupStats.lastBackup)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-sm font-medium">{backupStats.totalBackups}</p>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Storage</span>
            <span>{backupStats.storageUsed}GB / {backupStats.storageLimit}GB</span>
          </div>
          <Progress value={(backupStats.storageUsed / backupStats.storageLimit) * 100} className="h-1.5" />
        </div>
      </CardContent>
    </Card>
  );
}
