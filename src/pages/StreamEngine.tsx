import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChannelDashboard } from "@/components/streamengine/ChannelDashboard";
import { ChannelSwitcher } from "@/components/streamengine/ChannelSwitcher";
import { useYouTubeChannels } from "@/hooks/useStreamEngine";

export default function StreamEngine() {
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const { data: channels, isLoading } = useYouTubeChannels();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">StreamEngine</h1>
            <p className="text-muted-foreground">
              YouTube Channel Management & Analytics
            </p>
          </div>
          <ChannelSwitcher
            channels={channels || []}
            selectedChannelId={selectedChannelId}
            onSelectChannel={setSelectedChannelId}
            isLoading={isLoading}
          />
        </div>

        <ChannelDashboard channelId={selectedChannelId} />
      </div>
    </DashboardLayout>
  );
}
