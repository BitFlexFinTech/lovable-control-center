import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle, 
  XCircle, 
  Undo2, 
  Clock, 
  GitCommit,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ApplyEvent } from '@/types/quantops';

interface ApplyTimelineProps {
  events: ApplyEvent[];
  isLoading: boolean;
}

const resultIcons = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  failed: <XCircle className="h-5 w-5 text-destructive" />,
  rolled_back: <Undo2 className="h-5 w-5 text-amber-500" />,
  pending: <Clock className="h-5 w-5 text-muted-foreground" />,
};

const resultColors = {
  success: 'border-green-500 bg-green-500/10',
  failed: 'border-destructive bg-destructive/10',
  rolled_back: 'border-amber-500 bg-amber-500/10',
  pending: 'border-muted bg-muted',
};

const envBadges = {
  demo: 'bg-blue-500/10 text-blue-500',
  paper: 'bg-purple-500/10 text-purple-500',
  canary: 'bg-amber-500/10 text-amber-500',
  live: 'bg-green-500/10 text-green-500',
};

export function ApplyTimeline({ events, isLoading }: ApplyTimelineProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Apply Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCommit className="h-5 w-5" />
          Apply Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No apply events yet. Apply a recommendation to see the timeline.
          </p>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
            
            <div className="space-y-6">
              {events.map((event, index) => (
                <div key={event.id} className="relative pl-14">
                  {/* Timeline dot */}
                  <div className={`absolute left-4 -translate-x-1/2 w-5 h-5 rounded-full border-2 ${resultColors[event.result]}`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {resultIcons[event.result]}
                    </div>
                  </div>

                  <Card className={`border-l-4 ${
                    event.result === 'success' ? 'border-l-green-500' :
                    event.result === 'failed' ? 'border-l-destructive' :
                    event.result === 'rolled_back' ? 'border-l-amber-500' :
                    'border-l-muted'
                  }`}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={envBadges[event.environment]}>
                              {event.environment}
                            </Badge>
                            <Badge variant="outline">
                              {event.result}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              by {event.actorRole}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      {/* Commit info */}
                      {event.commitSha && (
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <GitCommit className="h-4 w-4 text-muted-foreground" />
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {event.commitSha.slice(0, 7)}
                          </code>
                          {event.prUrl && (
                            <a 
                              href={event.prUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              PR #{event.prNumber}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      )}

                      {/* Duration */}
                      {event.durationMs && (
                        <div className="text-sm text-muted-foreground mb-2">
                          Duration: {(event.durationMs / 1000).toFixed(2)}s
                        </div>
                      )}

                      {/* Error summary */}
                      {event.errorSummary && (
                        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm mt-2">
                          {event.errorSummary}
                        </div>
                      )}

                      {/* Breached thresholds */}
                      {event.breachedThresholds.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-amber-500 mb-1">
                            Breached Thresholds:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {event.breachedThresholds.map((breach, i) => (
                              <Badge key={i} variant="outline" className="text-amber-500">
                                {breach.metric}: {breach.value} ({breach.severity})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tests */}
                      {event.testsPassed !== undefined && (
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          {event.testsPassed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                          <span>Tests {event.testsPassed ? 'passed' : 'failed'}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
