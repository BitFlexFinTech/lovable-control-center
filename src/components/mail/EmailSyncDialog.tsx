import { useState } from 'react';
import { Mail, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EmailSyncDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (provider: string, config: EmailProviderConfig) => void;
}

export interface EmailProviderConfig {
  provider: 'gmail' | 'outlook' | 'imap';
  email?: string;
  imapHost?: string;
  imapPort?: number;
  smtpHost?: string;
  smtpPort?: number;
  username?: string;
  password?: string;
  useSSL?: boolean;
}

const providers = [
  {
    id: 'gmail',
    name: 'Gmail',
    icon: '📧',
    color: 'from-red-500 to-orange-500',
    description: 'Connect with Google OAuth',
  },
  {
    id: 'outlook',
    name: 'Outlook',
    icon: '📬',
    color: 'from-blue-500 to-cyan-500',
    description: 'Connect with Microsoft OAuth',
  },
  {
    id: 'imap',
    name: 'IMAP/SMTP',
    icon: '⚙️',
    color: 'from-gray-600 to-gray-800',
    description: 'Manual configuration',
  },
];

export function EmailSyncDialog({ isOpen, onClose, onConnect }: EmailSyncDialogProps) {
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState<string>('gmail');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  
  // IMAP/SMTP configuration
  const [imapConfig, setImapConfig] = useState({
    email: '',
    imapHost: '',
    imapPort: '993',
    smtpHost: '',
    smtpPort: '587',
    username: '',
    password: '',
    useSSL: true,
  });

  const handleOAuthConnect = async (provider: 'gmail' | 'outlook') => {
    setIsConnecting(true);
    setConnectionStatus('testing');
    
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setConnectionStatus('success');
    setIsConnecting(false);
    
    toast({
      title: `${provider === 'gmail' ? 'Gmail' : 'Outlook'} connected successfully`,
      description: 'Your email account has been synced.',
    });
    
    onConnect(provider, { provider });
  };

  const handleImapConnect = async () => {
    setIsConnecting(true);
    setConnectionStatus('testing');
    
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (!imapConfig.imapHost || !imapConfig.smtpHost || !imapConfig.username || !imapConfig.password) {
      setConnectionStatus('error');
      setIsConnecting(false);
      toast({
        title: 'Connection failed',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    setConnectionStatus('success');
    setIsConnecting(false);
    
    toast({
      title: 'IMAP/SMTP connected successfully',
      description: 'Your email account has been synced.',
    });
    
    onConnect('imap', {
      provider: 'imap',
      ...imapConfig,
      imapPort: parseInt(imapConfig.imapPort),
      smtpPort: parseInt(imapConfig.smtpPort),
    });
  };

  const testConnection = async () => {
    setConnectionStatus('testing');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (imapConfig.imapHost && imapConfig.username && imapConfig.password) {
      setConnectionStatus('success');
      toast({ title: 'Connection test successful!' });
    } else {
      setConnectionStatus('error');
      toast({ title: 'Connection test failed', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email Sync Integration
          </DialogTitle>
          <DialogDescription>
            Connect your email provider to sync emails across tenants
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedProvider} onValueChange={setSelectedProvider} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            {providers.map((provider) => (
              <TabsTrigger key={provider.id} value={provider.id} className="gap-2">
                <span>{provider.icon}</span>
                <span className="hidden sm:inline">{provider.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="gmail" className="mt-4 space-y-4">
            <div className={cn(
              "p-6 rounded-lg bg-gradient-to-br text-white",
              "from-red-500 to-orange-500"
            )}>
              <h3 className="font-semibold text-lg">Google Gmail</h3>
              <p className="text-white/80 text-sm mt-1">
                Connect using your Google account with OAuth 2.0
              </p>
            </div>
            <Button
              onClick={() => handleOAuthConnect('gmail')}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Connect with Google
            </Button>
          </TabsContent>

          <TabsContent value="outlook" className="mt-4 space-y-4">
            <div className={cn(
              "p-6 rounded-lg bg-gradient-to-br text-white",
              "from-blue-500 to-cyan-500"
            )}>
              <h3 className="font-semibold text-lg">Microsoft Outlook</h3>
              <p className="text-white/80 text-sm mt-1">
                Connect using your Microsoft account with OAuth 2.0
              </p>
            </div>
            <Button
              onClick={() => handleOAuthConnect('outlook')}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Connect with Microsoft
            </Button>
          </TabsContent>

          <TabsContent value="imap" className="mt-4 space-y-4">
            <div className={cn(
              "p-6 rounded-lg bg-gradient-to-br text-white",
              "from-gray-600 to-gray-800"
            )}>
              <h3 className="font-semibold text-lg">IMAP/SMTP Configuration</h3>
              <p className="text-white/80 text-sm mt-1">
                Manual configuration for any email provider
              </p>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    placeholder="you@domain.com"
                    value={imapConfig.email}
                    onChange={(e) => setImapConfig({ ...imapConfig, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Username"
                    value={imapConfig.username}
                    onChange={(e) => setImapConfig({ ...imapConfig, username: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password / App Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={imapConfig.password}
                  onChange={(e) => setImapConfig({ ...imapConfig, password: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="imapHost">IMAP Server</Label>
                  <Input
                    id="imapHost"
                    placeholder="imap.example.com"
                    value={imapConfig.imapHost}
                    onChange={(e) => setImapConfig({ ...imapConfig, imapHost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imapPort">IMAP Port</Label>
                  <Input
                    id="imapPort"
                    placeholder="993"
                    value={imapConfig.imapPort}
                    onChange={(e) => setImapConfig({ ...imapConfig, imapPort: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Server</Label>
                  <Input
                    id="smtpHost"
                    placeholder="smtp.example.com"
                    value={imapConfig.smtpHost}
                    onChange={(e) => setImapConfig({ ...imapConfig, smtpHost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    placeholder="587"
                    value={imapConfig.smtpPort}
                    onChange={(e) => setImapConfig({ ...imapConfig, smtpPort: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {connectionStatus === 'success' && (
                  <div className="flex items-center gap-1 text-status-active text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    Connection verified
                  </div>
                )}
                {connectionStatus === 'error' && (
                  <div className="flex items-center gap-1 text-status-inactive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Connection failed
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={testConnection}
                disabled={isConnecting || connectionStatus === 'testing'}
                className="flex-1"
              >
                {connectionStatus === 'testing' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Test Connection
              </Button>
              <Button
                onClick={handleImapConnect}
                disabled={isConnecting}
                className="flex-1"
              >
                Connect
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
