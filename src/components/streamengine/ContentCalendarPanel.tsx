import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useContentCalendar, useYouTubeVideos } from '@/hooks/useStreamEngine';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  Video,
  Clock,
  Eye,
  ThumbsUp,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

interface ContentCalendarPanelProps {
  channelId: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-amber-500/10 text-amber-500',
  published: 'bg-green-500/10 text-green-500',
  private: 'bg-purple-500/10 text-purple-500',
  unlisted: 'bg-blue-500/10 text-blue-500',
};

export function ContentCalendarPanel({ channelId }: ContentCalendarPanelProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: calendar, isLoading: calendarLoading } = useContentCalendar(channelId);
  const { data: videos, isLoading: videosLoading } = useYouTubeVideos(channelId);

  const isLoading = calendarLoading || videosLoading;

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Combine calendar entries and videos for the month view
  const getEntriesForDay = (day: Date) => {
    const calendarEntries = calendar?.filter(c => 
      c.scheduledDate && isSameDay(new Date(c.scheduledDate), day)
    ) || [];
    const videoEntries = videos?.filter(v => 
      v.publishedAt && isSameDay(new Date(v.publishedAt), day)
    ) || [];
    return { calendar: calendarEntries, videos: videoEntries };
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Content Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[150px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month start */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-start-${i}`} className="h-24 bg-muted/30 rounded" />
            ))}
            
            {daysInMonth.map(day => {
              const entries = getEntriesForDay(day);
              const hasContent = entries.calendar.length > 0 || entries.videos.length > 0;
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={`h-24 border rounded p-1 overflow-hidden ${
                    isToday ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className={`text-xs font-medium mb-1 ${
                    isToday ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {entries.calendar.slice(0, 2).map(entry => (
                      <div
                        key={entry.id}
                        className="text-xs bg-amber-500/10 text-amber-500 rounded px-1 truncate"
                        title={entry.title || 'Scheduled'}
                      >
                        <Clock className="h-3 w-3 inline mr-1" />
                        {entry.title || 'Scheduled'}
                      </div>
                    ))}
                    {entries.videos.slice(0, 2).map(video => (
                      <div
                        key={video.id}
                        className="text-xs bg-green-500/10 text-green-500 rounded px-1 truncate"
                        title={video.title}
                      >
                        <Video className="h-3 w-3 inline mr-1" />
                        {video.title}
                      </div>
                    ))}
                    {(entries.calendar.length + entries.videos.length) > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{entries.calendar.length + entries.videos.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent/Upcoming Videos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Recent Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!videos || videos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No videos found for this channel.
            </p>
          ) : (
            <div className="space-y-4">
              {videos.slice(0, 5).map(video => (
                <div key={video.id} className="flex gap-4 items-start">
                  {video.thumbnailUrl ? (
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title}
                      className="w-32 h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-32 h-20 bg-muted rounded flex items-center justify-center">
                      <Video className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{video.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={statusColors[video.status || 'draft']}>
                        {video.status}
                      </Badge>
                      {video.publishedAt && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(video.publishedAt), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {video.viewCount?.toLocaleString() || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {video.likeCount?.toLocaleString() || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {video.commentCount?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
