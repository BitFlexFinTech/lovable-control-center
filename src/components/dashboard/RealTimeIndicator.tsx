import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RealTimeIndicatorProps {
  isConnected?: boolean;
  lastUpdate?: string | null;
  className?: string;
}

export function RealTimeIndicator({ 
  isConnected = true, 
  lastUpdate,
  className 
}: RealTimeIndicatorProps) {
  const [pulse, setPulse] = useState(false);

  // Trigger pulse animation on updates
  useEffect(() => {
    if (lastUpdate) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [lastUpdate]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all",
        isConnected 
          ? "bg-status-active/10 text-status-active" 
          : "bg-muted text-muted-foreground"
      )}>
        {isConnected ? (
          <>
            <Wifi className={cn("h-3 w-3", pulse && "animate-pulse")} />
            <span>Live</span>
            {pulse && <Zap className="h-3 w-3 animate-bounce" />}
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span>Offline</span>
          </>
        )}
      </div>
      {lastUpdate && isConnected && (
        <span className="text-xs text-muted-foreground">
          {new Date(lastUpdate).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

// Activity Feed Component
interface ActivityItem {
  id: string;
  type: 'health' | 'backup' | 'deploy' | 'alert' | 'user';
  message: string;
  timestamp: string;
}

export function RealTimeActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'health',
      message: 'Health check passed for techstore.io',
      timestamp: new Date(Date.now() - 30000).toISOString(),
    },
    {
      id: '2',
      type: 'backup',
      message: 'Incremental backup completed',
      timestamp: new Date(Date.now() - 120000).toISOString(),
    },
    {
      id: '3',
      type: 'user',
      message: 'New user registered on blogplatform.co',
      timestamp: new Date(Date.now() - 300000).toISOString(),
    },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const types: ActivityItem['type'][] = ['health', 'backup', 'deploy', 'alert', 'user'];
      const messages = {
        health: 'Health check passed for site',
        backup: 'Backup operation completed',
        deploy: 'Deployment successful',
        alert: 'Alert resolved automatically',
        user: 'User action recorded',
      };

      const type = types[Math.floor(Math.random() * types.length)];
      
      if (Math.random() > 0.7) {
        const newActivity: ActivityItem = {
          id: `activity-${Date.now()}`,
          type,
          message: messages[type],
          timestamp: new Date().toISOString(),
        };
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'health':
        return <Activity className="h-3 w-3 text-status-active" />;
      case 'backup':
        return <Activity className="h-3 w-3 text-primary" />;
      case 'deploy':
        return <Zap className="h-3 w-3 text-status-warning" />;
      case 'alert':
        return <Activity className="h-3 w-3 text-status-warning" />;
      case 'user':
        return <Activity className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  return (
    <div className="space-y-2">
      {activities.map((activity, index) => (
        <div
          key={activity.id}
          className={cn(
            "flex items-center gap-2 text-xs p-2 rounded-lg bg-muted/50 transition-all",
            index === 0 && "animate-fade-in bg-primary/5"
          )}
        >
          {getIcon(activity.type)}
          <span className="flex-1 truncate">{activity.message}</span>
          <span className="text-muted-foreground whitespace-nowrap">
            {formatTime(activity.timestamp)}
          </span>
        </div>
      ))}
    </div>
  );
}

// Live Metrics Component
interface LiveMetric {
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export function LiveMetrics() {
  const [metrics, setMetrics] = useState<LiveMetric[]>([
    { label: 'Active Users', value: 127, unit: '', trend: 'up', change: 12 },
    { label: 'Requests/min', value: 342, unit: '', trend: 'stable', change: 2 },
    { label: 'Avg Response', value: 145, unit: 'ms', trend: 'down', change: -8 },
    { label: 'Uptime', value: 99.98, unit: '%', trend: 'stable', change: 0 },
  ]);

  // Simulate metric updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        const change = (Math.random() - 0.5) * 10;
        const newValue = metric.label === 'Uptime' 
          ? Math.min(100, Math.max(99, metric.value + change * 0.01))
          : Math.max(0, metric.value + change);
        
        return {
          ...metric,
          value: Math.round(newValue * 100) / 100,
          trend: change > 2 ? 'up' : change < -2 ? 'down' : 'stable',
          change: Math.round(change),
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((metric) => (
        <div key={metric.label} className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold">{metric.value}</span>
            <span className="text-xs text-muted-foreground">{metric.unit}</span>
            {metric.change !== 0 && (
              <span className={cn(
                "text-xs ml-auto",
                metric.trend === 'up' && "text-status-active",
                metric.trend === 'down' && metric.label !== 'Avg Response' && "text-status-inactive",
                metric.trend === 'down' && metric.label === 'Avg Response' && "text-status-active"
              )}>
                {metric.change > 0 ? '+' : ''}{metric.change}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
