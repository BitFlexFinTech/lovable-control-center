import { useState } from 'react';
import { 
  Twitter, 
  Instagram, 
  Linkedin, 
  Facebook, 
  Youtube,
  Image as ImageIcon,
  Video,
  Send,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useUserSocialAccounts, useConnectSocialAccount } from '@/hooks/useUserSocialAccounts';
import { toast } from '@/hooks/use-toast';

// Platform-specific feed components
import { TwitterFeed } from '@/components/social/feeds/TwitterFeed';
import { InstagramFeed } from '@/components/social/feeds/InstagramFeed';
import { LinkedInFeed } from '@/components/social/feeds/LinkedInFeed';
import { FacebookFeed } from '@/components/social/feeds/FacebookFeed';
import { TikTokFeed } from '@/components/social/feeds/TikTokFeed';
import { YouTubeFeed } from '@/components/social/feeds/YouTubeFeed';

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

const trendingNews = [
  { topic: 'Technology', title: 'AI Breakthrough in Healthcare', posts: '45.2K' },
  { topic: 'Business', title: 'Markets Rally on Fed News', posts: '23.1K' },
  { topic: 'Sports', title: 'Championship Finals Tonight', posts: '89.4K' },
];

export function SocialFeedPanel({ className }: { className?: string }) {
  const [activePlatform, setActivePlatform] = useState<SocialPlatform>('twitter');
  const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');
  const [composeText, setComposeText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  
  const { data: connectedAccounts = [] } = useUserSocialAccounts();
  const connectAccount = useConnectSocialAccount();

  const activePlatformConfig = platforms.find(p => p.id === activePlatform)!;

  const isConnected = connectedAccounts.some(
    acc => acc.platform === activePlatform && acc.is_connected
  );

  // Get user ID for feeds
  const connectedAccount = connectedAccounts.find(
    acc => acc.platform === activePlatform && acc.is_connected
  );
  const userId = connectedAccount?.user_id;

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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect account';
      toast({
        title: 'Connection Failed',
        description: errorMessage,
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

  // Handle show more
  const handleShowMore = () => {
    toast({ title: 'Loading more news...', description: 'Fetching trending topics.' });
  };

  // Render platform-specific feed
  const renderPlatformFeed = () => {
    switch (activePlatform) {
      case 'twitter':
        return <TwitterFeed userId={userId} />;
      case 'instagram':
        return <InstagramFeed userId={userId} />;
      case 'linkedin':
        return <LinkedInFeed userId={userId} />;
      case 'facebook':
        return <FacebookFeed userId={userId} />;
      case 'tiktok':
        return <TikTokFeed userId={userId} />;
      case 'youtube':
        return <YouTubeFeed userId={userId} />;
      default:
        return null;
    }
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
            <div>
              {/* Platform-specific feed */}
              {renderPlatformFeed()}
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