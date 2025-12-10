import { Badge } from '@/components/ui/badge';
import { SiteStatus } from '@/types';

interface StatusPillProps {
  status: SiteStatus;
}

const statusConfig = {
  active: {
    label: 'Active',
    variant: 'active' as const,
  },
  warning: {
    label: 'Warning',
    variant: 'warning' as const,
  },
  inactive: {
    label: 'Inactive',
    variant: 'inactive' as const,
  },
};

export function StatusPill({ status }: StatusPillProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className="gap-1.5">
      <span className="relative flex h-1.5 w-1.5">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
          status === 'active' ? 'bg-status-active' :
          status === 'warning' ? 'bg-status-warning' :
          'bg-status-inactive'
        }`} />
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
          status === 'active' ? 'bg-status-active' :
          status === 'warning' ? 'bg-status-warning' :
          'bg-status-inactive'
        }`} />
      </span>
      {config.label}
    </Badge>
  );
}
