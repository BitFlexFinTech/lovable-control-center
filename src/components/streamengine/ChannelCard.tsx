import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { YouTubeChannel, YouTubeChannelHealth } from "@/types/streamengine";
import { Users, Eye, Video, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ChannelCardProps {
  channel: YouTubeChannel;
  health?: YouTubeChannelHealth | null;
}

export function ChannelCard({ channel, health }: ChannelCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        {channel.thumbnailUrl && (
          <img 
            src={channel.thumbnailUrl} 
            alt={channel.channelName}
            className="h-16 w-16 rounded-full"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CardTitle>{channel.channelName}</CardTitle>
            <Badge variant={channel.isVerified ? "default" : "secondary"}>
              {channel.isVerified ? "Verified" : "Unverified"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {channel.description}
          </p>
        </div>
        {health && (
          <div className="text-center">
            <div className={`text-3xl font-bold ${getHealthColor(health.overallScore)}`}>
              {health.overallScore}
            </div>
            <p className="text-xs text-muted-foreground">Health Score</p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">{formatNumber(channel.subscriberCount)}</p>
              <p className="text-xs text-muted-foreground">Subscribers</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">{formatNumber(channel.viewCount)}</p>
              <p className="text-xs text-muted-foreground">Total Views</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">{channel.videoCount}</p>
              <p className="text-xs text-muted-foreground">Videos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">{channel.healthScore}</p>
              <p className="text-xs text-muted-foreground">Health</p>
            </div>
          </div>
        </div>

        {health && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Engagement</span>
              <span>{health.engagementScore}%</span>
            </div>
            <Progress value={health.engagementScore} className="h-2" />
            
            <div className="flex items-center justify-between text-sm">
              <span>Growth</span>
              <span>{health.growthScore}%</span>
            </div>
            <Progress value={health.growthScore} className="h-2" />
            
            <div className="flex items-center justify-between text-sm">
              <span>Consistency</span>
              <span>{health.consistencyScore}%</span>
            </div>
            <Progress value={health.consistencyScore} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
