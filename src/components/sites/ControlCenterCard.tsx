import { Pin, Settings, RefreshCw, Rocket, CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIntegrations } from '@/contexts/IntegrationsContext';
import { CONTROL_CENTER_ANALYSIS } from '@/utils/controlCenterAnalyzer';
import { CONTROL_CENTER_INTEGRATIONS } from '@/types/credentials';
import { cn } from '@/lib/utils';

interface ControlCenterCardProps {
  isLive?: boolean;
  onGoLive: () => void;
  onSettings: () => void;
  onHealthCheck: () => void;
}

export function ControlCenterCard({ 
  isLive = false, 
  onGoLive, 
  onSettings, 
  onHealthCheck 
}: ControlCenterCardProps) {
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

  const readinessPercent = totalRequired > 0 ? Math.round((totalConnected / totalRequired) * 100) : 0;
  const isReady = readinessPercent === 100;

  const getProgressColor = (percent: number) => {
    if (percent === 100) return 'bg-status-active';
    if (percent >= 50) return 'bg-status-warning';
    return 'bg-status-inactive';
  };

  const getStatusColor = (percent: number) => {
    if (percent === 100) return 'text-status-active';
    if (percent >= 50) return 'text-status-warning';
    return 'text-status-inactive';
  };

  // Get missing integrations
  const missingCritical = critical.filter(i => i.status !== 'active' && i.status !== 'imported');
  const missingImportant = important.filter(i => i.status !== 'active' && i.status !== 'imported');

  return (
    <div className="rounded-xl border-2 border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10 p-6 opacity-0 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Pin className="h-4 w-4 text-primary" />
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Control Center</h3>
            <p className="text-sm text-muted-foreground">Platform Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLive ? (
            <Badge className="bg-status-active/20 text-status-active border-status-active/30">
              Production
            </Badge>
          ) : (
            <Badge className="bg-status-warning/20 text-status-warning border-status-warning/30">
              Development
            </Badge>
          )}
          <Button variant="ghost" size="icon-sm" onClick={onSettings}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onHealthCheck}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Production Readiness */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Production Readiness</span>
          <span className={cn("text-2xl font-bold", getStatusColor(readinessPercent))}>
            {readinessPercent}%
          </span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div 
            className={cn("h-full transition-all duration-500", getProgressColor(readinessPercent))}
            style={{ width: `${readinessPercent}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg bg-card/50 p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="w-2 h-2 rounded-full bg-status-inactive" />
            <span className="text-xs text-muted-foreground">Critical</span>
          </div>
          <span className={cn("text-lg font-semibold", 
            criticalConnected === critical.length ? "text-status-active" : "text-status-inactive"
          )}>
            {criticalConnected}/{critical.length}
          </span>
        </div>
        <div className="rounded-lg bg-card/50 p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="w-2 h-2 rounded-full bg-status-warning" />
            <span className="text-xs text-muted-foreground">Important</span>
          </div>
          <span className={cn("text-lg font-semibold",
            importantConnected === important.length ? "text-status-active" : "text-status-warning"
          )}>
            {importantConnected}/{important.length}
          </span>
        </div>
        <div className="rounded-lg bg-card/50 p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle2 className="h-3 w-3 text-status-active" />
            <span className="text-xs text-muted-foreground">Uptime</span>
          </div>
          <span className="text-lg font-semibold text-status-active">99.9%</span>
        </div>
        <div className="rounded-lg bg-card/50 p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Response</span>
          </div>
          <span className="text-lg font-semibold">45ms</span>
        </div>
      </div>

      {/* Missing Integrations */}
      {(missingCritical.length > 0 || missingImportant.length > 0) && (
        <div className="mb-6 p-3 rounded-lg bg-card/30 border border-border/50">
          <p className="text-sm text-muted-foreground mb-2">Missing integrations:</p>
          <div className="flex flex-wrap gap-2">
            {missingCritical.map(i => (
              <Badge key={i.id} variant="outline" className="text-status-inactive border-status-inactive/30">
                <AlertCircle className="h-3 w-3 mr-1" />
                {i.name}
              </Badge>
            ))}
            {missingImportant.slice(0, 3).map(i => (
              <Badge key={i.id} variant="outline" className="text-status-warning border-status-warning/30">
                {i.name}
              </Badge>
            ))}
            {missingImportant.length > 3 && (
              <Badge variant="outline" className="text-muted-foreground">
                +{missingImportant.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Go Live Button */}
      <div className="flex justify-end">
        <Button 
          onClick={onGoLive}
          disabled={!isReady || isLive}
          className={cn(
            "gap-2",
            isReady && !isLive && "bg-status-active hover:bg-status-active/90"
          )}
        >
          <Rocket className="h-4 w-4" />
          {isLive ? 'Already Live' : isReady ? 'Go Live' : `${readinessPercent}% Ready`}
        </Button>
      </div>
    </div>
  );
}