import { useState } from 'react';
import { Settings, ExternalLink, Key, Link2, Check, Copy, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { integrationTemplates, IntegrationTemplate } from '@/types/credentials';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface IntegrationSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  integrationId: string;
  onComplete: (credentials: Record<string, string>) => void;
}

type SetupType = 'oauth' | 'api-key' | 'manual';

const getSetupType = (integrationId: string): SetupType => {
  const oauthIntegrations = ['gmail-api', 'microsoft-graph', 'auth0', 'github', 'slack', 'discord'];
  const apiKeyIntegrations = ['stripe', 'sendgrid', 'mailchimp', 'mixpanel', 'google-analytics'];
  
  if (oauthIntegrations.includes(integrationId)) return 'oauth';
  if (apiKeyIntegrations.includes(integrationId)) return 'api-key';
  return 'manual';
};

export function IntegrationSetupDialog({ 
  isOpen, 
  onClose, 
  integrationId,
  onComplete 
}: IntegrationSetupDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'type' | 'credentials' | 'verify'>('type');
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isConnecting, setIsConnecting] = useState(false);

  const template = integrationTemplates.find(t => t.id === integrationId);
  const setupType = getSetupType(integrationId);

  if (!template) return null;

  const handleInputChange = (key: string, value: string) => {
    setCredentials(prev => ({ ...prev, [key]: value }));
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
    toast({ title: 'Copied to clipboard' });
  };

  const handleOAuthConnect = () => {
    setIsConnecting(true);
    // Simulate OAuth flow
    setTimeout(() => {
      setIsConnecting(false);
      setStep('verify');
      toast({ title: 'Connected successfully', description: `${template.name} has been linked.` });
    }, 2000);
  };

  const handleComplete = () => {
    onComplete(credentials);
    onClose();
    setStep('type');
    setCredentials({});
    toast({ 
      title: 'Setup Complete', 
      description: `${template.name} is now configured and active.` 
    });
  };

  const handleClose = () => {
    onClose();
    setStep('type');
    setCredentials({});
  };

  const allFieldsFilled = template.fields
    .filter(f => f.required)
    .every(f => credentials[f.key]?.trim());

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{template.icon}</span>
            Setup {template.name}
          </DialogTitle>
          <DialogDescription>
            Configure your {template.name} integration
          </DialogDescription>
        </DialogHeader>

        {/* Step: Type Selection */}
        {step === 'type' && (
          <div className="space-y-4">
            {setupType === 'oauth' && (
              <button
                onClick={handleOAuthConnect}
                disabled={isConnecting}
                className="w-full p-4 rounded-lg border border-border hover:border-primary/50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Link2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Connect with OAuth</p>
                    <p className="text-sm text-muted-foreground">
                      Securely connect using {template.name}'s authorization
                    </p>
                  </div>
                  {isConnecting && (
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </button>
            )}

            {setupType === 'api-key' && (
              <button
                onClick={() => setStep('credentials')}
                className="w-full p-4 rounded-lg border border-border hover:border-primary/50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Enter API Key</p>
                    <p className="text-sm text-muted-foreground">
                      Paste your {template.name} API credentials
                    </p>
                  </div>
                </div>
              </button>
            )}

            <button
              onClick={() => setStep('credentials')}
              className="w-full p-4 rounded-lg border border-border hover:border-primary/50 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Manual Setup</p>
                  <p className="text-sm text-muted-foreground">
                    Enter all credentials manually
                  </p>
                </div>
              </div>
            </button>

            <div className="flex items-center gap-2 pt-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <a 
                href="#" 
                className="text-sm text-primary hover:underline"
              >
                View {template.name} documentation
              </a>
            </div>
          </div>
        )}

        {/* Step: Credentials */}
        {step === 'credentials' && (
          <div className="space-y-4">
            {template.fields.map((field) => {
              const isPassword = field.key.toLowerCase().includes('password') || 
                               field.key.toLowerCase().includes('secret') ||
                               field.key.toLowerCase().includes('key');
              const showPassword = showPasswords[field.key];

              return (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key} className="flex items-center gap-2">
                    {field.label}
                    {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  <div className="relative">
                    <Input
                      id={field.key}
                      type={isPassword && !showPassword ? 'password' : 'text'}
                      value={credentials[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="pr-20"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {isPassword && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => togglePasswordVisibility(field.key)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      )}
                      {credentials[field.key] && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => copyToClipboard(credentials[field.key])}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('type')}>
                Back
              </Button>
              <Button 
                className="flex-1" 
                disabled={!allFieldsFilled}
                onClick={() => setStep('verify')}
              >
                Verify & Connect
              </Button>
            </div>
          </div>
        )}

        {/* Step: Verify */}
        {step === 'verify' && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-status-active/10 border border-status-active/20 flex items-center gap-3">
              <Check className="h-5 w-5 text-status-active" />
              <div>
                <p className="font-medium text-status-active">Connection Verified</p>
                <p className="text-sm text-muted-foreground">
                  {template.name} is ready to use
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <p className="text-sm font-medium">Configuration Summary</p>
              {Object.entries(credentials).slice(0, 3).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="font-mono text-xs">
                    {key.toLowerCase().includes('password') || key.toLowerCase().includes('secret') 
                      ? '••••••••' 
                      : value.length > 20 ? `${value.slice(0, 20)}...` : value}
                  </span>
                </div>
              ))}
            </div>

            <Button className="w-full gap-2" onClick={handleComplete}>
              <Check className="h-4 w-4" />
              Complete Setup
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
