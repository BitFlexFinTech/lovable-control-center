import { useState } from 'react';
import { TwitterTimelineEmbed } from 'react-twitter-embed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Twitter, Search, RefreshCw } from 'lucide-react';

interface TwitterFeedProps {
  userId?: string;
  username?: string;
}

export function TwitterFeed({ userId, username }: TwitterFeedProps) {
  const [inputUsername, setInputUsername] = useState(username || '');
  const [activeUsername, setActiveUsername] = useState(username || '');
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadUsername = () => {
    if (inputUsername.trim()) {
      setActiveUsername(inputUsername.trim().replace('@', ''));
      setIsLoading(true);
    }
  };

  if (!activeUsername) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Twitter className="h-5 w-5" />
            Twitter Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter a Twitter username to view their timeline
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="@username"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLoadUsername()}
            />
            <Button onClick={handleLoadUsername} className="gap-2">
              <Search className="h-4 w-4" />
              Load
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Twitter className="h-4 w-4" />
            @{activeUsername}
          </CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="@username"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLoadUsername()}
              className="h-8 w-32 text-xs"
            />
            <Button size="sm" variant="ghost" onClick={handleLoadUsername}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-4rem)] overflow-auto">
        {isLoading && (
          <div className="p-4 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}
        <div className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}>
          <TwitterTimelineEmbed
            sourceType="profile"
            screenName={activeUsername}
            options={{ height: 600 }}
            theme="dark"
            noHeader
            noBorders
            noFooter
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
