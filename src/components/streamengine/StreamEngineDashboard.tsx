import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useYouTubeChannels, useYouTubePersonas } from '@/hooks/useStreamEngine';
import { ChannelHealthPanel } from './ChannelHealthPanel';
import { BrandDealsPanel } from './BrandDealsPanel';
import { VideoIdeasPanel } from './VideoIdeasPanel';
import { ContentCalendarPanel } from './ContentCalendarPanel';
import { 
  Youtube, 
  Activity, 
  Handshake, 
  Lightbulb, 
  Calendar,
  Users
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StreamEngineDashboardProps {
  siteId?: string;
}

export function StreamEngineDashboard({ siteId }: StreamEngineDashboardProps) {
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  
  const { data: channels, isLoading: channelsLoading } = useYouTubeChannels(siteId);
  const { data: personas } = useYouTubePersonas(siteId);

  if (channelsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Channel Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-500" />
            YouTube Channels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {channels?.map(channel => (
              <Card
                key={channel.id}
                className={`cursor-pointer transition-all hover:border-primary ${
                  selectedChannelId === channel.id ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedChannelId(channel.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {channel.thumbnailUrl ? (
                      <img 
                        src={channel.thumbnailUrl} 
                        alt={channel.channelName}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                        <Youtube className="h-6 w-6 text-red-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{channel.channelName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{channel.subscriberCount?.toLocaleString() || 0} subs</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!channels || channels.length === 0) && (
              <p className="text-muted-foreground text-sm">
                No YouTube channels connected. Connect a channel to start managing content.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedChannelId && (
        <Tabs defaultValue="health" className="space-y-4">
          <TabsList>
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Channel Health
            </TabsTrigger>
            <TabsTrigger value="deals" className="flex items-center gap-2">
              <Handshake className="h-4 w-4" />
              Brand Deals
            </TabsTrigger>
            <TabsTrigger value="ideas" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Video Ideas
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Content Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="health">
            <ChannelHealthPanel channelId={selectedChannelId} />
          </TabsContent>

          <TabsContent value="deals">
            <BrandDealsPanel channelId={selectedChannelId} />
          </TabsContent>

          <TabsContent value="ideas">
            <VideoIdeasPanel channelId={selectedChannelId} />
          </TabsContent>

          <TabsContent value="calendar">
            <ContentCalendarPanel channelId={selectedChannelId} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
