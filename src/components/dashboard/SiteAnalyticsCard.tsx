import { TrendingUp, TrendingDown, ShoppingCart, Activity, Eye, MoreHorizontal, Sparkles } from 'lucide-react';
import { Site, AISuggestion } from '@/types';
import { Sparkline } from './Sparkline';
import { StatusPill } from './StatusPill';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SiteAnalyticsCardProps {
  site: Site;
  suggestions?: AISuggestion[];
  onViewSuggestions?: (siteId: string) => void;
  delay?: number;
}

export function SiteAnalyticsCard({ site, suggestions = [], onViewSuggestions, delay = 0 }: SiteAnalyticsCardProps) {
  const isDemo = site.demoMode?.isDemo !== false;
  const pendingSuggestions = suggestions.filter(s => s.status === 'pending').length;

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div 
      className="rounded-xl border border-border bg-card p-5 opacity-0 animate-slide-up hover:border-primary/30 transition-colors"
      style={{ animationDelay: `${delay}ms`, borderLeftColor: site.appColor, borderLeftWidth: '3px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
            style={{ backgroundColor: `${site.appColor}20` }}
          >
            {site.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold">{site.name}</h3>
            <p className="text-xs text-muted-foreground truncate max-w-[180px]">{site.domain || site.url}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDemo ? (
            <Badge className="bg-status-warning/20 text-status-warning border-status-warning/30 text-xs">
              Sandbox
            </Badge>
          ) : (
            <Badge className="bg-status-active/20 text-status-active border-status-active/30 text-xs">
              Live
            </Badge>
          )}
          <StatusPill status={site.status} />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            Traffic
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold">{formatNumber(site.metrics.traffic)}</span>
            <div className={cn(
              "flex items-center gap-0.5 text-xs",
              site.metrics.trafficChange >= 0 ? "text-status-active" : "text-status-inactive"
            )}>
              {site.metrics.trafficChange >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(site.metrics.trafficChange)}%
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ShoppingCart className="h-3 w-3" />
            Orders
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold">{site.metrics.orders || '—'}</span>
            {site.metrics.orders > 0 && (
              <div className={cn(
                "flex items-center gap-0.5 text-xs",
                site.metrics.ordersChange >= 0 ? "text-status-active" : "text-status-inactive"
              )}>
                {site.metrics.ordersChange >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(site.metrics.ordersChange)}%
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Activity className="h-3 w-3" />
            Uptime
          </div>
          <span className={cn(
            "text-xl font-semibold",
            site.healthCheck.uptime >= 99.5 ? "text-status-active" : 
            site.healthCheck.uptime >= 98 ? "text-status-warning" : "text-status-inactive"
          )}>
            {site.healthCheck.uptime}%
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            Response
          </div>
          <span className={cn(
            "text-xl font-semibold",
            site.healthCheck.responseTime < 200 ? "text-status-active" :
            site.healthCheck.responseTime < 500 ? "text-status-warning" : "text-status-inactive"
          )}>
            {site.healthCheck.responseTime}ms
          </span>
        </div>
      </div>

      {/* Sparkline */}
      <div className="h-12 mb-4">
        <Sparkline data={site.sparklineData} color={site.appColor || 'hsl(var(--primary))'} />
      </div>

      {/* AI Suggestions */}
      {pendingSuggestions > 0 && (
        <div className="pt-4 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full justify-between h-auto py-2 px-3 hover:bg-primary/5"
            onClick={() => onViewSuggestions?.(site.id)}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm">{pendingSuggestions} AI suggestion{pendingSuggestions > 1 ? 's' : ''}</span>
            </div>
            <Badge variant="secondary" className="text-xs">{pendingSuggestions}</Badge>
          </Button>
        </div>
      )}
    </div>
  );
}