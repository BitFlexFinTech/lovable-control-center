import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2, Plus, RefreshCw, ExternalLink, Check } from 'lucide-react';
import { useUserSocialAccounts, useConnectSocialAccount, SOCIAL_PLATFORMS, SocialPlatform } from '@/hooks/useUserSocialAccounts';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SocialsWidgetProps {
  className?: string;
}

export function SocialsWidget({ className }: SocialsWidgetProps) {
  const { toast } = useToast();
  const { data: accounts = [], isLoading } = useUserSocialAccounts();
  const connectAccount = useConnectSocialAccount();
  
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  const [username, setUsername] = useState('');
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  
  const connectedAccounts = accounts.filter(a => a.is_connected);
  
  const handleConnect = async () => {
    if (!selectedPlatform || !username.trim()) {
      toast({ title: 'Please enter your username', variant: 'destructive' });
      return;
    }
    
    try {
      await connectAccount.mutateAsync({
        platform: selectedPlatform,
        username: username.trim(),
        displayName: username.trim(),
      });
      
      toast({ title: `${SOCIAL_PLATFORMS[selectedPlatform].name} connected!` });
      setIsConnectOpen(false);
      setSelectedPlatform(null);
      setUsername('');
    } catch (error) {
      toast({ title: 'Failed to connect account', variant: 'destructive' });
    }
  };
  
  const platformList = Object.entries(SOCIAL_PLATFORMS) as [SocialPlatform, typeof SOCIAL_PLATFORMS[SocialPlatform]][];
  
  return (
    <>
      <Card className={cn("opacity-0 animate-fade-in", className)} style={{ animationDelay: '200ms' }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium">My Socials</CardTitle>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => setIsConnectOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground text-sm">Loading...</div>
          ) : connectedAccounts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-3">No accounts connected</p>
              <Button size="sm" onClick={() => setIsConnectOpen(true)} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Connect Account
              </Button>
            </div>
          ) : (
            <>
              {/* Platform Icons Row */}
              <div className="flex gap-2 flex-wrap">
                {connectedAccounts.map((account) => {
                  const platform = SOCIAL_PLATFORMS[account.platform as SocialPlatform];
                  if (!platform) return null;
                  
                  return (
                    <button
                      key={account.id}
                      onClick={() => setActivePlatform(activePlatform === account.platform ? null : account.platform)}
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all border",
                        activePlatform === account.platform
                          ? "bg-primary/20 border-primary shadow-sm"
                          : "bg-muted/50 border-transparent hover:bg-muted"
                      )}
                      style={{ 
                        backgroundColor: activePlatform === account.platform ? `${platform.color}20` : undefined 
                      }}
                      title={`${platform.name} - @${account.username}`}
                    >
                      {platform.icon}
                    </button>
                  );
                })}
              </div>
              
              {/* Active Platform Details */}
              {activePlatform && (
                <div className="p-3 rounded-lg bg-muted/50 border space-y-2">
                  {connectedAccounts
                    .filter(a => a.platform === activePlatform)
                    .map(account => {
                      const platform = SOCIAL_PLATFORMS[account.platform as SocialPlatform];
                      return (
                        <div key={account.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{platform?.name}</p>
                            <p className="text-xs text-muted-foreground">@{account.username}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="secondary" className="text-xs gap-1">
                              <Check className="h-3 w-3" />
                              Connected
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
              
              {/* Quick Stats */}
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  {connectedAccounts.length} account{connectedAccounts.length !== 1 ? 's' : ''} connected
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Connect Dialog */}
      <Dialog open={isConnectOpen} onOpenChange={setIsConnectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              Connect Social Account
            </DialogTitle>
            <DialogDescription>
              Connect your personal social media accounts to manage them from Control Center
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="select" className="mt-4">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="select">Select Platform</TabsTrigger>
              <TabsTrigger value="connect" disabled={!selectedPlatform}>Enter Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="select" className="mt-4">
              <div className="grid grid-cols-3 gap-3">
                {platformList.map(([key, platform]) => {
                  const isConnected = connectedAccounts.some(a => a.platform === key);
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedPlatform(key);
                      }}
                      disabled={isConnected}
                      className={cn(
                        "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                        selectedPlatform === key
                          ? "border-primary bg-primary/10"
                          : isConnected
                          ? "opacity-50 cursor-not-allowed bg-muted"
                          : "hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <span className="text-2xl">{platform.icon}</span>
                      <span className="text-xs font-medium">{platform.name}</span>
                      {isConnected && (
                        <Badge variant="secondary" className="text-[10px]">Connected</Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="connect" className="mt-4 space-y-4">
              {selectedPlatform && (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <span className="text-2xl">{SOCIAL_PLATFORMS[selectedPlatform].icon}</span>
                    <div>
                      <p className="font-medium">{SOCIAL_PLATFORMS[selectedPlatform].name}</p>
                      <p className="text-xs text-muted-foreground">Enter your username</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">@</span>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="your_username"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsConnectOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleConnect} 
              disabled={!selectedPlatform || !username.trim() || connectAccount.isPending}
            >
              {connectAccount.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Connect Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
