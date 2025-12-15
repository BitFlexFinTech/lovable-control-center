import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChannelCard } from "./ChannelCard";
import { VideoList } from "./VideoList";
import { ContentCalendar } from "./ContentCalendar";
import { AnalyticsOverview } from "./AnalyticsOverview";
import { CrisisAlertBanner } from "./CrisisAlertBanner";
import { VideoIdeaCard } from "./VideoIdeaCard";
import { BrandDealCard } from "./BrandDealCard";
import { CollabOpportunityCard } from "./CollabOpportunityCard";
import { useYouTubeChannel, useYouTubeVideos, useYouTubeContentCalendar } from "@/hooks/useStreamEngine";
import { useChannelHealth, useCrisisEvents, useBrandDeals, useCollaborations, useVideoIdeas } from "@/hooks/useStreamEngineFeatures";
import { Skeleton } from "@/components/ui/skeleton";

interface ChannelDashboardProps {
  channelId: string | null;
}

export function ChannelDashboard({ channelId }: ChannelDashboardProps) {
  const { data: channel, isLoading: channelLoading } = useYouTubeChannel(channelId || undefined);
  const { data: videos } = useYouTubeVideos(channelId || undefined);
  const { data: calendar } = useYouTubeContentCalendar(channelId || undefined);
  const { data: health } = useChannelHealth(channelId || undefined);
  const { data: crises } = useCrisisEvents(channelId || undefined, 'active');
  const { data: deals } = useBrandDeals(channelId || undefined);
  const { data: collabs } = useCollaborations(channelId || undefined);
  const { data: ideas } = useVideoIdeas(channelId || undefined, 'pending');

  if (!channelId) {
    return (
      <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
        <p className="text-muted-foreground">Select a channel to view dashboard</p>
      </div>
    );
  }

  if (channelLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-6">
      {crises && crises.length > 0 && (
        <CrisisAlertBanner crises={crises} />
      )}

      {channel && <ChannelCard channel={channel} health={health} />}

      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ideas">Ideas</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="collabs">Collabs</TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="mt-4">
          <VideoList videos={videos || []} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <ContentCalendar items={calendar || []} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <AnalyticsOverview channelId={channelId} />
        </TabsContent>

        <TabsContent value="ideas" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ideas?.map((idea) => (
              <VideoIdeaCard key={idea.id} idea={idea} />
            ))}
            {(!ideas || ideas.length === 0) && (
              <p className="text-muted-foreground col-span-full text-center py-8">
                No pending video ideas
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="deals" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {deals?.map((deal) => (
              <BrandDealCard key={deal.id} deal={deal} />
            ))}
            {(!deals || deals.length === 0) && (
              <p className="text-muted-foreground col-span-full text-center py-8">
                No brand deals
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="collabs" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {collabs?.map((collab) => (
              <CollabOpportunityCard key={collab.id} collab={collab} />
            ))}
            {(!collabs || collabs.length === 0) && (
              <p className="text-muted-foreground col-span-full text-center py-8">
                No collaboration opportunities
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
