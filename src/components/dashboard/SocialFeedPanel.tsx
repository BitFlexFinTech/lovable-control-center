import { useState } from 'react';
import { 
  Twitter, 
  Instagram, 
  Linkedin, 
  Facebook, 
  Youtube,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Image as ImageIcon,
  Video,
  Send,
  TrendingUp,
  ExternalLink,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useUserSocialAccounts, useConnectSocialAccount } from '@/hooks/useUserSocialAccounts';
import { toast } from '@/hooks/use-toast';

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

type SocialPlatform = 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'youtube';

interface PlatformConfig {
  id: SocialPlatform;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const platforms: PlatformConfig[] = [
  { id: 'twitter', name: 'X', icon: <Twitter className="h-4 w-4" />, color: '#000000', bgColor: 'bg-foreground/10' },
  { id: 'instagram', name: 'Instagram', icon: <Instagram className="h-4 w-4" />, color: '#E4405F', bgColor: 'bg-pink-500/10' },
  { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin className="h-4 w-4" />, color: '#0A66C2', bgColor: 'bg-blue-600/10' },
  { id: 'facebook', name: 'Facebook', icon: <Facebook className="h-4 w-4" />, color: '#1877F2', bgColor: 'bg-blue-500/10' },
  { id: 'tiktok', name: 'TikTok', icon: <TikTokIcon className="h-4 w-4" />, color: '#000000', bgColor: 'bg-foreground/10' },
  { id: 'youtube', name: 'YouTube', icon: <Youtube className="h-4 w-4" />, color: '#FF0000', bgColor: 'bg-red-500/10' },
];

// Mock posts data for each platform
const mockPosts: Record<SocialPlatform, Array<{
  id: string;
  author: { name: string; handle: string; avatar: string; verified?: boolean };
  content: string;
  media?: { type: 'image' | 'video'; url: string };
  engagement: { likes: number; comments: number; shares: number; views?: number };
  timestamp: string;
}>> = {
  twitter: [
    {
      id: '1',
      author: { name: 'Elon Musk', handle: '@elonmusk', avatar: '', verified: true },
      content: 'The future of AI is incredibly exciting. We are on the verge of something remarkable.',
      engagement: { likes: 245000, comments: 12400, shares: 34500, views: 12500000 },
      timestamp: '2h',
    },
    {
      id: '2',
      author: { name: 'Product Hunt', handle: '@ProductHunt', avatar: '', verified: true },
      content: '🚀 Check out the top products launching today! Some amazing tools for developers and designers.',
      media: { type: 'image', url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400' },
      engagement: { likes: 1240, comments: 89, shares: 234 },
      timestamp: '4h',
    },
    {
      id: '3',
      author: { name: 'TechCrunch', handle: '@TechCrunch', avatar: '', verified: true },
      content: 'Breaking: Major tech companies announce new AI partnerships',
      engagement: { likes: 3400, comments: 156, shares: 890 },
      timestamp: '6h',
    },
  ],
  instagram: [
    {
      id: '1',
      author: { name: 'National Geographic', handle: '@natgeo', avatar: '', verified: true },
      content: '📸 Stunning capture of the Northern Lights in Iceland. Nature never fails to amaze us.',
      media: { type: 'image', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400' },
      engagement: { likes: 892000, comments: 4500, shares: 12000 },
      timestamp: '3h',
    },
    {
      id: '2',
      author: { name: 'Design Inspiration', handle: '@designinspiration', avatar: '' },
      content: 'Minimalist workspace goals ✨ #design #workspace #aesthetic',
      media: { type: 'image', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400' },
      engagement: { likes: 45600, comments: 234, shares: 1890 },
      timestamp: '5h',
    },
  ],
  linkedin: [
    {
      id: '1',
      author: { name: 'Satya Nadella', handle: 'CEO at Microsoft', avatar: '', verified: true },
      content: 'Excited to announce our latest innovations in cloud computing. The future of work is here.',
      engagement: { likes: 125000, comments: 2340, shares: 8900 },
      timestamp: '1d',
    },
    {
      id: '2',
      author: { name: 'Harvard Business Review', handle: 'HBR', avatar: '', verified: true },
      content: '5 strategies for building resilient teams in uncertain times. Leadership insights from top CEOs.',
      engagement: { likes: 8900, comments: 456, shares: 2340 },
      timestamp: '2d',
    },
  ],
  facebook: [
    {
      id: '1',
      author: { name: 'Mark Zuckerberg', handle: 'Meta CEO', avatar: '', verified: true },
      content: 'Building the metaverse is a multi-year journey. Today we are sharing our progress.',
      media: { type: 'video', url: '' },
      engagement: { likes: 456000, comments: 23400, shares: 12000, views: 8900000 },
      timestamp: '8h',
    },
  ],
  tiktok: [
    {
      id: '1',
      author: { name: 'Khaby Lame', handle: '@khaby.lame', avatar: '', verified: true },
      content: 'When they make things complicated 😂',
      media: { type: 'video', url: '' },
      engagement: { likes: 12000000, comments: 89000, shares: 234000, views: 89000000 },
      timestamp: '12h',
    },
  ],
  youtube: [
    {
      id: '1',
      author: { name: 'MKBHD', handle: '@MKBHD', avatar: '', verified: true },
      content: 'The Best Tech of 2024! My picks for the most impressive gadgets this year.',
      media: { type: 'video', url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400' },
      engagement: { likes: 234000, comments: 12000, shares: 8900, views: 4500000 },
      timestamp: '2d',
    },
  ],
};

const trendingNews = [
  { topic: 'Technology', title: 'AI Breakthrough in Healthcare', posts: '45.2K' },
  { topic: 'Business', title: 'Markets Rally on Fed News', posts: '23.1K' },
  { topic: 'Sports', title: 'Championship Finals Tonight', posts: '89.4K' },
];

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function SocialFeedPanel({ className }: { className?: string }) {
  const [activePlatform, setActivePlatform] = useState<SocialPlatform>('twitter');
  const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');
  const [composeText, setComposeText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  
  const { data: connectedAccounts = [] } = useUserSocialAccounts();
  const connectAccount = useConnectSocialAccount();

  const activePlatformConfig = platforms.find(p => p.id === activePlatform)!;
  const posts = mockPosts[activePlatform] || [];

  const isConnected = connectedAccounts.some(
    acc => acc.platform === activePlatform && acc.is_connected
  );

  // Handle connect account
  const handleConnectAccount = async () => {
    try {
      await connectAccount.mutateAsync({
        platform: activePlatform,
        username: `demo_${activePlatform}_user`,
        displayName: `Demo ${activePlatformConfig.name} User`,
      });
      toast({
        title: `${activePlatformConfig.name} Connected`,
        description: `Your ${activePlatformConfig.name} account has been connected successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect account. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle image upload
  const handleImageUpload = () => {
    toast({
      title: 'Image Upload',
      description: 'Select an image to attach to your post.',
    });
  };

  // Handle video upload
  const handleVideoUpload = () => {
    toast({
      title: 'Video Upload',
      description: 'Select a video to attach to your post.',
    });
  };

  // Handle post
  const handlePost = async () => {
    if (!composeText.trim()) return;
    
    setIsPosting(true);
    
    // Simulate posting delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Posted Successfully',
      description: `Your post has been published to ${activePlatformConfig.name}.`,
    });
    
    setComposeText('');
    setIsPosting(false);
  };

  // Handle like
  const handleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
        toast({ title: 'Removed like' });
      } else {
        newSet.add(postId);
        toast({ title: 'Liked!' });
      }
      return newSet;
    });
  };

  // Handle bookmark
  const handleBookmark = (postId: string) => {
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
        toast({ title: 'Removed from bookmarks' });
      } else {
        newSet.add(postId);
        toast({ title: 'Added to bookmarks' });
      }
      return newSet;
    });
  };

  // Handle comment
  const handleComment = (postId: string) => {
    toast({ title: 'Comments', description: 'Opening comments...' });
  };

  // Handle share
  const handleShare = (postId: string) => {
    toast({ title: 'Share', description: 'Post link copied to clipboard!' });
  };

  // Handle show more
  const handleShowMore = () => {
    toast({ title: 'Loading more news...', description: 'Fetching trending topics.' });
  };

  // Handle post menu
  const handlePostMenu = (postId: string) => {
    toast({ title: 'Post Options', description: 'Report, Mute, Block, Copy Link' });
  };

  return (
    <Card className={cn("h-full flex flex-col overflow-hidden", className)}>
      {/* Platform Switcher */}
      <CardHeader className="pb-2 pt-3 px-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-1">
          {platforms.map((platform) => {
            const connected = connectedAccounts.some(
              acc => acc.platform === platform.id && acc.is_connected
            );
            return (
              <Button
                key={platform.id}
                variant={activePlatform === platform.id ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  "flex-1 h-9 px-2 relative",
                  activePlatform === platform.id && "shadow-md"
                )}
                style={{
                  backgroundColor: activePlatform === platform.id ? platform.color : undefined,
                  color: activePlatform === platform.id ? '#ffffff' : undefined,
                }}
                onClick={() => setActivePlatform(platform.id)}
              >
                {platform.icon}
                {connected && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-status-active rounded-full" />
                )}
              </Button>
            );
          })}
        </div>
      </CardHeader>

      {/* Tab Navigation */}
      <div className="px-3 pb-2 flex-shrink-0">
        <div className="flex border-b border-border">
          <button
            className={cn(
              "flex-1 py-2 text-sm font-medium transition-colors relative",
              activeTab === 'foryou' 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('foryou')}
          >
            For you
            {activeTab === 'foryou' && (
              <span 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full"
                style={{ backgroundColor: activePlatformConfig.color }}
              />
            )}
          </button>
          <button
            className={cn(
              "flex-1 py-2 text-sm font-medium transition-colors relative",
              activeTab === 'following' 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('following')}
          >
            Following
            {activeTab === 'following' && (
              <span 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full"
                style={{ backgroundColor: activePlatformConfig.color }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Compose Box */}
      {isConnected && (
        <div className="px-3 pb-3 flex-shrink-0">
          <div className="flex gap-2">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="text-xs">You</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="What's happening?"
                value={composeText}
                onChange={(e) => setComposeText(e.target.value)}
                className="min-h-[60px] resize-none text-sm border-border/50 bg-muted/30"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0"
                    onClick={handleImageUpload}
                    title="Add image"
                  >
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0"
                    onClick={handleVideoUpload}
                    title="Add video"
                  >
                    <Video className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
                <Button 
                  size="sm" 
                  className="h-7 px-3"
                  style={{ backgroundColor: activePlatformConfig.color }}
                  disabled={!composeText.trim() || isPosting}
                  onClick={handlePost}
                >
                  {isPosting ? (
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5 mr-1" />
                      Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* Feed Content */}
      <ScrollArea className="flex-1">
        <CardContent className="p-0">
          {!isConnected ? (
            <div className="p-6 text-center">
              <div 
                className={cn("w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center", activePlatformConfig.bgColor)}
                style={{ color: activePlatformConfig.color }}
              >
                {activePlatformConfig.icon}
              </div>
              <h4 className="font-medium mb-1">Connect {activePlatformConfig.name}</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Link your account to see your feed
              </p>
              <Button 
                size="sm"
                style={{ backgroundColor: activePlatformConfig.color }}
                onClick={handleConnectAccount}
                disabled={connectAccount.isPending}
              >
                {connectAccount.isPending ? (
                  <>
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Connecting...
                  </>
                ) : (
                  'Connect Account'
                )}
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {posts.map((post) => {
                const isLiked = likedPosts.has(post.id);
                const isBookmarked = bookmarkedPosts.has(post.id);
                
                return (
                  <article key={post.id} className="p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex gap-2.5">
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback className="text-xs">
                          {post.author.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="font-medium text-sm truncate">
                            {post.author.name}
                          </span>
                          {post.author.verified && (
                            <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                              <Check className="h-2.5 w-2.5" />
                            </Badge>
                          )}
                          <span className="text-muted-foreground text-xs truncate">
                            {post.author.handle}
                          </span>
                          <span className="text-muted-foreground text-xs">·</span>
                          <span className="text-muted-foreground text-xs">{post.timestamp}</span>
                        </div>
                        <p className="text-sm mb-2 leading-relaxed">{post.content}</p>
                        
                        {post.media && (
                          <div className="mb-2 rounded-lg overflow-hidden border border-border">
                            {post.media.type === 'image' && post.media.url ? (
                              <img 
                                src={post.media.url} 
                                alt="" 
                                className="w-full h-32 object-cover"
                              />
                            ) : (
                              <div className="w-full h-32 bg-muted flex items-center justify-center">
                                <Video className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Engagement Stats */}
                        <div className="flex items-center justify-between text-muted-foreground">
                          <button 
                            className="flex items-center gap-1 hover:text-foreground transition-colors text-xs"
                            onClick={() => handleComment(post.id)}
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            {formatNumber(post.engagement.comments)}
                          </button>
                          <button 
                            className="flex items-center gap-1 hover:text-status-active transition-colors text-xs"
                            onClick={() => handleShare(post.id)}
                          >
                            <Share2 className="h-3.5 w-3.5" />
                            {formatNumber(post.engagement.shares)}
                          </button>
                          <button 
                            className={cn(
                              "flex items-center gap-1 transition-colors text-xs",
                              isLiked ? "text-red-500" : "hover:text-red-500"
                            )}
                            onClick={() => handleLike(post.id)}
                          >
                            <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-current")} />
                            {formatNumber(post.engagement.likes + (isLiked ? 1 : 0))}
                          </button>
                          {post.engagement.views && (
                            <span className="text-xs">
                              {formatNumber(post.engagement.views)} views
                            </span>
                          )}
                          <button 
                            className={cn(
                              "transition-colors",
                              isBookmarked ? "text-primary" : "hover:text-foreground"
                            )}
                            onClick={() => handleBookmark(post.id)}
                          >
                            <Bookmark className={cn("h-3.5 w-3.5", isBookmarked && "fill-current")} />
                          </button>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 flex-shrink-0"
                        onClick={() => handlePostMenu(post.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Trending Section */}
          <div className="p-3 bg-muted/20">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h4 className="font-medium text-sm">Today's News</h4>
            </div>
            <div className="space-y-2">
              {trendingNews.map((news, i) => (
                <div 
                  key={i} 
                  className="group cursor-pointer"
                  onClick={() => toast({ title: news.title, description: `${news.posts} posts about this topic` })}
                >
                  <p className="text-xs text-muted-foreground">{news.topic}</p>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">
                    {news.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{news.posts} posts</p>
                </div>
              ))}
            </div>
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto mt-2 text-primary"
              onClick={handleShowMore}
            >
              Show more <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
