import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useVideoIdeas, usePromoteIdea } from '@/hooks/useStreamEngineFeatures';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Lightbulb, 
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface VideoIdeasPanelProps {
  channelId: string;
}

const statusColors: Record<string, string> = {
  new: 'bg-purple-500/10 text-purple-500',
  researching: 'bg-blue-500/10 text-blue-500',
  scripting: 'bg-cyan-500/10 text-cyan-500',
  scheduled: 'bg-amber-500/10 text-amber-500',
  produced: 'bg-green-500/10 text-green-500',
  archived: 'bg-muted text-muted-foreground',
};

const sourceColors: Record<string, string> = {
  ai_generated: 'bg-primary/10 text-primary',
  trending: 'bg-red-500/10 text-red-500',
  audience_request: 'bg-green-500/10 text-green-500',
  competitor_analysis: 'bg-amber-500/10 text-amber-500',
  manual: 'bg-muted text-muted-foreground',
};

export function VideoIdeasPanel({ channelId }: VideoIdeasPanelProps) {
  const { data: ideas, isLoading } = useVideoIdeas(channelId);
  const promoteIdea = usePromoteIdea();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const activeIdeas = ideas?.filter(i => !['produced', 'archived'].includes(i.status || '')) || [];
  const sortedIdeas = [...activeIdeas].sort((a, b) => (b.score || 0) - (a.score || 0));

  const getNextStatus = (current: string): string => {
    const flow: Record<string, string> = {
      new: 'researching',
      researching: 'scripting',
      scripting: 'scheduled',
      scheduled: 'produced',
    };
    return flow[current] || current;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Lightbulb className="h-4 w-4" />
              <span className="text-sm">Total Ideas</span>
            </div>
            <p className="text-2xl font-bold">{ideas?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">AI Generated</span>
            </div>
            <p className="text-2xl font-bold">
              {ideas?.filter(i => i.source === 'ai_generated').length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Trending</span>
            </div>
            <p className="text-2xl font-bold">
              {ideas?.filter(i => i.source === 'trending').length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">In Pipeline</span>
            </div>
            <p className="text-2xl font-bold">{activeIdeas.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Ideas List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Video Ideas Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedIdeas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No video ideas yet. Ideas from AI analysis and trends will appear here.
            </p>
          ) : (
            <div className="space-y-4">
              {sortedIdeas.map(idea => (
                <Card key={idea.id} className="border-l-4 border-l-amber-500">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{idea.title}</h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={statusColors[idea.status || 'new']}>
                            {idea.status?.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className={sourceColors[idea.source || 'manual']}>
                            {idea.source?.replace('_', ' ')}
                          </Badge>
                          {idea.estimatedViews > 0 && (
                            <span className="text-xs text-muted-foreground">
                              Est. {idea.estimatedViews.toLocaleString()} views
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-500" />
                          <span className="font-bold">{idea.score || 0}</span>
                        </div>
                      </div>
                    </div>

                    {idea.description && (
                      <p className="text-sm text-muted-foreground mb-3">{idea.description}</p>
                    )}

                    {/* Tags */}
                    {idea.tags && idea.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {idea.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    {idea.status !== 'produced' && (
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => promoteIdea.mutate({
                            ideaId: idea.id,
                            newStatus: getNextStatus(idea.status || 'new')
                          })}
                          disabled={promoteIdea.isPending}
                        >
                          Move to {getNextStatus(idea.status || 'new').replace('_', ' ')}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
