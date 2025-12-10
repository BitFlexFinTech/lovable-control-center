import { useMemo } from 'react';
import { Activity, Globe, User, Shield, Settings, FileText, Trash2, Clock } from 'lucide-react';
import { useAuditLogs } from '@/hooks/useSupabaseQuery';
import { useTimeAgo } from '@/hooks/useTimeAgo';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const ACTION_ICONS: Record<string, typeof Activity> = {
  create: FileText,
  update: Settings,
  delete: Trash2,
  login: User,
  impersonation_started: Shield,
  impersonation_ended: Shield,
  default: Activity,
};

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-status-active text-white',
  update: 'bg-primary text-primary-foreground',
  delete: 'bg-status-error text-white',
  login: 'bg-blue-500 text-white',
  impersonation_started: 'bg-amber-500 text-white',
  impersonation_ended: 'bg-amber-500 text-white',
  default: 'bg-muted text-muted-foreground',
};

interface TimelineItemProps {
  log: any;
  isLast: boolean;
}

const TimelineItem = ({ log, isLast }: TimelineItemProps) => {
  const timeAgo = useTimeAgo(log.created_at);
  const actionType = log.action.split('_')[0] || 'default';
  const Icon = ACTION_ICONS[actionType] || ACTION_ICONS.default;
  const colorClass = ACTION_COLORS[log.action] || ACTION_COLORS[actionType] || ACTION_COLORS.default;

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="flex gap-4">
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center">
        <div className={cn("p-2 rounded-full z-10", colorClass)}>
          <Icon className="h-4 w-4" />
        </div>
        {!isLast && (
          <div className="w-0.5 h-full bg-border flex-1 my-1" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">{formatAction(log.action)}</p>
            <p className="text-sm text-muted-foreground">
              {log.resource}
              {log.details?.name && ` • ${log.details.name}`}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </div>
        </div>
        
        {log.details && Object.keys(log.details).length > 0 && (
          <div className="mt-2 p-3 rounded-lg bg-muted/50 text-xs">
            <pre className="whitespace-pre-wrap text-muted-foreground">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export const AuditTimeline = () => {
  const { data, isLoading } = useAuditLogs(50);

  const logs = useMemo(() => {
    return data?.pages.flatMap(page => page.data) || [];
  }, [data]);

  // Group logs by date
  const groupedLogs = useMemo(() => {
    const groups: Record<string, typeof logs> = {};
    
    logs.forEach(log => {
      const date = format(new Date(log.created_at), 'MMMM d, yyyy');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(log);
    });
    
    return groups;
  }, [logs]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Activity className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No Activity Yet</p>
        <p className="text-sm">Actions will appear here as they happen</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedLogs).map(([date, dateLogs]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-muted-foreground mb-4 sticky top-0 bg-background py-2">
            {date}
          </h3>
          <div>
            {dateLogs.map((log, index) => (
              <TimelineItem 
                key={log.id} 
                log={log} 
                isLast={index === dateLogs.length - 1} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};