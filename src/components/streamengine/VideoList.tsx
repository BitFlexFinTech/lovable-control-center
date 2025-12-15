import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { YouTubeVideo } from "@/types/streamengine";
import { Eye, ThumbsUp, MessageSquare, Clock, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface VideoListProps {
  videos: YouTubeVideo[];
}

export function VideoList({ videos }: VideoListProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'scheduled': return 'secondary';
      case 'draft': case 'idea': return 'outline';
      case 'archived': return 'destructive';
      default: return 'secondary';
    }
  };

  if (videos.length === 0) return <div className="text-center py-8 text-muted-foreground">No videos found</div>;

  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <Card key={video.id} className="overflow-hidden">
          <div className="flex">
            {video.thumbnailUrl && (
              <div className="relative w-48 flex-shrink-0">
                <img src={video.thumbnailUrl} alt={video.title} className="h-full w-full object-cover" />
                {video.durationSeconds && (
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">{formatDuration(video.durationSeconds)}</div>
                )}
              </div>
            )}
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{video.description}</p>
                </div>
                <Badge variant={getStatusColor(video.status)}>{video.status}</Badge>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1"><Eye className="h-4 w-4" />{formatNumber(video.viewCount)}</div>
                <div className="flex items-center gap-1"><ThumbsUp className="h-4 w-4" />{formatNumber(video.likeCount)}</div>
                <div className="flex items-center gap-1"><MessageSquare className="h-4 w-4" />{formatNumber(video.commentCount)}</div>
                {video.publishedAt && <div className="flex items-center gap-1"><Clock className="h-4 w-4" />{formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}</div>}
              </div>
              <div className="flex items-center gap-2 mt-3">
                {video.tags?.slice(0, 3).map((tag) => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                {video.tags && video.tags.length > 3 && <span className="text-xs text-muted-foreground">+{video.tags.length - 3} more</span>}
                <Button variant="ghost" size="sm" className="ml-auto"><ExternalLink className="h-4 w-4 mr-1" />View</Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
