import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Building2,
  Terminal 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  siteId?: string;
  siteName?: string;
}

interface SiteProgressItem {
  siteId: string;
  siteName: string;
  siteColor: string;
  isControlCenter: boolean;
  status: 'pending' | 'running' | 'complete' | 'error';
  progress: number;
  currentAction?: string;
}

interface RealTimeProgressPanelProps {
  sites: SiteProgressItem[];
  logs: ProgressLog[];
  overallProgress: number;
  currentPhase: string;
}

export function RealTimeProgressPanel({
  sites,
  logs,
  overallProgress,
  currentPhase,
}: RealTimeProgressPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Main Progress */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            {currentPhase}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          {/* Per-Site Progress */}
          <div className="space-y-3">
            {sites.map((site) => (
              <div 
                key={site.siteId}
                className={cn(
                  "p-3 rounded-lg border transition-colors",
                  site.status === 'running' && "bg-primary/5 border-primary/30",
                  site.status === 'complete' && "bg-green-500/5 border-green-500/30",
                  site.status === 'error' && "bg-red-500/5 border-red-500/30",
                  site.status === 'pending' && "opacity-50"
                )}
                style={{ borderLeftWidth: '3px', borderLeftColor: site.siteColor }}
              >
                <div className="flex items-center gap-3">
                  {site.isControlCenter ? (
                    <Building2 className="h-4 w-4" style={{ color: site.siteColor }} />
                  ) : (
                    <div 
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: site.siteColor }}
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{site.siteName}</span>
                      {site.status === 'running' && (
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      )}
                      {site.status === 'complete' && (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      )}
                      {site.status === 'error' && (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                    {site.currentAction && site.status === 'running' && (
                      <p className="text-xs text-muted-foreground truncate">
                        {site.currentAction}
                      </p>
                    )}
                  </div>

                  <div className="w-20">
                    <Progress value={site.progress} className="h-1.5" />
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {Math.round(site.progress)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Logs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Terminal className="h-4 w-4" />
            Live Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2 font-mono text-xs">
              {logs.map((log, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "p-2 rounded",
                    log.type === 'success' && "bg-green-500/10 text-green-600",
                    log.type === 'error' && "bg-red-500/10 text-red-500",
                    log.type === 'warning' && "bg-yellow-500/10 text-yellow-600",
                    log.type === 'info' && "bg-muted"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{log.timestamp}</span>
                    {log.siteName && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                        {log.siteName}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5">{log.message}</p>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Waiting for logs...
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
