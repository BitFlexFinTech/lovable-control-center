import { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const stories = [
  { id: '1', username: 'Your Story', avatar: '', isYours: true, hasNew: false },
  { id: '2', username: 'natgeo', avatar: '', hasNew: true },
  { id: '3', username: 'nasa', avatar: '', hasNew: true },
  { id: '4', username: 'apple', avatar: '', hasNew: true },
  { id: '5', username: 'nike', avatar: '', hasNew: false },
];

const instagramPosts = [
  {
    id: '1',
    author: { name: 'National Geographic', username: 'natgeo', avatar: '', verified: true },
    content: '📸 Stunning capture of the Northern Lights in Iceland. Nature never fails to amaze us. #NorthernLights #Iceland #NatGeo',
    media: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600',
    engagement: { likes: 892000, comments: 4500 },
    timestamp: '3 HOURS AGO',
  },
  {
    id: '2',
    author: { name: 'Design Inspiration', username: 'designinspiration', avatar: '', verified: false },
    content: 'Minimalist workspace goals ✨ Double tap if you love this setup! #design #workspace #aesthetic #minimal',
    media: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600',
    engagement: { likes: 45600, comments: 234 },
    timestamp: '5 HOURS AGO',
  },
  {
    id: '3',
    author: { name: 'NASA', username: 'nasa', avatar: '', verified: true },
    content: '🚀 A breathtaking view of Earth from the International Space Station. Our pale blue dot in all its glory.',
    media: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600',
    engagement: { likes: 1250000, comments: 8900 },
    timestamp: '8 HOURS AGO',
  },
];

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return num.toString();
}

export function InstagramFeed({ userId }: { userId?: string }) {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [doubleTapId, setDoubleTapId] = useState<string | null>(null);

  const handleDoubleTap = (id: string) => {
    if (!likedPosts.has(id)) {
      setLikedPosts(prev => new Set(prev).add(id));
      setDoubleTapId(id);
      setTimeout(() => setDoubleTapId(null), 1000);
    }
  };

  const toggleLike = (id: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleSave = (id: string) => {
    setSavedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  return (
    <div className="bg-background">
      {/* Stories Row */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {stories.map((story) => (
            <div key={story.id} className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={cn(
                "p-0.5 rounded-full",
                story.hasNew && "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
              )}>
                <div className="bg-background p-0.5 rounded-full">
                  <Avatar className="h-14 w-14 border-2 border-background">
                    <AvatarImage src={story.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-600 text-white text-xs">
                      {story.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-xs text-foreground truncate max-w-[64px]">
                {story.isYours ? 'Your Story' : story.username}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="divide-y divide-border">
        {instagramPosts.map((post) => (
          <article key={post.id} className="bg-background">
            {/* Header */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback className="bg-muted text-xs">
                      {post.author.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-foreground">{post.author.username}</span>
                  {post.author.verified && (
                    <svg className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z"/>
                    </svg>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>

            {/* Image */}
            <div 
              className="relative aspect-square cursor-pointer select-none"
              onDoubleClick={() => handleDoubleTap(post.id)}
            >
              <img 
                src={post.media} 
                alt="" 
                className="w-full h-full object-cover"
              />
              {doubleTapId === post.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart className="h-24 w-24 text-white fill-white animate-ping" />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleLike(post.id)} className="hover:opacity-60 transition-opacity">
                    <Heart className={cn(
                      "h-6 w-6",
                      likedPosts.has(post.id) ? "fill-red-500 text-red-500" : "text-foreground"
                    )} />
                  </button>
                  <button className="hover:opacity-60 transition-opacity">
                    <MessageCircle className="h-6 w-6 text-foreground" />
                  </button>
                  <button className="hover:opacity-60 transition-opacity">
                    <Send className="h-6 w-6 text-foreground" />
                  </button>
                </div>
                <button onClick={() => toggleSave(post.id)} className="hover:opacity-60 transition-opacity">
                  <Bookmark className={cn(
                    "h-6 w-6",
                    savedPosts.has(post.id) ? "fill-foreground text-foreground" : "text-foreground"
                  )} />
                </button>
              </div>

              {/* Likes */}
              <p className="text-sm font-semibold text-foreground">
                {formatNumber(post.engagement.likes + (likedPosts.has(post.id) ? 1 : 0))} likes
              </p>

              {/* Caption */}
              <p className="text-sm text-foreground">
                <span className="font-semibold">{post.author.username}</span>{' '}
                {post.content}
              </p>

              {/* Comments link */}
              <button className="text-sm text-muted-foreground">
                View all {formatNumber(post.engagement.comments)} comments
              </button>

              {/* Timestamp */}
              <p className="text-[10px] text-muted-foreground tracking-wide">
                {post.timestamp}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
