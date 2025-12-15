import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { YouTubeContentCalendarItem } from "@/types/streamengine";
import { Calendar, Clock, Video, FileText } from "lucide-react";
import { format } from "date-fns";

interface ContentCalendarProps {
  items: YouTubeContentCalendarItem[];
}

export function ContentCalendar({ items }: ContentCalendarProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'in_progress': return 'secondary';
      case 'idea': return 'outline';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No scheduled content
      </div>
    );
  }

  // Group items by date
  const groupedItems = items.reduce((acc, item) => {
    const date = item.scheduledDate ? format(new Date(item.scheduledDate), 'yyyy-MM-dd') : 'Unscheduled';
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, YouTubeContentCalendarItem[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([date, dateItems]) => (
        <div key={date}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {date === 'Unscheduled' ? date : format(new Date(date), 'EEEE, MMMM d, yyyy')}
          </h3>
          <div className="grid gap-3">
            {dateItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {item.contentType === 'video' ? (
                          <Video className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        )}
                        <h4 className="font-medium">{item.title}</h4>
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getStatusColor(item.status)}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getPriorityColor(item.priority)}>
                          {item.priority} priority
                        </Badge>
                        {item.scheduledTime && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.scheduledTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
