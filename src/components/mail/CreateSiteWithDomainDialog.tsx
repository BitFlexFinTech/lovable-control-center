import { useState } from 'react';
import { 
  Globe, 
  Mail, 
  CheckCircle2, 
  Loader2, 
  Search, 
  AlertCircle,
  DollarSign,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { EmailAccount } from '@/types/mail';
import { cn } from '@/lib/utils';

interface CreateSiteWithDomainDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (site: NewSiteData, emailAccounts: EmailAccount[]) => void;
  tenantId: string;
}

export interface NewSiteData {
  name: string;
  domain: string;
  url: string;
}

interface DomainCheckResult {
  available: boolean;
  domain: string;
  price?: number;
  premium?: boolean;
}

const DEFAULT_EMAIL_ACCOUNTS = ['admin', 'accounts', 'social', 'marketing'];

type Step = 'input' | 'checking' | 'available' | 'unavailable' | 'registering' | 'provisioning' | 'success' | 'error';

export function CreateSiteWithDomainDialog({ 
  isOpen, 
  onClose, 
  onCreate, 
  tenantId 
}: CreateSiteWithDomainDialogProps) {
  const { toast } = useToast();
  const [domain, setDomain] = useState('');
  const [step, setStep] = useState<Step>('input');
  const [domainCheck, setDomainCheck] = useState<DomainCheckResult | null>(null);
  const [provisioningStep, setProvisioningStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Simulated domain check (would call Namecheap API via edge function)
  const checkDomainAvailability = async (domainName: string) => {
    setStep('checking');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate domain availability (for demo, .test domains are unavailable)
    const isAvailable = !domainName.endsWith('.test') && Math.random() > 0.3;
    const price = isAvailable ? (Math.random() > 0.8 ? 29.99 : 12.99) : undefined;
    const isPremium = price && price > 20;
    
    const result: DomainCheckResult = {
      available: isAvailable,
      domain: domainName,
      price,
      premium: isPremium,
    };
    
    setDomainCheck(result);
    setStep(isAvailable ? 'available' : 'unavailable');
  };

  const registerDomainAndCreateSite = async () => {
    if (!domainCheck?.domain) return;
    
    setStep('registering');
    
    // Simulate domain registration
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setStep('provisioning');
    
    // Simulate email provisioning steps
    for (let i = 1; i <= 4; i++) {
      setProvisioningStep(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Create email accounts
    const emailAccounts: EmailAccount[] = DEFAULT_EMAIL_ACCOUNTS.map((name, index) => ({
      id: `acc-${Date.now()}-${index}`,
      tenantId,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: `${name}@${domainCheck.domain}`,
      type: name as EmailAccount['type'],
      createdAt: new Date().toISOString(),
    }));

    const newSite: NewSiteData = {
      name: domainCheck.domain.split('.')[0].charAt(0).toUpperCase() + 
            domainCheck.domain.split('.')[0].slice(1),
      domain: domainCheck.domain,
      url: `https://${domainCheck.domain}`,
    };

    onCreate(newSite, emailAccounts);
    
    setStep('success');
    
    toast({
      title: `Site created successfully at ${domainCheck.domain}`,
      description: `Domain registered and ${emailAccounts.length} email accounts provisioned.`,
    });

    // Auto-close after success
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    setDomain('');
    setStep('input');
    setDomainCheck(null);
    setProvisioningStep(0);
    setErrorMessage('');
    onClose();
  };

  const handleSearch = () => {
    if (!domain) {
      toast({
        title: 'Enter a domain',
        description: 'Please enter a domain name to check.',
        variant: 'destructive',
      });
      return;
    }
    
    // Add .com if no TLD specified
    const fullDomain = domain.includes('.') ? domain : `${domain}.com`;
    checkDomainAvailability(fullDomain.toLowerCase());
  };

  const provisioningSteps = [
    'Registering domain...',
    'Provisioning admin@' + (domainCheck?.domain || 'domain.com'),
    'Provisioning accounts@' + (domainCheck?.domain || 'domain.com'),
    'Provisioning social@ & marketing@',
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Create Site
          </DialogTitle>
          <DialogDescription>
            Register a domain and create a new site with automatic email provisioning
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Domain Search Input */}
          {(step === 'input' || step === 'checking' || step === 'unavailable') && (
            <div className="space-y-2">
              <Label htmlFor="domain">Enter your desired domain</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="domain"
                    placeholder="myawesomesite.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, ''))}
                    disabled={step === 'checking'}
                    className="pl-9"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={step === 'checking' || !domain}
                  size="icon"
                >
                  {step === 'checking' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {step === 'checking' && (
                <p className="text-sm text-muted-foreground animate-pulse">
                  Checking domain availability...
                </p>
              )}
            </div>
          )}

          {/* Domain Unavailable */}
          {step === 'unavailable' && domainCheck && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Domain unavailable</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-mono">{domainCheck.domain}</span> is not available for registration.
                    Try a different domain name.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Domain Available */}
          {step === 'available' && domainCheck && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-primary">Domain available!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="font-mono font-semibold">{domainCheck.domain}</span> is available
                    </p>
                  </div>
                  {domainCheck.price && (
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-lg font-semibold">
                        <DollarSign className="h-4 w-4" />
                        {domainCheck.price}
                      </div>
                      <p className="text-xs text-muted-foreground">/year</p>
                      {domainCheck.premium && (
                        <span className="text-xs px-1.5 py-0.5 bg-yellow-500/20 text-yellow-600 rounded mt-1 inline-block">
                          Premium
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* What's included */}
              <div className="space-y-2">
                <p className="text-sm font-medium">What's included:</p>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>Domain registration with WHOIS privacy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>4 email accounts (admin, accounts, social, marketing)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-primary" />
                    <span>New Lovable project bound to this domain</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Registering/Provisioning */}
          {(step === 'registering' || step === 'provisioning') && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div>
                  <p className="font-medium">
                    {step === 'registering' ? 'Registering domain...' : 'Provisioning site...'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {step === 'registering' 
                      ? `Registering ${domainCheck?.domain} via Namecheap`
                      : provisioningSteps[provisioningStep - 1] || 'Finishing up...'}
                  </p>
                </div>
              </div>

              {step === 'provisioning' && (
                <div className="grid grid-cols-2 gap-2">
                  {DEFAULT_EMAIL_ACCOUNTS.map((account, index) => (
                    <div
                      key={account}
                      className={cn(
                        "flex items-center gap-2 text-sm p-2 rounded-md transition-all",
                        provisioningStep > index
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground'
                      )}
                    >
                      {provisioningStep > index ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : provisioningStep === index + 1 ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Mail className="h-3.5 w-3.5" />
                      )}
                      <span>{account}@{domainCheck?.domain}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
              <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-3" />
              <p className="font-medium text-lg">Site created successfully!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your site at <span className="font-mono">{domainCheck?.domain}</span> is ready
              </p>
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Registration failed</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {errorMessage || 'An error occurred during registration. Please try again.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step !== 'success' && (
            <Button 
              variant="ghost" 
              onClick={handleClose} 
              disabled={step === 'registering' || step === 'provisioning'}
            >
              Cancel
            </Button>
          )}
          {step === 'available' && (
            <Button onClick={registerDomainAndCreateSite}>
              <Globe className="h-4 w-4 mr-2" />
              Register & Create Site
            </Button>
          )}
          {step === 'error' && (
            <Button onClick={() => setStep('input')}>
              Try Again
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
