import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecommendationCardsList } from "./RecommendationCardsList";
import { TimelinePanel } from "./TimelinePanel";
import { MetricsSnapshotPanel } from "./MetricsSnapshotPanel";
import { useRecommendationCards, useTimelineEvents } from "@/hooks/useQuantOps";
import { Skeleton } from "@/components/ui/skeleton";

interface QuantOpsDashboardProps {
  personaId: string | null;
}

export function QuantOpsDashboard({ personaId }: QuantOpsDashboardProps) {
  const { data: pendingCards, isLoading: cardsLoading } = useRecommendationCards(
    personaId || undefined, 
    'pending'
  );
  const { data: timelineEvents, isLoading: eventsLoading } = useTimelineEvents(
    personaId || undefined
  );

  if (!personaId) {
    return (
      <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
        <p className="text-muted-foreground">Select a persona to view dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MetricsSnapshotPanel personaId={personaId} />

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList>
          <TabsTrigger value="recommendations">
            Recommendations
            {pendingCards && pendingCards.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {pendingCards.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="mt-4">
          {cardsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <RecommendationCardsList cards={pendingCards || []} />
          )}
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          {eventsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <TimelinePanel events={timelineEvents || []} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
