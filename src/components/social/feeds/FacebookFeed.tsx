import { useState } from 'react';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Globe, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const facebookPosts = [
  {
    id: '1',
    author: { 
      name: 'Mark Zuckerberg', 
      avatar: '', 
      verified: true,
      isPage: false 
    },
    content: 'Building the metaverse is a multi-year journey. Today we\'re sharing our progress and vision for the next chapter of social connection.\n\nThe future is about presence - feeling like you\'re right there with another person, no matter where they are in the world.',
    media: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=600',
    engagement: { reactions: 456000, comments: 23400, shares: 12000 },
    timestamp: '8h',
    privacy: 'public',
    topReactions: ['👍', '❤️', '😮'],
  },
  {
    id: '2',
    author: { 
      name: 'TechCrunch', 
      avatar: '', 
      verified: true,
      isPage: true 
    },
    content: '🚨 BREAKING: Major tech acquisitions announced today that could reshape the industry.\n\nClick to read the full story and what it means for developers, consumers, and investors.',
    engagement: { reactions: 8900, comments: 567, shares: 2340 },
    timestamp: '2h',
    privacy: 'public',
    topReactions: ['😮', '👍', '😢'],
  },
  {
    id: '3',
    author: { 
      name: 'National Geographic', 
      avatar: '', 
      verified: true,
      isPage: true 
    },
    content: 'Incredible footage from our latest expedition to the Amazon rainforest. The biodiversity we encountered was beyond anything we\'ve seen before.\n\n🌿 Follow our journey as we document species that have never been captured on film.',
    media: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600',
    engagement: { reactions: 125000, comments: 3400, shares: 8900 },
    timestamp: '5h',
    privacy: 'public',
    topReactions: ['❤️', '😮', '👍'],
  },
];

const reactionOptions = [
  { emoji: '👍', label: 'Like', color: 'text-blue-500' },
  { emoji: '❤️', label: 'Love', color: 'text-red-500' },
  { emoji: '😆', label: 'Haha', color: 'text-yellow-500' },
  { emoji: '😮', label: 'Wow', color: 'text-yellow-500' },
  { emoji: '😢', label: 'Sad', color: 'text-yellow-500' },
  { emoji: '😠', label: 'Angry', color: 'text-orange-500' },
];

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function FacebookFeed({ userId }: { userId?: string }) {
  const [reactions, setReactions] = useState<Record<string, string>>({});
  const [showReactions, setShowReactions] = useState<string | null>(null);

  const handleReaction = (postId: string, emoji: string) => {
    setReactions(prev => {
      if (prev[postId] === emoji) {
        const { [postId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [postId]: emoji };
    });
    setShowReactions(null);
  };

  const getReactionDisplay = (postId: string) => {
    const reaction = reactions[postId];
    if (!reaction) return { emoji: '👍', label: 'Like', hasReacted: false };
    const found = reactionOptions.find(r => r.emoji === reaction);
    return { emoji: reaction, label: found?.label || 'Like', hasReacted: true };
  };

  return (
    <div className="bg-muted/50 space-y-3 py-2">
      {facebookPosts.map((post) => {
        const reactionDisplay = getReactionDisplay(post.id);
        
        return (
          <article key={post.id} className="bg-background rounded-lg shadow-sm">
            {/* Header */}
            <div className="p-4 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback className="bg-blue-500 text-white font-semibold text-sm">
                      {post.author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1">
                      <h3 className="font-semibold text-foreground text-[15px]">{post.author.name}</h3>
                      {post.author.verified && (
                        <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>{post.timestamp}</span>
                      <span>·</span>
                      <Globe className="h-3 w-3" />
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-muted">
                  <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-3">
              <p className="text-[15px] text-foreground whitespace-pre-line">{post.content}</p>
            </div>

            {/* Media */}
            {post.media && (
              <div className="cursor-pointer">
                <img src={post.media} alt="" className="w-full h-72 object-cover" />
              </div>
            )}

            {/* Engagement Stats */}
            <div className="px-4 py-2 flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="flex -space-x-1">
                  {post.topReactions.map((reaction, i) => (
                    <span 
                      key={i} 
                      className="h-5 w-5 rounded-full bg-background border border-background flex items-center justify-center text-xs"
                    >
                      {reaction}
                    </span>
                  ))}
                </div>
                <span className="ml-1">{formatNumber(post.engagement.reactions)}</span>
              </div>
              <div className="flex gap-3">
                <span>{formatNumber(post.engagement.comments)} comments</span>
                <span>{formatNumber(post.engagement.shares)} shares</span>
              </div>
            </div>

            {/* Divider */}
            <div className="mx-4 border-t border-border" />

            {/* Actions */}
            <div className="px-2 py-1 flex items-center">
              <div className="relative flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full h-10 gap-2 hover:bg-muted rounded-lg",
                    reactionDisplay.hasReacted ? "text-blue-500" : "text-muted-foreground"
                  )}
                  onMouseEnter={() => setShowReactions(post.id)}
                  onMouseLeave={() => setShowReactions(null)}
                  onClick={() => handleReaction(post.id, '👍')}
                >
                  {reactionDisplay.hasReacted ? (
                    <span className="text-lg">{reactionDisplay.emoji}</span>
                  ) : (
                    <ThumbsUp className="h-5 w-5" />
                  )}
                  <span className="font-medium">{reactionDisplay.label}</span>
                </Button>

                {showReactions === post.id && (
                  <div 
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-background border border-border rounded-full px-2 py-1 flex gap-1 shadow-lg z-10"
                    onMouseEnter={() => setShowReactions(post.id)}
                    onMouseLeave={() => setShowReactions(null)}
                  >
                    {reactionOptions.map((reaction) => (
                      <button
                        key={reaction.label}
                        className="h-10 w-10 flex items-center justify-center hover:scale-150 transition-transform text-2xl hover:-translate-y-2"
                        onClick={() => handleReaction(post.id, reaction.emoji)}
                        title={reaction.label}
                      >
                        {reaction.emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button variant="ghost" size="sm" className="flex-1 h-10 gap-2 text-muted-foreground hover:bg-muted rounded-lg">
                <MessageCircle className="h-5 w-5" />
                <span className="font-medium">Comment</span>
              </Button>

              <Button variant="ghost" size="sm" className="flex-1 h-10 gap-2 text-muted-foreground hover:bg-muted rounded-lg">
                <Share2 className="h-5 w-5" />
                <span className="font-medium">Share</span>
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
