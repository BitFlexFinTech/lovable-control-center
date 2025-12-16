import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useChannelHealth } from '@/hooks/useStreamEngineFeatures';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Users,
  Eye,
  Clock,
  ThumbsUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChannelHealthPanelProps {
  channelId: string;
}

export function ChannelHealthPanel({ channelId }: ChannelHealthPanelProps) {
  const { data: health, isLoading } = useChannelHealth(channelId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!health) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No health data available for this channel yet.
        </CardContent>
      </Card>
    );
  }

  const healthScore = health.overallScore || 0;
  const healthStatus = healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical';

  const statusColors = {
    healthy: 'text-green-500 bg-green-500/10',
    warning: 'text-amber-500 bg-amber-500/10',
    critical: 'text-destructive bg-destructive/10',
  };

  const metrics = [
    {
      label: 'SEO Score',
      value: health.seoScore || 0,
      icon: TrendingUp,
      trend: health.seoScore > 70 ? 'up' : 'down',
    },
    {
      label: 'Audience Score',
      value: health.audienceScore || 0,
      icon: Users,
      trend: health.audienceScore > 70 ? 'up' : 'stable',
    },
    {
      label: 'Engagement Score',
      value: health.engagementScore || 0,
      icon: ThumbsUp,
      trend: health.engagementScore > 60 ? 'up' : 'down',
    },
    {
      label: 'Growth Score',
      value: health.growthScore || 0,
      icon: Activity,
      trend: health.growthScore > 50 ? 'up' : 'stable',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card className={statusColors[healthStatus]}>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {healthStatus === 'healthy' ? (
                <CheckCircle className="h-12 w-12" />
              ) : (
                <AlertTriangle className="h-12 w-12" />
              )}
              <div>
                <h3 className="text-2xl font-bold">Channel Health Score</h3>
                <p className="text-sm opacity-80">
                  Grade: {health.overallGrade || 'N/A'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold">{healthScore}</p>
              <Badge variant="outline" className="mt-1">
                {healthStatus.toUpperCase()}
              </Badge>
            </div>
          </div>
          <Progress value={healthScore} className="mt-4 h-3" />
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {metrics.map(metric => (
          <Card key={metric.label}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <metric.icon className="h-4 w-4" />
                  <span className="text-sm">{metric.label}</span>
                </div>
                {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                {metric.trend === 'down' && <TrendingDown className="h-4 w-4 text-destructive" />}
              </div>
              <p className="text-2xl font-bold">{metric.value}/100</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      {health.recommendations && health.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {health.recommendations.map((rec, i) => (
                <li key={rec.id || i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <span className="font-medium">{rec.title}</span>
                    <p className="text-muted-foreground">{rec.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Quick Wins */}
      {health.quickWins && health.quickWins.length > 0 && (
        <Card className="border-amber-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <Clock className="h-5 w-5" />
              Quick Wins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {health.quickWins.map((win, i) => (
                <li key={win.id || i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div>
                    <span className="font-medium">{win.title}</span>
                    <p className="text-muted-foreground">{win.description}</p>
                    <span className="text-xs text-amber-500">{win.timeToComplete}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
