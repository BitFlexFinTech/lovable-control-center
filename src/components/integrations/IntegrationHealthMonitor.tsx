import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HealthStatusBadge } from './HealthStatusBadge';
import { QuotaProgressBar } from './QuotaProgressBar';
import { TokenExpirationAlert } from './TokenExpirationAlert';
import { CONTROL_CENTER_INTEGRATIONS } from '@/types/credentials';
import { IntegrationHealthStatus, HealthAlert } from '@/types/integrationHealth';
import { cn } from '@/lib/utils';

const integrationNames: Record<string, string> = {
  supabase: 'Supabase',
  sendgrid: 'SendGrid',
  'gmail-api': 'Gmail API',
  github: 'GitHub',
  slack: 'Slack',
  namecheap: 'Namecheap',
  letsencrypt: "Let's Encrypt",
  'lovable-cloud': 'Lovable Cloud',
  'google-analytics': 'Google Analytics',
  'microsoft-graph': 'Microsoft Graph',
  'aws-s3': 'AWS S3',
};

// Simulate health check results
function simulateHealthCheck(integrationId: string): IntegrationHealthStatus {
  const now = new Date().toISOString();
  const random = Math.random();
  
  let status: IntegrationHealthStatus['status'] = 'healthy';
  let connectionStatus: IntegrationHealthStatus['connectionStatus'] = 'connected';
  
  if (random > 0.9) {
    status = 'error';
    connectionStatus = 'disconnected';
  } else if (random > 0.8) {
    status = 'warning';
  }

  const baseHealth: IntegrationHealthStatus = {
    integrationId,
    status,
    connectionStatus,
    lastChecked: now,
    lastSuccessfulCall: status !== 'error' ? now : undefined,
  };

  // Add quota info for relevant integrations
  if (['sendgrid', 'gmail-api', 'github'].includes(integrationId)) {
    const quotaUsed = Math.floor(Math.random() * 100);
    baseHealth.quota = {
      used: quotaUsed,
      limit: 100,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      percentUsed: quotaUsed,
    };
    if (quotaUsed > 80) baseHealth.status = 'warning';
  }

  // Add token expiration for OAuth integrations
  if (['gmail-api', 'microsoft-graph', 'slack', 'github'].includes(integrationId)) {
    const daysRemaining = Math.floor(Math.random() * 30);
    baseHealth.tokenExpiration = {
      expiresAt: new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining,
      needsRefresh: daysRemaining < 7,
    };
    if (daysRemaining < 7) baseHealth.status = 'warning';
  }

  // Add rate limit info
  if (['supabase', 'github', 'sendgrid'].includes(integrationId)) {
    const remaining = Math.floor(Math.random() * 1000);
    baseHealth.rateLimit = {
      remaining,
      limit: 1000,
      resetAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      isLimited: remaining < 10,
    };
  }

  if (status === 'error') {
    baseHealth.error = {
      code: 'CONNECTION_FAILED',
      message: 'Unable to connect to the integration API',
      occurredAt: now,
      resolution: 'Check your API credentials and network connection',
    };
  }

  return baseHealth;
}

export function IntegrationHealthMonitor() {
  const [healthStatuses, setHealthStatuses] = useState<Record<string, IntegrationHealthStatus>>({});
  const [isChecking, setIsChecking] = useState(false);
  const [lastGlobalCheck, setLastGlobalCheck] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);

  const checkAllHealth = useCallback(async () => {
    setIsChecking(true);
    const newStatuses: Record<string, IntegrationHealthStatus> = {};
    
    for (const id of CONTROL_CENTER_INTEGRATIONS) {
      newStatuses[id] = simulateHealthCheck(id);
    }
    
    setHealthStatuses(newStatuses);
    setLastGlobalCheck(new Date().toISOString());
    
    // Generate alerts
    const newAlerts: HealthAlert[] = [];
    Object.values(newStatuses).forEach(status => {
      const name = integrationNames[status.integrationId] || status.integrationId;
      if (status.status === 'error') {
        newAlerts.push({
          id: `${status.integrationId}-error`,
          integrationId: status.integrationId,
          integrationName: name,
          type: 'connection_error',
          severity: 'critical',
          message: `${name} connection failed`,
          actionRequired: 'Check credentials and reconnect',
          createdAt: new Date().toISOString(),
          acknowledged: false,
        });
      }
      if (status.quota && status.quota.percentUsed > 80) {
        newAlerts.push({
          id: `${status.integrationId}-quota`,
          integrationId: status.integrationId,
          integrationName: name,
          type: 'quota_warning',
          severity: status.quota.percentUsed > 95 ? 'high' : 'medium',
          message: `${name} quota at ${status.quota.percentUsed}%`,
          actionRequired: 'Consider upgrading plan',
          createdAt: new Date().toISOString(),
          acknowledged: false,
        });
      }
    });
    setAlerts(newAlerts);
    setIsChecking(false);
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, acknowledged: true } : a
    ));
  }, []);

  useEffect(() => {
    checkAllHealth();
  }, [checkAllHealth]);

  const statuses = Object.values(healthStatuses);
  const healthy = statuses.filter(s => s.status === 'healthy').length;
  const warning = statuses.filter(s => s.status === 'warning').length;
  const error = statuses.filter(s => s.status === 'error').length;
  const healthScore = statuses.length === 0 ? 100 : Math.round((healthy / statuses.length) * 100);

  const activeAlerts = alerts.filter(a => !a.acknowledged);
  const tokenAlerts = statuses
    .filter(s => s.tokenExpiration?.needsRefresh)
    .map(s => ({
      integrationId: s.integrationId,
      name: integrationNames[s.integrationId] || s.integrationId,
      ...s.tokenExpiration!,
    }));

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              healthScore >= 90 ? 'bg-status-active/10' : 
              healthScore >= 70 ? 'bg-status-warning/10' : 'bg-status-error/10'
            )}>
              <Activity className={cn(
                'h-5 w-5',
                healthScore >= 90 ? 'text-status-active' : 
                healthScore >= 70 ? 'text-status-warning' : 'text-status-error'
              )} />
            </div>
            <div>
              <CardTitle className="text-base">Integration Health</CardTitle>
              <p className="text-sm text-muted-foreground">
                {lastGlobalCheck 
                  ? `Last checked ${new Date(lastGlobalCheck).toLocaleTimeString()}`
                  : 'Checking...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className={cn(
                'text-2xl font-bold',
                healthScore >= 90 ? 'text-status-active' : 
                healthScore >= 70 ? 'text-status-warning' : 'text-status-error'
              )}>
                {healthScore}%
              </div>
              <div className="text-xs text-muted-foreground">Health Score</div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkAllHealth}
              disabled={isChecking}
              className="gap-1"
            >
              <RefreshCw className={cn('h-4 w-4', isChecking && 'animate-spin')} />
              Check All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-status-active/10">
            <CheckCircle className="h-4 w-4 text-status-active" />
            <div>
              <div className="text-lg font-semibold text-status-active">{healthy}</div>
              <div className="text-xs text-muted-foreground">Healthy</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-status-warning/10">
            <AlertTriangle className="h-4 w-4 text-status-warning" />
            <div>
              <div className="text-lg font-semibold text-status-warning">{warning}</div>
              <div className="text-xs text-muted-foreground">Warning</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-status-error/10">
            <XCircle className="h-4 w-4 text-status-error" />
            <div>
              <div className="text-lg font-semibold text-status-error">{error}</div>
              <div className="text-xs text-muted-foreground">Error</div>
            </div>
          </div>
        </div>

        {/* Token Expiration Alerts */}
        {tokenAlerts.length > 0 && (
          <div className="space-y-2">
            {tokenAlerts.map(alert => (
              <TokenExpirationAlert
                key={alert.integrationId}
                integrationName={alert.name}
                expiresAt={alert.expiresAt}
                daysRemaining={alert.daysRemaining}
                onRefresh={() => console.log('Refresh', alert.integrationId)}
              />
            ))}
          </div>
        )}

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-status-warning" />
              Active Alerts ({activeAlerts.length})
            </h4>
            <ScrollArea className="max-h-32">
              <div className="space-y-2">
                {activeAlerts.slice(0, 5).map(alert => (
                  <div 
                    key={alert.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        alert.severity === 'critical' ? 'destructive' :
                        alert.severity === 'high' ? 'default' : 'secondary'
                      } className="text-xs">
                        {alert.severity}
                      </Badge>
                      <span className="text-sm">{alert.message}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Integration List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">All Integrations</h4>
          <ScrollArea className="max-h-48">
            <div className="space-y-1">
              {CONTROL_CENTER_INTEGRATIONS.map(id => {
                const status = healthStatuses[id];
                const name = integrationNames[id] || id;
                
                return (
                  <div 
                    key={id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm">{name}</span>
                    <div className="flex items-center gap-2">
                      {status?.quota && (
                        <div className="w-24">
                          <QuotaProgressBar
                            used={status.quota.used}
                            limit={status.quota.limit}
                            showPercentage={false}
                          />
                        </div>
                      )}
                      <HealthStatusBadge status={status} size="sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
