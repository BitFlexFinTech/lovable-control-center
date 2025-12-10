import { ExternalLink, Settings, LayoutDashboard } from 'lucide-react';
import { Site } from '@/types';
import { StatusPill } from './StatusPill';
import { Sparkline } from './Sparkline';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SiteCardProps {
  site: Site;
  className?: string;
  delay?: number;
}

export function SiteCard({ site, className, delay = 0 }: SiteCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-xl bg-card border border-border p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-card opacity-0 animate-slide-up",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">{site.name}</h3>
            <StatusPill status={site.status} />
          </div>
          <p className="text-sm text-muted-foreground truncate">{site.url}</p>
        </div>
        <Sparkline 
          data={site.sparklineData} 
          color={site.status === 'warning' ? 'hsl(var(--status-warning))' : 'hsl(var(--primary))'}
        />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Traffic</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-semibold">{formatNumber(site.metrics.traffic)}</span>
            <span className={cn(
              "text-xs font-medium",
              site.metrics.trafficChange >= 0 ? "text-status-active" : "text-status-inactive"
            )}>
              {site.metrics.trafficChange >= 0 ? '+' : ''}{site.metrics.trafficChange}%
            </span>
          </div>
        </div>
        {site.metrics.orders > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Orders</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-semibold">{site.metrics.orders}</span>
              <span className={cn(
                "text-xs font-medium",
                site.metrics.ordersChange >= 0 ? "text-status-active" : "text-status-inactive"
              )}>
                {site.metrics.ordersChange >= 0 ? '+' : ''}{site.metrics.ordersChange}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Health info */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pb-4 border-b border-border">
        <span>Uptime: {site.healthCheck.uptime}%</span>
        <span>Response: {site.healthCheck.responseTime}ms</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="subtle" size="sm" className="flex-1 gap-1.5">
          <LayoutDashboard className="h-3.5 w-3.5" />
          Overview
        </Button>
        <Button variant="ghost" size="icon-sm">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" asChild>
          <a href={site.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
