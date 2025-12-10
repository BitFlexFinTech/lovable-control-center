import { useEffect, useState } from 'react';
import { Activity, Globe, User, Shield, Settings, Mail, FileText, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTimeAgo } from '@/hooks/useTimeAgo';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActivityEvent {
  id: string;
  action: string;
  resource: string;
  user_id: string | null;
  created_at: string;
  details: Record<string, any> | null;
}

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
  create: 'text-status-active bg-status-active/10',
  update: 'text-primary bg-primary/10',
  delete: 'text-status-error bg-status-error/10',
  login: 'text-blue-500 bg-blue-500/10',
  impersonation_started: 'text-amber-500 bg-amber-500/10',
  impersonation_ended: 'text-amber-500 bg-amber-500/10',
  default: 'text-muted-foreground bg-muted',
};

const ActivityItem = ({ event }: { event: ActivityEvent }) => {
  const timeAgo = useTimeAgo(event.created_at);
  const actionType = event.action.split('_')[0] || 'default';
  const Icon = ACTION_ICONS[actionType] || ACTION_ICONS.default;
  const colorClass = ACTION_COLORS[event.action] || ACTION_COLORS[actionType] || ACTION_COLORS.default;

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
      <div className={cn("p-2 rounded-lg shrink-0", colorClass)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {formatAction(event.action)}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {event.resource}
          {event.details?.name && ` • ${event.details.name}`}
        </p>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">
        {timeAgo}
      </span>
    </div>
  );
};

export const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Fetch initial activities
    const fetchActivities = async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) {
        setActivities(data.map(log => ({
          id: log.id,
          action: log.action,
          resource: log.resource,
          user_id: log.user_id,
          created_at: log.created_at,
          details: log.details as Record<string, any> | null,
        })));
      }
    };

    fetchActivities();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('audit_logs_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs',
        },
        (payload) => {
          const newLog = payload.new as any;
          setActivities((prev) => [{
            id: newLog.id,
            action: newLog.action,
            resource: newLog.resource,
            user_id: newLog.user_id,
            created_at: newLog.created_at,
            details: newLog.details,
          }, ...prev.slice(0, 19)]);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Live Activity</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "h-2 w-2 rounded-full",
            isConnected ? "bg-status-active animate-pulse" : "bg-muted"
          )} />
          <span className="text-xs text-muted-foreground">
            {isConnected ? 'Live' : 'Connecting...'}
          </span>
        </div>
      </div>

      <ScrollArea className="h-[300px]">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Activity className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No activity yet</p>
          </div>
        ) : (
          activities.map((event) => (
            <ActivityItem key={event.id} event={event} />
          ))
        )}
      </ScrollArea>
    </div>
  );
};