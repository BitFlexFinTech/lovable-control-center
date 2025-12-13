import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Mail, Loader2, Check, AlertCircle, Apple, Cloud } from 'lucide-react';
import { useConnectMailAccount, useConnectedMailAccounts, IMAP_PRESETS } from '@/hooks/useConnectedMailAccounts';
import { useToast } from '@/hooks/use-toast';

interface ConnectMacMailDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type Provider = 'icloud' | 'gmail' | 'outlook' | 'custom';

export function ConnectMacMailDialog({ isOpen, onClose }: ConnectMacMailDialogProps) {
  const { toast } = useToast();
  const { data: connectedAccounts = [] } = useConnectedMailAccounts();
  const connectAccount = useConnectMailAccount();
  
  const [provider, setProvider] = useState<Provider>('icloud');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  // Custom IMAP settings
  const [imapHost, setImapHost] = useState('');
  const [imapPort, setImapPort] = useState('993');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  
  const [step, setStep] = useState<'select' | 'credentials' | 'connecting' | 'success'>('select');
  
  const handleConnect = async () => {
    if (!email || !password) {
      toast({ title: 'Please enter email and password', variant: 'destructive' });
      return;
    }
    
    setStep('connecting');
    
    try {
      const preset = provider !== 'custom' ? IMAP_PRESETS[provider] : null;
      
      await connectAccount.mutateAsync({
        email,
        password,
        displayName: displayName || email.split('@')[0],
        imapHost: preset?.imapHost || imapHost,
        imapPort: preset?.imapPort || parseInt(imapPort),
        smtpHost: preset?.smtpHost || smtpHost,
        smtpPort: preset?.smtpPort || parseInt(smtpPort),
      });
      
      setStep('success');
      toast({ title: 'Email account connected successfully!' });
      
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
    } catch (error) {
      setStep('credentials');
      toast({ title: 'Failed to connect email account', variant: 'destructive' });
    }
  };
  
  const resetForm = () => {
    setProvider('icloud');
    setEmail('');
    setPassword('');
    setDisplayName('');
    setImapHost('');
    setImapPort('993');
    setSmtpHost('');
    setSmtpPort('587');
    setStep('select');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); resetForm(); } }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Connect Mac Mail
          </DialogTitle>
          <DialogDescription>
            Connect your email account to sync and manage emails from Control Center
          </DialogDescription>
        </DialogHeader>
        
        {step === 'select' && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">Select your email provider:</p>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setProvider('icloud'); setStep('credentials'); }}
                className="p-4 rounded-xl border hover:border-primary/50 hover:bg-muted/50 transition-all flex flex-col items-center gap-2"
              >
                <Apple className="h-8 w-8" />
                <span className="font-medium">iCloud Mail</span>
                <Badge variant="secondary" className="text-xs">Recommended</Badge>
              </button>
              
              <button
                onClick={() => { setProvider('gmail'); setStep('credentials'); }}
                className="p-4 rounded-xl border hover:border-primary/50 hover:bg-muted/50 transition-all flex flex-col items-center gap-2"
              >
                <span className="text-3xl">📧</span>
                <span className="font-medium">Gmail</span>
              </button>
              
              <button
                onClick={() => { setProvider('outlook'); setStep('credentials'); }}
                className="p-4 rounded-xl border hover:border-primary/50 hover:bg-muted/50 transition-all flex flex-col items-center gap-2"
              >
                <Cloud className="h-8 w-8 text-blue-500" />
                <span className="font-medium">Outlook</span>
              </button>
              
              <button
                onClick={() => { setProvider('custom'); setStep('credentials'); }}
                className="p-4 rounded-xl border hover:border-primary/50 hover:bg-muted/50 transition-all flex flex-col items-center gap-2"
              >
                <span className="text-3xl">⚙️</span>
                <span className="font-medium">Custom IMAP</span>
              </button>
            </div>
            
            {connectedAccounts.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">Already connected:</p>
                <div className="flex flex-wrap gap-2">
                  {connectedAccounts.map(acc => (
                    <Badge key={acc.id} variant="secondary" className="gap-1">
                      <Check className="h-3 w-3" />
                      {acc.email}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {step === 'credentials' && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <span className="text-2xl">
                {provider === 'icloud' && '🍎'}
                {provider === 'gmail' && '📧'}
                {provider === 'outlook' && '☁️'}
                {provider === 'custom' && '⚙️'}
              </span>
              <div>
                <p className="font-medium capitalize">{provider === 'icloud' ? 'iCloud Mail' : provider}</p>
                <p className="text-xs text-muted-foreground">
                  {provider === 'icloud' && 'Use an app-specific password from appleid.apple.com'}
                  {provider === 'gmail' && 'Use an app password from your Google account'}
                  {provider === 'outlook' && 'Use your Microsoft account password'}
                  {provider === 'custom' && 'Enter your IMAP/SMTP server details'}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">
                  {provider === 'icloud' || provider === 'gmail' ? 'App Password' : 'Password'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name (Optional)</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="My Mac Mail"
                />
              </div>
              
              {provider === 'custom' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>IMAP Host</Label>
                      <Input
                        value={imapHost}
                        onChange={(e) => setImapHost(e.target.value)}
                        placeholder="imap.example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>IMAP Port</Label>
                      <Input
                        value={imapPort}
                        onChange={(e) => setImapPort(e.target.value)}
                        placeholder="993"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>SMTP Host</Label>
                      <Input
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        placeholder="smtp.example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP Port</Label>
                      <Input
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(e.target.value)}
                        placeholder="587"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {(provider === 'icloud' || provider === 'gmail') && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                <div className="text-xs text-amber-500">
                  <p className="font-medium">App Password Required</p>
                  <p className="text-amber-500/80">
                    {provider === 'icloud' 
                      ? 'Generate an app-specific password at appleid.apple.com → Security' 
                      : 'Generate an app password at myaccount.google.com → Security → App passwords'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {step === 'connecting' && (
          <div className="py-12 flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <div className="text-center">
              <p className="font-medium">Connecting to mail server...</p>
              <p className="text-sm text-muted-foreground">Syncing mailboxes and fetching emails</p>
            </div>
          </div>
        )}
        
        {step === 'success' && (
          <div className="py-12 flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-status-active/20 flex items-center justify-center">
              <Check className="h-8 w-8 text-status-active" />
            </div>
            <div className="text-center">
              <p className="font-medium text-status-active">Connected Successfully!</p>
              <p className="text-sm text-muted-foreground">{email} is now synced</p>
            </div>
          </div>
        )}
        
        {(step === 'select' || step === 'credentials') && (
          <DialogFooter>
            {step === 'credentials' && (
              <Button variant="outline" onClick={() => setStep('select')}>Back</Button>
            )}
            {step === 'credentials' && (
              <Button onClick={handleConnect} disabled={!email || !password}>
                Connect Account
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
