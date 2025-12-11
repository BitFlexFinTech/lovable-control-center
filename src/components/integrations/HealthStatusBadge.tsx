import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { IntegrationHealthStatus } from '@/types/integrationHealth';

interface HealthStatusBadgeProps {
  status: IntegrationHealthStatus | null;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  healthy: {
    icon: CheckCircle,
    label: 'Healthy',
    className: 'text-status-active',
    bgClassName: 'bg-status-active/10',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    className: 'text-status-warning',
    bgClassName: 'bg-status-warning/10',
  },
  error: {
    icon: XCircle,
    label: 'Error',
    className: 'text-status-error',
    bgClassName: 'bg-status-error/10',
  },
  unknown: {
    icon: HelpCircle,
    label: 'Unknown',
    className: 'text-muted-foreground',
    bgClassName: 'bg-muted',
  },
};

const sizeConfig = {
  sm: { icon: 'h-3 w-3', text: 'text-xs', padding: 'px-1.5 py-0.5' },
  md: { icon: 'h-4 w-4', text: 'text-sm', padding: 'px-2 py-1' },
  lg: { icon: 'h-5 w-5', text: 'text-base', padding: 'px-3 py-1.5' },
};

export function HealthStatusBadge({ status, showLabel = false, size = 'md' }: HealthStatusBadgeProps) {
  const statusKey = status?.status || 'unknown';
  const config = statusConfig[statusKey];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  const badge = (
    <div className={cn(
      'inline-flex items-center gap-1 rounded-full',
      config.bgClassName,
      sizes.padding
    )}>
      <Icon className={cn(sizes.icon, config.className)} />
      {showLabel && (
        <span className={cn(sizes.text, config.className, 'font-medium')}>
          {config.label}
        </span>
      )}
    </div>
  );

  if (!showLabel && status) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">{config.label}</p>
            {status.lastChecked && (
              <p className="text-muted-foreground">
                Last checked: {new Date(status.lastChecked).toLocaleTimeString()}
              </p>
            )}
            {status.error && (
              <p className="text-status-error mt-1">{status.error.message}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return badge;
}
