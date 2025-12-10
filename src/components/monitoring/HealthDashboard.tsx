import { useState } from 'react';
import { Activity, RefreshCw, CheckCircle, AlertTriangle, XCircle, Wifi, WifiOff, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useHealthMonitor } from '@/contexts/HealthMonitorContext';
import { cn } from '@/lib/utils';

export function HealthDashboard() {
  const { 
    siteHealths, 
    overallHealth, 
    isMonitoring, 
    lastUpdate, 
    refreshHealth, 
    startMonitoring, 
    stopMonitoring 
  } = useHealthMonitor();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshHealth();
    setIsRefreshing(false);
  };

  const healthySites = siteHealths.filter(h => h.health.status === 'healthy').length;
  const degradedSites = siteHealths.filter(h => h.health.status === 'degraded').length;
  const downSites = siteHealths.filter(h => h.health.status === 'down').length;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusIcon = (status: 'healthy' | 'degraded' | 'down') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-status-active" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-status-warning" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-status-inactive" />;
    }
  };

  const getStatusColor = (status: 'healthy' | 'degraded' | 'down') => {
    switch (status) {
      case 'healthy':
        return 'bg-status-active';
      case 'degraded':
        return 'bg-status-warning';
      case 'down':
        return 'bg-status-inactive';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center",
            overallHealth === 'healthy' ? 'bg-status-active/20' :
            overallHealth === 'degraded' ? 'bg-status-warning/20' : 'bg-status-inactive/20'
          )}>
            <Activity className={cn(
              "h-5 w-5",
              overallHealth === 'healthy' ? 'text-status-active' :
              overallHealth === 'degraded' ? 'text-status-warning' : 'text-status-inactive'
            )} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Health Monitor</h2>
            <p className="text-sm text-muted-foreground">
              Real-time status for all sites
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isMonitoring ? (
              <Wifi className="h-4 w-4 text-status-active" />
            ) : (
              <WifiOff className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm text-muted-foreground">Live</span>
            <Switch
              checked={isMonitoring}
              onCheckedChange={(checked) => checked ? startMonitoring() : stopMonitoring()}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-1.5"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sites</p>
                <p className="text-2xl font-bold">{siteHealths.length}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-status-active/30 bg-status-active/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Healthy</p>
                <p className="text-2xl font-bold text-status-active">{healthySites}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-status-active/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-status-warning/30 bg-status-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Degraded</p>
                <p className="text-2xl font-bold text-status-warning">{degradedSites}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-status-warning/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-status-inactive/30 bg-status-inactive/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Down</p>
                <p className="text-2xl font-bold text-status-inactive">{downSites}</p>
              </div>
              <XCircle className="h-8 w-8 text-status-inactive/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sites List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Site Status</CardTitle>
            {lastUpdate && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Last updated: {formatTime(lastUpdate)}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {siteHealths.map((site) => (
              <div key={site.siteId} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-2.5 w-2.5 rounded-full", getStatusColor(site.health.status))} />
                    <div>
                      <p className="font-medium">{site.siteName}</p>
                      <p className="text-sm text-muted-foreground">{site.domain}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-medium">{site.health.uptime.toFixed(2)}%</p>
                      <p className="text-xs text-muted-foreground">Uptime</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{Math.round(site.health.responseTime)}ms</p>
                      <p className="text-xs text-muted-foreground">Response</p>
                    </div>
                    <div className="w-24">
                      <Progress 
                        value={site.health.uptime} 
                        className="h-1.5"
                      />
                    </div>
                    <Badge variant={
                      site.health.status === 'healthy' ? 'active' :
                      site.health.status === 'degraded' ? 'warning' : 'destructive'
                    }>
                      {site.health.status}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      {site.health.sslValid ? (
                        <Badge variant="outline" className="text-status-active border-status-active/30">
                          SSL Valid
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-status-warning border-status-warning/30">
                          SSL Issue
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
