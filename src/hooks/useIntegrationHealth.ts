import { useMemo } from 'react';
import { useIntegrationHealth as useHealthContext } from '@/contexts/IntegrationHealthContext';
import { CONTROL_CENTER_INTEGRATIONS } from '@/types/credentials';

export function useIntegrationHealthSummary() {
  const { healthStatuses, alerts, overallHealthScore, isChecking } = useHealthContext();

  const summary = useMemo(() => {
    const statuses = Object.values(healthStatuses);
    const healthy = statuses.filter(s => s.status === 'healthy').length;
    const warning = statuses.filter(s => s.status === 'warning').length;
    const error = statuses.filter(s => s.status === 'error').length;
    const unknown = CONTROL_CENTER_INTEGRATIONS.length - statuses.length;

    const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;
    const pendingAlerts = alerts.filter(a => !a.acknowledged).length;

    return {
      healthy,
      warning,
      error,
      unknown,
      total: CONTROL_CENTER_INTEGRATIONS.length,
      healthScore: overallHealthScore,
      criticalAlerts,
      pendingAlerts,
      isChecking,
    };
  }, [healthStatuses, alerts, overallHealthScore, isChecking]);

  return summary;
}

export function useIntegrationAlerts(integrationId?: string) {
  const { alerts, acknowledgeAlert } = useHealthContext();

  const filteredAlerts = useMemo(() => {
    if (!integrationId) return alerts;
    return alerts.filter(a => a.integrationId === integrationId);
  }, [alerts, integrationId]);

  const unacknowledgedCount = filteredAlerts.filter(a => !a.acknowledged).length;

  return {
    alerts: filteredAlerts,
    unacknowledgedCount,
    acknowledgeAlert,
  };
}
