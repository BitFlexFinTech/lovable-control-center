import { useState, useMemo } from 'react';
import { Search, Filter, Download, Calendar, User, Activity, ChevronDown } from 'lucide-react';
import { useAuditLogs } from '@/hooks/useSupabaseQuery';
import { useTimeAgo } from '@/hooks/useTimeAgo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-status-active/10 text-status-active border-status-active/20',
  update: 'bg-primary/10 text-primary border-primary/20',
  delete: 'bg-status-error/10 text-status-error border-status-error/20',
  login: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  impersonation_started: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  impersonation_ended: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

const RESOURCES = ['sites', 'tenants', 'users', 'roles', 'integrations', 'audit_logs', 'admin_impersonation_sessions'];
const ACTIONS = ['create', 'update', 'delete', 'login', 'impersonation_started', 'impersonation_ended'];

interface AuditFilters {
  search: string;
  action: string;
  resource: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

const AuditLogRow = ({ log }: { log: any }) => {
  const timeAgo = useTimeAgo(log.created_at);
  const actionType = log.action.split('_')[0];
  
  return (
    <div className="flex items-center gap-4 py-3 px-4 border-b border-border/50 hover:bg-muted/30 transition-colors">
      <div className="w-32 shrink-0">
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
      </div>
      <div className="w-40 shrink-0">
        <Badge variant="outline" className={cn("text-xs", ACTION_COLORS[log.action] || ACTION_COLORS[actionType])}>
          {log.action.replace(/_/g, ' ')}
        </Badge>
      </div>
      <div className="w-32 shrink-0">
        <span className="text-sm">{log.resource}</span>
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm text-muted-foreground truncate block">
          {log.details ? JSON.stringify(log.details).slice(0, 50) : '-'}
        </span>
      </div>
    </div>
  );
};

export const AdvancedAuditViewer = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useAuditLogs();
  const [filters, setFilters] = useState<AuditFilters>({
    search: '',
    action: '',
    resource: '',
    dateFrom: undefined,
    dateTo: undefined,
  });

  const allLogs = useMemo(() => {
    return data?.pages.flatMap(page => page.data) || [];
  }, [data]);

  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      if (filters.search && !JSON.stringify(log).toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.action && log.action !== filters.action) return false;
      if (filters.resource && log.resource !== filters.resource) return false;
      if (filters.dateFrom && new Date(log.created_at) < filters.dateFrom) return false;
      if (filters.dateTo && new Date(log.created_at) > filters.dateTo) return false;
      return true;
    });
  }, [allLogs, filters]);

  const exportToCsv = () => {
    const headers = ['Timestamp', 'Action', 'Resource', 'User ID', 'Details'];
    const rows = filteredLogs.map(log => [
      log.created_at,
      log.action,
      log.resource,
      log.user_id || '',
      JSON.stringify(log.details || {}),
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            className="pl-9"
          />
        </div>

        <Select value={filters.action} onValueChange={(v) => setFilters(f => ({ ...f, action: v }))}>
          <SelectTrigger className="w-[150px]">
            <Activity className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Actions</SelectItem>
            {ACTIONS.map(action => (
              <SelectItem key={action} value={action}>{action.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.resource} onValueChange={(v) => setFilters(f => ({ ...f, resource: v }))}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Resource" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Resources</SelectItem>
            {RESOURCES.map(resource => (
              <SelectItem key={resource} value={resource}>{resource}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Calendar className="h-4 w-4" />
              {filters.dateFrom ? format(filters.dateFrom, 'MMM d') : 'From'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={filters.dateFrom}
              onSelect={(date) => setFilters(f => ({ ...f, dateFrom: date }))}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Calendar className="h-4 w-4" />
              {filters.dateTo ? format(filters.dateTo, 'MMM d') : 'To'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={filters.dateTo}
              onSelect={(date) => setFilters(f => ({ ...f, dateTo: date }))}
            />
          </PopoverContent>
        </Popover>

        <Button variant="outline" size="sm" onClick={exportToCsv} className="gap-1.5 ml-auto">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{filteredLogs.length} logs found</span>
        {(filters.action || filters.resource || filters.dateFrom || filters.dateTo) && (
          <Button variant="ghost" size="sm" onClick={() => setFilters({ search: '', action: '', resource: '', dateFrom: undefined, dateTo: undefined })}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Logs table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-4 py-2 px-4 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground">
          <div className="w-32">Time</div>
          <div className="w-40">Action</div>
          <div className="w-32">Resource</div>
          <div className="flex-1">Details</div>
        </div>
        
        <ScrollArea className="h-[500px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              Loading...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No logs found
            </div>
          ) : (
            <>
              {filteredLogs.map((log) => (
                <AuditLogRow key={log.id} log={log} />
              ))}
              {hasNextPage && (
                <div className="p-4 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};