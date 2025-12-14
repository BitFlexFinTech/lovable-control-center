import { useState } from 'react';
import { ThumbsUp, MessageSquare, Repeat2, Send, MoreHorizontal, Globe } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const linkedInPosts = [
  {
    id: '1',
    author: { 
      name: 'Satya Nadella', 
      headline: 'Chairman and CEO at Microsoft', 
      avatar: '', 
      followers: '11M' 
    },
    content: 'Excited to announce our latest innovations in cloud computing and AI. The future of work is here, and it\'s more accessible than ever.\n\nAt Microsoft, we believe technology should empower everyone. Our new AI tools are designed to enhance productivity while keeping humans at the center of decision-making.\n\n#Innovation #AI #FutureOfWork #Microsoft',
    engagement: { likes: 125000, comments: 2340, reposts: 8900 },
    timestamp: '1d',
    reactions: ['👍', '❤️', '💡', '👏'],
  },
  {
    id: '2',
    author: { 
      name: 'Harvard Business Review', 
      headline: 'Helping professionals grow', 
      avatar: '', 
      followers: '14M' 
    },
    content: '5 strategies for building resilient teams in uncertain times:\n\n1. Foster psychological safety\n2. Embrace flexible work arrangements\n3. Invest in continuous learning\n4. Prioritize clear communication\n5. Lead with empathy\n\nRead the full article in our latest issue.',
    media: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600',
    engagement: { likes: 8900, comments: 456, reposts: 2340 },
    timestamp: '2d',
    reactions: ['👍', '💡', '❤️'],
  },
  {
    id: '3',
    author: { 
      name: 'Reid Hoffman', 
      headline: 'Co-Founder of LinkedIn, Partner at Greylock', 
      avatar: '', 
      followers: '3.5M' 
    },
    content: 'The best entrepreneurs I know have one thing in common: they\'re perpetual learners.\n\nThey read voraciously, seek out mentors, and aren\'t afraid to admit what they don\'t know.\n\nWhat\'s the most important lesson you\'ve learned in your career?',
    engagement: { likes: 45000, comments: 1200, reposts: 3400 },
    timestamp: '3d',
    reactions: ['👍', '💡', '👏', '❤️'],
  },
];

const reactionEmojis = [
  { emoji: '👍', label: 'Like', color: 'text-blue-600' },
  { emoji: '👏', label: 'Celebrate', color: 'text-green-600' },
  { emoji: '❤️', label: 'Love', color: 'text-red-500' },
  { emoji: '💡', label: 'Insightful', color: 'text-yellow-500' },
  { emoji: '🤔', label: 'Curious', color: 'text-purple-500' },
];

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
  return num.toString();
}

export function LinkedInFeed({ userId }: { userId?: string }) {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [showReactions, setShowReactions] = useState<string | null>(null);

  const handleReaction = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });
    setShowReactions(null);
  };

  return (
    <div className="bg-muted/30 space-y-2">
      {linkedInPosts.map((post) => (
        <article key={post.id} className="bg-background border border-border rounded-lg">
          {/* Header */}
          <div className="p-4 pb-3">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback className="bg-blue-600 text-white font-semibold">
                    {post.author.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{post.author.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{post.author.headline}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <span>{post.timestamp}</span>
                    <span>·</span>
                    <Globe className="h-3 w-3" />
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 pb-3">
            <p className="text-sm text-foreground whitespace-pre-line">{post.content}</p>
          </div>

          {/* Media */}
          {post.media && (
            <div className="border-y border-border">
              <img src={post.media} alt="" className="w-full h-64 object-cover" />
            </div>
          )}

          {/* Engagement Stats */}
          <div className="px-4 py-2 flex items-center justify-between text-xs text-muted-foreground border-b border-border">
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                {post.reactions.slice(0, 3).map((reaction, i) => (
                  <span key={i} className="text-sm">{reaction}</span>
                ))}
              </div>
              <span>{formatNumber(post.engagement.likes)}</span>
            </div>
            <div className="flex gap-3">
              <span>{formatNumber(post.engagement.comments)} comments</span>
              <span>{formatNumber(post.engagement.reposts)} reposts</span>
            </div>
          </div>

          {/* Actions */}
          <div className="px-2 py-1 flex items-center justify-between">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-10 px-3 gap-2 text-muted-foreground hover:bg-muted",
                  likedPosts.has(post.id) && "text-blue-600"
                )}
                onMouseEnter={() => setShowReactions(post.id)}
                onMouseLeave={() => setShowReactions(null)}
                onClick={() => handleReaction(post.id)}
              >
                <ThumbsUp className={cn("h-5 w-5", likedPosts.has(post.id) && "fill-blue-600")} />
                <span className="text-sm font-medium">Like</span>
              </Button>
              
              {showReactions === post.id && (
                <div className="absolute bottom-full left-0 mb-1 bg-background border border-border rounded-full px-2 py-1 flex gap-1 shadow-lg z-10">
                  {reactionEmojis.map((reaction) => (
                    <button
                      key={reaction.label}
                      className="h-9 w-9 flex items-center justify-center hover:scale-125 transition-transform text-lg"
                      onClick={() => handleReaction(post.id)}
                      title={reaction.label}
                    >
                      {reaction.emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button variant="ghost" size="sm" className="h-10 px-3 gap-2 text-muted-foreground hover:bg-muted">
              <MessageSquare className="h-5 w-5" />
              <span className="text-sm font-medium">Comment</span>
            </Button>

            <Button variant="ghost" size="sm" className="h-10 px-3 gap-2 text-muted-foreground hover:bg-muted">
              <Repeat2 className="h-5 w-5" />
              <span className="text-sm font-medium">Repost</span>
            </Button>

            <Button variant="ghost" size="sm" className="h-10 px-3 gap-2 text-muted-foreground hover:bg-muted">
              <Send className="h-5 w-5" />
              <span className="text-sm font-medium">Send</span>
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
