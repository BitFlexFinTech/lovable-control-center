import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Youtube } from "lucide-react";
import { YouTubeChannel } from "@/types/streamengine";

interface ChannelSwitcherProps {
  channels: YouTubeChannel[];
  selectedChannelId: string | null;
  onSelectChannel: (channelId: string | null) => void;
  isLoading?: boolean;
}

export function ChannelSwitcher({ channels, selectedChannelId, onSelectChannel, isLoading }: ChannelSwitcherProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={selectedChannelId || ""} onValueChange={(value) => onSelectChannel(value || null)} disabled={isLoading}>
        <SelectTrigger className="w-64">
          <div className="flex items-center gap-2">
            <Youtube className="h-4 w-4 text-red-500" />
            <SelectValue placeholder="Select a channel" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {channels.map((channel) => (
            <SelectItem key={channel.id} value={channel.id}>
              <div className="flex items-center gap-2">
                {channel.thumbnailUrl && <img src={channel.thumbnailUrl} alt={channel.channelName} className="h-5 w-5 rounded-full" />}
                <span>{channel.channelName}</span>
                <span className="text-xs text-muted-foreground">{(channel.subscriberCount / 1000).toFixed(1)}K</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" size="icon"><Plus className="h-4 w-4" /></Button>
    </div>
  );
}
