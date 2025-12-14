import { useState } from 'react';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Bookmark, BarChart2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TwitterPost {
  id: string;
  author: { name: string; handle: string; avatar: string; verified: boolean };
  content: string;
  media?: string;
  engagement: { likes: number; comments: number; retweets: number; views: number };
  timestamp: string;
}

const twitterPosts: TwitterPost[] = [
  {
    id: '1',
    author: { name: 'Elon Musk', handle: 'elonmusk', avatar: '', verified: true },
    content: 'The future of AI is incredibly exciting. We are on the verge of something remarkable.',
    engagement: { likes: 245000, comments: 12400, retweets: 34500, views: 12500000 },
    timestamp: '2h',
  },
  {
    id: '2',
    author: { name: 'Product Hunt', handle: 'ProductHunt', avatar: '', verified: true },
    content: '🚀 Check out the top products launching today! Some amazing tools for developers and designers.',
    media: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
    engagement: { likes: 1240, comments: 89, retweets: 234, views: 89000 },
    timestamp: '4h',
  },
  {
    id: '3',
    author: { name: 'TechCrunch', handle: 'TechCrunch', avatar: '', verified: true },
    content: 'Breaking: Major tech companies announce new AI partnerships. This could change everything we know about software development.',
    engagement: { likes: 3400, comments: 156, retweets: 890, views: 450000 },
    timestamp: '6h',
  },
  {
    id: '4',
    author: { name: 'Sam Altman', handle: 'sama', avatar: '', verified: true },
    content: 'AGI is closer than most people think. The progress in the last year has been extraordinary.',
    engagement: { likes: 89000, comments: 5600, retweets: 12000, views: 8900000 },
    timestamp: '8h',
  },
];

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function TwitterFeed({ userId }: { userId?: string }) {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [retweetedPosts, setRetweetedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleRetweet = (id: string) => {
    setRetweetedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  return (
    <div className="divide-y divide-border bg-background">
      {twitterPosts.map((post) => (
        <article key={post.id} className="p-4 hover:bg-muted/30 transition-colors cursor-pointer">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback className="bg-foreground/10 text-foreground text-sm font-medium">
                {post.author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-sm">
                <span className="font-bold text-foreground truncate">{post.author.name}</span>
                {post.verified && (
                  <svg className="h-4 w-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/>
                  </svg>
                )}
                <span className="text-muted-foreground">@{post.author.handle}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{post.timestamp}</span>
                <Button variant="ghost" size="sm" className="ml-auto h-8 w-8 p-0 rounded-full hover:bg-blue-500/10 hover:text-blue-500">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-[15px] text-foreground mt-1 whitespace-pre-wrap">{post.content}</p>
              
              {post.media && (
                <div className="mt-3 rounded-2xl overflow-hidden border border-border">
                  <img src={post.media} alt="" className="w-full h-48 object-cover" />
                </div>
              )}
              
              <div className="flex items-center justify-between mt-3 max-w-md">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 gap-2 rounded-full hover:bg-blue-500/10 hover:text-blue-500 text-muted-foreground"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-xs">{formatNumber(post.engagement.comments)}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "h-8 px-2 gap-2 rounded-full hover:bg-green-500/10 hover:text-green-500",
                    retweetedPosts.has(post.id) ? "text-green-500" : "text-muted-foreground"
                  )}
                  onClick={() => toggleRetweet(post.id)}
                >
                  <Repeat2 className="h-4 w-4" />
                  <span className="text-xs">{formatNumber(post.engagement.retweets + (retweetedPosts.has(post.id) ? 1 : 0))}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "h-8 px-2 gap-2 rounded-full hover:bg-pink-500/10 hover:text-pink-500",
                    likedPosts.has(post.id) ? "text-pink-500" : "text-muted-foreground"
                  )}
                  onClick={() => toggleLike(post.id)}
                >
                  <Heart className={cn("h-4 w-4", likedPosts.has(post.id) && "fill-current")} />
                  <span className="text-xs">{formatNumber(post.engagement.likes + (likedPosts.has(post.id) ? 1 : 0))}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 gap-2 rounded-full hover:bg-blue-500/10 hover:text-blue-500 text-muted-foreground"
                >
                  <BarChart2 className="h-4 w-4" />
                  <span className="text-xs">{formatNumber(post.engagement.views)}</span>
                </Button>
                
                <div className="flex">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "h-8 w-8 p-0 rounded-full hover:bg-blue-500/10 hover:text-blue-500",
                      bookmarkedPosts.has(post.id) ? "text-blue-500" : "text-muted-foreground"
                    )}
                    onClick={() => toggleBookmark(post.id)}
                  >
                    <Bookmark className={cn("h-4 w-4", bookmarkedPosts.has(post.id) && "fill-current")} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-full hover:bg-blue-500/10 hover:text-blue-500 text-muted-foreground"
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
