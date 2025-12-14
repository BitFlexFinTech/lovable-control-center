import { useState } from 'react';
import { MoreVertical, Clock, ListVideo, ThumbsUp, ThumbsDown, Share2, Download, Scissors, Flag } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const youtubeVideos = [
  {
    id: '1',
    title: 'The Best Tech of 2024! My picks for the most impressive gadgets this year.',
    thumbnail: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600',
    duration: '24:31',
    channel: { name: 'MKBHD', avatar: '', verified: true, subscribers: '18.4M' },
    views: '4.5M views',
    timestamp: '2 days ago',
    engagement: { likes: 234000, dislikes: 2300 },
  },
  {
    id: '2',
    title: 'I Survived 100 Days in Minecraft Hardcore Mode - Here\'s What Happened',
    thumbnail: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=600',
    duration: '1:02:45',
    channel: { name: 'PewDiePie', avatar: '', verified: true, subscribers: '111M' },
    views: '8.9M views',
    timestamp: '5 days ago',
    engagement: { likes: 890000, dislikes: 8900 },
  },
  {
    id: '3',
    title: 'How I Built a $10M Business in 12 Months - Complete Breakdown',
    thumbnail: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600',
    duration: '18:24',
    channel: { name: 'Ali Abdaal', avatar: '', verified: true, subscribers: '5.2M' },
    views: '2.1M views',
    timestamp: '1 week ago',
    engagement: { likes: 156000, dislikes: 1200 },
  },
  {
    id: '4',
    title: 'Tesla Cybertruck: 6 Months Later - The Truth Nobody Talks About',
    thumbnail: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600',
    duration: '32:18',
    channel: { name: 'Marques Brownlee', avatar: '', verified: true, subscribers: '18.4M' },
    views: '12M views',
    timestamp: '3 weeks ago',
    engagement: { likes: 567000, dislikes: 12000 },
  },
];

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
  return num.toString();
}

export function YouTubeFeed({ userId }: { userId?: string }) {
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [dislikedVideos, setDislikedVideos] = useState<Set<string>>(new Set());
  const [savedVideos, setSavedVideos] = useState<Set<string>>(new Set());

  const handleLike = (id: string) => {
    setLikedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
        setDislikedVideos(p => { p.delete(id); return new Set(p); });
      }
      return newSet;
    });
  };

  const handleDislike = (id: string) => {
    setDislikedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
        setLikedVideos(p => { p.delete(id); return new Set(p); });
      }
      return newSet;
    });
  };

  return (
    <div className="bg-background divide-y divide-border">
      {youtubeVideos.map((video) => (
        <article key={video.id} className="p-3 hover:bg-muted/30 transition-colors cursor-pointer">
          {/* Thumbnail */}
          <div className="relative aspect-video rounded-xl overflow-hidden mb-3 group">
            <img 
              src={video.thumbnail} 
              alt={video.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Duration Badge */}
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-xs text-white font-medium">
              {video.duration}
            </div>

            {/* Hover Actions */}
            <div className="absolute bottom-2 right-14 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 bg-black/80 rounded hover:bg-black" title="Watch Later">
                <Clock className="h-4 w-4 text-white" />
              </button>
              <button className="p-1.5 bg-black/80 rounded hover:bg-black" title="Add to Queue">
                <ListVideo className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Progress Bar (for watched videos) */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
              <div className="h-full bg-red-600 w-0" />
            </div>
          </div>

          {/* Video Info */}
          <div className="flex gap-3">
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarImage src={video.channel.avatar} />
              <AvatarFallback className="bg-red-600 text-white text-xs font-bold">
                {video.channel.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-foreground text-sm line-clamp-2 leading-5">
                  {video.title}
                </h3>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0 rounded-full">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>

              <div className="mt-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground hover:text-foreground">
                    {video.channel.name}
                  </span>
                  {video.channel.verified && (
                    <svg className="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z"/>
                    </svg>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {video.views} · {video.timestamp}
                </p>
              </div>

              {/* Engagement Row */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center bg-muted rounded-full">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleLike(video.id); }}
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-l-full hover:bg-muted-foreground/10 transition-colors",
                      likedVideos.has(video.id) && "text-foreground"
                    )}
                  >
                    <ThumbsUp className={cn(
                      "h-4 w-4",
                      likedVideos.has(video.id) && "fill-current"
                    )} />
                    <span className="text-xs font-medium">
                      {formatNumber(video.engagement.likes + (likedVideos.has(video.id) ? 1 : 0))}
                    </span>
                  </button>
                  <div className="w-px h-6 bg-border" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDislike(video.id); }}
                    className={cn(
                      "flex items-center px-3 py-1.5 rounded-r-full hover:bg-muted-foreground/10 transition-colors",
                      dislikedVideos.has(video.id) && "text-foreground"
                    )}
                  >
                    <ThumbsDown className={cn(
                      "h-4 w-4",
                      dislikedVideos.has(video.id) && "fill-current"
                    )} />
                  </button>
                </div>

                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full hover:bg-muted-foreground/10 transition-colors">
                  <Share2 className="h-4 w-4" />
                  <span className="text-xs font-medium">Share</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
