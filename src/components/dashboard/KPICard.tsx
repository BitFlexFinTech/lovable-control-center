import { TrendingUp, TrendingDown, Minus, ShoppingCart, FileText, Activity } from 'lucide-react';
import { KPI } from '@/types';
import { cn } from '@/lib/utils';

interface KPICardProps {
  kpi: KPI;
  className?: string;
  delay?: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp,
  ShoppingCart,
  FileText,
  Activity,
};

export function KPICard({ kpi, className, delay = 0 }: KPICardProps) {
  const Icon = iconMap[kpi.icon] || TrendingUp;
  const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;

  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-xl bg-card border border-border p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-card opacity-0 animate-slide-up",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{kpi.label}</p>
          <p className="text-2xl font-semibold tracking-tight">{kpi.value}</p>
        </div>
        <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      <div className="relative mt-4 flex items-center gap-1.5">
        <span className={cn(
          "flex items-center gap-0.5 text-sm font-medium",
          kpi.trend === 'up' && "text-status-active",
          kpi.trend === 'down' && "text-status-inactive",
          kpi.trend === 'neutral' && "text-muted-foreground"
        )}>
          <TrendIcon className="h-3.5 w-3.5" />
          {Math.abs(kpi.change)}%
        </span>
        <span className="text-xs text-muted-foreground">vs last period</span>
      </div>
    </div>
  );
}
