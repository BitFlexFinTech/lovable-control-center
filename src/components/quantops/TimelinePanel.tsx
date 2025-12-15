import { TimelineEvent } from "@/types/quantops";
import { TimelineEventCard } from "./TimelineEventCard";

interface TimelinePanelProps {
  events: TimelineEvent[];
}

export function TimelinePanel({ events }: TimelinePanelProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No events yet</p>
        <p className="text-sm mt-1">Applied recommendations will appear here</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
      <div className="space-y-4 pl-10">
        {events.map((event) => (
          <TimelineEventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
