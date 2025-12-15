import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { YouTubeVideoIdea } from "@/types/streamengine";
import { Lightbulb, TrendingUp, Calendar, Check } from "lucide-react";
import { usePromoteIdea } from "@/hooks/useStreamEngineFeatures";

interface VideoIdeaCardProps {
  idea: YouTubeVideoIdea;
}

export function VideoIdeaCard({ idea }: VideoIdeaCardProps) {
  const promoteIdea = usePromoteIdea();

  const handlePromote = () => {
    promoteIdea.mutate(idea.id);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <CardTitle className="text-base">{idea.title}</CardTitle>
          </div>
          <Badge variant={idea.score > 70 ? 'default' : 'secondary'}>{idea.score}% score</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {idea.description && <p className="text-sm text-muted-foreground line-clamp-3">{idea.description}</p>}
        <div className="flex items-center gap-4 mt-3 text-sm">
          {idea.estimatedViews && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              {(idea.estimatedViews / 1000).toFixed(0)}K est.
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="text-xs">Trend:</span>
            <span className={idea.trendRelevance > 70 ? 'text-green-500' : 'text-muted-foreground'}>{idea.trendRelevance}%</span>
          </div>
        </div>
        {idea.tags && idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {idea.tags.slice(0, 3).map((tag) => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <Button size="sm" className="w-full" onClick={handlePromote} disabled={promoteIdea.isPending || idea.promotedToCalendar}>
          {idea.promotedToCalendar ? <><Check className="h-4 w-4 mr-1" />Added to Calendar</> : <><Calendar className="h-4 w-4 mr-1" />Add to Calendar</>}
        </Button>
      </CardFooter>
    </Card>
  );
}
