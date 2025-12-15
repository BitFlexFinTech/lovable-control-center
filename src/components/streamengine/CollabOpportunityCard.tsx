import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { YouTubeCollaboration } from "@/types/streamengine";
import { Users, TrendingUp, Star, MessageSquare } from "lucide-react";

interface CollabOpportunityCardProps {
  collab: YouTubeCollaboration;
}

export function CollabOpportunityCard({ collab }: CollabOpportunityCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': case 'completed': return 'default';
      case 'discussing': case 'planning': return 'secondary';
      case 'discovered': case 'analyzing': case 'outreach': return 'outline';
      case 'declined': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {collab.partnerThumbnailUrl ? (
              <img src={collab.partnerThumbnailUrl} alt={collab.partnerChannelName} className="h-10 w-10 rounded-full" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center"><Users className="h-5 w-5 text-muted-foreground" /></div>
            )}
            <div>
              <CardTitle className="text-base">{collab.partnerChannelName}</CardTitle>
              <p className="text-xs text-muted-foreground">{formatNumber(collab.partnerSubscriberCount)} subscribers</p>
            </div>
          </div>
          <Badge variant={getStatusColor(collab.status)}>{collab.status.replace('_', ' ')}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {collab.collabType && <Badge variant="outline" className="mb-2">{collab.collabType}</Badge>}
        {collab.proposedConcept && <p className="text-sm text-muted-foreground line-clamp-2">{collab.proposedConcept}</p>}
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{collab.compatibilityScore}%</span>
            <span className="text-muted-foreground">compatibility</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            {collab.audienceOverlapPercent}% overlap
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 gap-2">
        <Button variant="outline" size="sm" className="flex-1"><MessageSquare className="h-4 w-4 mr-1" />Message</Button>
        <Button size="sm" className="flex-1">View Channel</Button>
      </CardFooter>
    </Card>
  );
}
