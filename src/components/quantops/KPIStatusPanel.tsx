import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useKPIThresholds } from '@/hooks/useQuantOps';
import { Skeleton } from '@/components/ui/skeleton';

interface KPIStatusPanelProps {
  personaId: string;
}

// Mock current values - in production these would come from real-time metrics
const mockCurrentValues: Record<string, number> = {
  reject_rate: 2.3,
  fill_latency_ms: 45,
  balance_drift: 0.5,
  net_profit_min: 125,
  error_count: 3,
};

const trendIcons = {
  improving: <TrendingUp className="h-4 w-4 text-green-500" />,
  stable: <Minus className="h-4 w-4 text-muted-foreground" />,
  degrading: <TrendingDown className="h-4 w-4 text-destructive" />,
};

export function KPIStatusPanel({ personaId }: KPIStatusPanelProps) {
  const { data: thresholds, isLoading } = useKPIThresholds(personaId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KPI Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const getStatus = (
    value: number,
    warning: number | null,
    critical: number | null,
    direction: string | null
  ): 'healthy' | 'warning' | 'critical' => {
    if (!warning || !critical) return 'healthy';
    
    if (direction === 'above') {
      if (value >= critical) return 'critical';
      if (value >= warning) return 'warning';
    } else {
      if (value <= critical) return 'critical';
      if (value <= warning) return 'warning';
    }
    return 'healthy';
  };

  const getProgress = (
    value: number,
    warning: number | null,
    critical: number | null,
    direction: string | null
  ): number => {
    if (!warning || !critical) return 50;
    
    const range = Math.abs(critical - (direction === 'above' ? 0 : critical * 2));
    const position = direction === 'above' 
      ? (value / critical) * 100 
      : ((critical * 2 - value) / (critical * 2)) * 100;
    
    return Math.min(100, Math.max(0, position));
  };

  const statusIcons = {
    healthy: <CheckCircle className="h-5 w-5 text-green-500" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
    critical: <AlertTriangle className="h-5 w-5 text-destructive" />,
  };

  const statusColors = {
    healthy: 'bg-green-500',
    warning: 'bg-amber-500',
    critical: 'bg-destructive',
  };

  // Mock trend calculation
  const getTrend = (metric: string): 'improving' | 'stable' | 'degrading' => {
    const trends: Record<string, 'improving' | 'stable' | 'degrading'> = {
      reject_rate: 'improving',
      fill_latency_ms: 'stable',
      balance_drift: 'improving',
      net_profit_min: 'improving',
      error_count: 'degrading',
    };
    return trends[metric] || 'stable';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          KPI Thresholds & Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!thresholds || thresholds.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No KPI thresholds configured for this persona.
          </p>
        ) : (
          <div className="space-y-6">
            {thresholds.map(threshold => {
              const currentValue = mockCurrentValues[threshold.metric_name] || 0;
              const status = getStatus(
                currentValue,
                threshold.warning_threshold,
                threshold.critical_threshold,
                threshold.direction
              );
              const progress = getProgress(
                currentValue,
                threshold.warning_threshold,
                threshold.critical_threshold,
                threshold.direction
              );
              const trend = getTrend(threshold.metric_name);

              return (
                <div key={threshold.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {statusIcons[status]}
                      <span className="font-medium capitalize">
                        {threshold.metric_name.replace(/_/g, ' ')}
                      </span>
                      {trendIcons[trend]}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold">{currentValue}</span>
                      <Badge variant={status === 'healthy' ? 'default' : 'destructive'}>
                        {status}
                      </Badge>
                    </div>
                  </div>

                  <div className="relative">
                    <Progress 
                      value={progress} 
                      className={`h-2 ${statusColors[status]}`}
                    />
                    {/* Threshold markers */}
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0</span>
                      <span className="text-amber-500">
                        Warning: {threshold.warning_threshold}
                      </span>
                      <span className="text-destructive">
                        Critical: {threshold.critical_threshold}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Direction: {threshold.direction}</span>
                    <span>
                      Auto-rollback: {threshold.auto_rollback ? 'Enabled' : 'Disabled'}
                    </span>
                    {threshold.notification_channels && (
                      <span>
                        Notifications: {threshold.notification_channels.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
