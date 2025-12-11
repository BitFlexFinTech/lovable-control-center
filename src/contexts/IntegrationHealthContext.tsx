import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { IntegrationHealthStatus, HealthAlert } from '@/types/integrationHealth';
import { CONTROL_CENTER_INTEGRATIONS } from '@/types/credentials';
import { useNotifications } from '@/contexts/NotificationContext';

interface IntegrationHealthContextType {
  healthStatuses: Record<string, IntegrationHealthStatus>;
  alerts: HealthAlert[];
  isChecking: boolean;
  lastGlobalCheck: string | null;
  checkHealth: (integrationId: string) => Promise<void>;
  checkAllHealth: () => Promise<void>;
  acknowledgeAlert: (alertId: string) => void;
  getHealthStatus: (integrationId: string) => IntegrationHealthStatus | null;
  overallHealthScore: number;
}

const IntegrationHealthContext = createContext<IntegrationHealthContextType | undefined>(undefined);

// Simulate health check results
function simulateHealthCheck(integrationId: string): IntegrationHealthStatus {
  const now = new Date().toISOString();
  const random = Math.random();
  
  // Most integrations are healthy
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
    if (quotaUsed > 80) {
      baseHealth.status = 'warning';
    }
  }

  // Add token expiration for OAuth integrations
  if (['gmail-api', 'microsoft-graph', 'slack', 'github'].includes(integrationId)) {
    const daysRemaining = Math.floor(Math.random() * 30);
    baseHealth.tokenExpiration = {
      expiresAt: new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining,
      needsRefresh: daysRemaining < 7,
    };
    if (daysRemaining < 7) {
      baseHealth.status = 'warning';
    }
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

  // Add error for disconnected
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

export function IntegrationHealthProvider({ children }: { children: ReactNode }) {
  const [healthStatuses, setHealthStatuses] = useState<Record<string, IntegrationHealthStatus>>({});
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastGlobalCheck, setLastGlobalCheck] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const generateAlerts = useCallback((statuses: Record<string, IntegrationHealthStatus>) => {
    const newAlerts: HealthAlert[] = [];
    const integrationNames: Record<string, string> = {
      supabase: 'Supabase',
      sendgrid: 'SendGrid',
      'gmail-api': 'Gmail API',
      github: 'GitHub',
      slack: 'Slack',
      namecheap: 'Namecheap',
      'letsencrypt': "Let's Encrypt",
    };

    Object.values(statuses).forEach(status => {
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
          actionRequired: 'Consider upgrading plan or reducing usage',
          createdAt: new Date().toISOString(),
          acknowledged: false,
        });
      }

      if (status.tokenExpiration?.needsRefresh) {
        newAlerts.push({
          id: `${status.integrationId}-token`,
          integrationId: status.integrationId,
          integrationName: name,
          type: 'token_expiring',
          severity: status.tokenExpiration.daysRemaining < 3 ? 'high' : 'medium',
          message: `${name} token expires in ${status.tokenExpiration.daysRemaining} days`,
          actionRequired: 'Refresh OAuth token',
          createdAt: new Date().toISOString(),
          acknowledged: false,
        });
      }

      if (status.rateLimit?.isLimited) {
        newAlerts.push({
          id: `${status.integrationId}-ratelimit`,
          integrationId: status.integrationId,
          integrationName: name,
          type: 'rate_limit',
          severity: 'high',
          message: `${name} rate limit nearly exhausted`,
          actionRequired: 'Reduce API calls or wait for reset',
          createdAt: new Date().toISOString(),
          acknowledged: false,
        });
      }
    });

    setAlerts(newAlerts);

    // Add critical alerts to notification center
    newAlerts.filter(a => a.severity === 'critical' && !a.acknowledged).forEach(alert => {
      addNotification({
        title: alert.message,
        message: alert.actionRequired,
        type: 'alert',
        category: 'system',
      });
    });
  }, [addNotification]);

  const checkHealth = useCallback(async (integrationId: string) => {
    const result = simulateHealthCheck(integrationId);
    setHealthStatuses(prev => ({ ...prev, [integrationId]: result }));
  }, []);

  const checkAllHealth = useCallback(async () => {
    setIsChecking(true);
    const newStatuses: Record<string, IntegrationHealthStatus> = {};
    
    for (const id of CONTROL_CENTER_INTEGRATIONS) {
      newStatuses[id] = simulateHealthCheck(id);
    }
    
    setHealthStatuses(newStatuses);
    setLastGlobalCheck(new Date().toISOString());
    generateAlerts(newStatuses);
    setIsChecking(false);
  }, [generateAlerts]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, acknowledged: true } : a
    ));
  }, []);

  const getHealthStatus = useCallback((integrationId: string) => {
    return healthStatuses[integrationId] || null;
  }, [healthStatuses]);

  const overallHealthScore = Object.values(healthStatuses).length === 0 ? 100 :
    Math.round(
      (Object.values(healthStatuses).filter(s => s.status === 'healthy').length / 
       Object.values(healthStatuses).length) * 100
    );

  // Auto-check on mount and every 5 minutes
  useEffect(() => {
    checkAllHealth();
    const interval = setInterval(checkAllHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkAllHealth]);

  return (
    <IntegrationHealthContext.Provider value={{
      healthStatuses,
      alerts,
      isChecking,
      lastGlobalCheck,
      checkHealth,
      checkAllHealth,
      acknowledgeAlert,
      getHealthStatus,
      overallHealthScore,
    }}>
      {children}
    </IntegrationHealthContext.Provider>
  );
}

export function useIntegrationHealth() {
  const context = useContext(IntegrationHealthContext);
  if (!context) {
    throw new Error('useIntegrationHealth must be used within an IntegrationHealthProvider');
  }
  return context;
}
