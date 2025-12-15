import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TimelineEvent } from "@/types/quantops";
import { useRollbackEvent } from "@/hooks/useQuantOps";
import { 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  GitCommit, 
  ExternalLink,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TimelineEventCardProps {
  event: TimelineEvent;
}

export function TimelineEventCard({ event }: TimelineEventCardProps) {
  const rollback = useRollbackEvent();

  const getStatusIcon = () => {
    switch (event.type) {
      case 'applied': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'rolled_back': return <RotateCcw className="h-5 w-5 text-yellow-500" />;
      default: return null;
    }
  };

  const getStatusColor = () => {
    switch (event.type) {
      case 'applied': return 'default';
      case 'failed': return 'destructive';
      case 'rolled_back': return 'secondary';
      default: return 'secondary';
    }
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'live': return 'destructive';
      case 'canary': return 'secondary';
      case 'paper': return 'outline';
      case 'demo': return 'outline';
      default: return 'secondary';
    }
  };

  const handleRollback = () => {
    rollback.mutate(event.id);
  };

  return (
    <div className="relative">
      <div className="absolute -left-10 top-3 flex items-center justify-center w-5">
        {getStatusIcon()}
      </div>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{event.cardTitle}</h4>
                <Badge variant={getStatusColor()}>
                  {event.type.replace('_', ' ')}
                </Badge>
                <Badge variant={getEnvironmentColor(event.environment)}>
                  {event.environment}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
              </p>
            </div>

            {event.type === 'applied' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleRollback}
                disabled={rollback.isPending}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Rollback
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            {event.commitSha && (
              <div className="flex items-center gap-1">
                <GitCommit className="h-3 w-3" />
                <code className="text-xs">{event.commitSha.slice(0, 7)}</code>
              </div>
            )}
            {event.prUrl && (
              <a 
                href={event.prUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary"
              >
                <ExternalLink className="h-3 w-3" />
                View PR
              </a>
            )}
            {event.buildId && (
              <span>Build: {event.buildId}</span>
            )}
          </div>

          {event.errorSummary && (
            <div className="mt-3 p-2 bg-destructive/10 rounded text-sm text-destructive">
              {event.errorSummary}
            </div>
          )}

          {event.metrics && (
            <div className="mt-3 grid grid-cols-4 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Reject Rate</p>
                <p className="font-mono">{event.metrics.rejectRate}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Latency</p>
                <p className="font-mono">{event.metrics.fillLatencyMs}ms</p>
              </div>
              <div>
                <p className="text-muted-foreground">Balance Drift</p>
                <p className="font-mono">{event.metrics.balanceDrift}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Net Profit/min</p>
                <p className="font-mono">${event.metrics.netProfitMin}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
