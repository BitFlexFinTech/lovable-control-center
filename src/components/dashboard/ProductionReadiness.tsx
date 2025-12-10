import { CheckCircle2, AlertCircle, Circle } from 'lucide-react';
import { useIntegrations } from '@/contexts/IntegrationsContext';
import { CONTROL_CENTER_ANALYSIS } from '@/utils/controlCenterAnalyzer';
import { CONTROL_CENTER_INTEGRATIONS } from '@/types/credentials';
import { cn } from '@/lib/utils';

export function ProductionReadiness() {
  const { integrations } = useIntegrations();

  // Get Control Center integrations with their criticality
  const ccIntegrations = integrations.filter(i => 
    CONTROL_CENTER_INTEGRATIONS.includes(i.id)
  );

  // Map criticality from analyzer
  const criticalIds = CONTROL_CENTER_ANALYSIS.criticalIntegrations.map(i => i.id);
  const importantIds = CONTROL_CENTER_ANALYSIS.importantIntegrations.map(i => i.id);

  const critical = ccIntegrations.filter(i => criticalIds.includes(i.id));
  const important = ccIntegrations.filter(i => importantIds.includes(i.id));

  const criticalConnected = critical.filter(i => i.status === 'active' || i.status === 'imported').length;
  const importantConnected = important.filter(i => i.status === 'active' || i.status === 'imported').length;
  const totalConnected = criticalConnected + importantConnected;
  const totalRequired = critical.length + important.length;

  const criticalPercent = critical.length > 0 ? Math.round((criticalConnected / critical.length) * 100) : 0;
  const overallPercent = totalRequired > 0 ? Math.round((totalConnected / totalRequired) * 100) : 0;

  const getStatusColor = (percent: number) => {
    if (percent === 100) return 'text-green-500';
    if (percent >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getProgressColor = (percent: number) => {
    if (percent === 100) return 'bg-green-500';
    if (percent >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="rounded-xl border bg-card p-5 opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Production Readiness</h3>
        <span className={cn("text-2xl font-bold", getStatusColor(overallPercent))}>
          {overallPercent}%
        </span>
      </div>

      <div className="mb-4">
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div 
            className={cn("h-full transition-all", getProgressColor(overallPercent))}
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {/* Critical Section */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Critical</span>
          </div>
          <span className={cn("font-medium", criticalConnected === critical.length ? "text-green-500" : "text-red-500")}>
            {criticalConnected}/{critical.length}
          </span>
        </div>

        {/* Important Section */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Important</span>
          </div>
          <span className={cn("font-medium", importantConnected === important.length ? "text-green-500" : "text-amber-500")}>
            {importantConnected}/{important.length}
          </span>
        </div>
      </div>

      {/* Status List */}
      <div className="mt-4 pt-4 border-t border-border space-y-2 max-h-32 overflow-y-auto">
        {critical.map(integration => {
          const isConnected = integration.status === 'active' || integration.status === 'imported';
          return (
            <div key={integration.id} className="flex items-center gap-2 text-xs">
              {isConnected ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
              )}
              <span className={cn(isConnected ? "text-muted-foreground" : "text-foreground")}>
                {integration.icon} {integration.name}
              </span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-500">
                Critical
              </span>
            </div>
          );
        })}
        {important.slice(0, 3).map(integration => {
          const isConnected = integration.status === 'active' || integration.status === 'imported';
          return (
            <div key={integration.id} className="flex items-center gap-2 text-xs">
              {isConnected ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              )}
              <span className={cn(isConnected ? "text-muted-foreground" : "text-foreground")}>
                {integration.icon} {integration.name}
              </span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500">
                Important
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}