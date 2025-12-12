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
  ExternalLink,
  ShoppingCart,
  Sparkles,
  Check,
  X,
  Star
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
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useIntegrations } from '@/contexts/IntegrationsContext';
import { useCreateSite } from '@/hooks/useSupabaseSites';
import { EmailAccount } from '@/types/mail';
import { LinkedApp } from '@/types';
import { analyzeAppForIntegrations, POPULAR_TLDS } from '@/utils/integrationAnalyzer';
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
  appColor?: string;
  requiredIntegrations?: string[];
}

interface DomainCheckResult {
  available: boolean;
  domain: string;
  tld: string;
  baseDomain: string;
  price: number;
  isPremium: boolean;
  isRecommended: boolean;
}

const DEFAULT_EMAIL_ACCOUNTS = ['admin', 'accounts', 'social', 'marketing'];

type Step = 'input' | 'checking' | 'results' | 'creating' | 'analyzing' | 'success' | 'error';

export function CreateSiteWithDomainDialog({ 
  isOpen, 
  onClose, 
  onCreate, 
  tenantId 
}: CreateSiteWithDomainDialogProps) {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { importIntegrationsForApp, getNextAppColor } = useIntegrations();
  const createSiteMutation = useCreateSite();
  
  const [domain, setDomain] = useState('');
  const [step, setStep] = useState<Step>('input');
  const [domainResults, setDomainResults] = useState<DomainCheckResult[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<DomainCheckResult | null>(null);
  const [analyzedIntegrations, setAnalyzedIntegrations] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [appColor, setAppColor] = useState<string>('');

  // Parse base domain (strip TLD if present)
  const parseBaseDomain = (input: string): string => {
    const cleaned = input.toLowerCase().replace(/[^a-z0-9.-]/g, '');
    const parts = cleaned.split('.');
    // If has TLD, return just the name part
    if (parts.length > 1 && parts[parts.length - 1].length >= 2) {
      return parts.slice(0, -1).join('.');
    }
    return cleaned;
  };

  // Check all TLDs
  const checkDomainAvailability = async (baseDomain: string) => {
    setStep('checking');
    
    // Simulate API calls for all TLDs
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const results: DomainCheckResult[] = POPULAR_TLDS.map(tld => {
      // Simulate availability (random, but .test domains are unavailable)
      const isAvailable = !baseDomain.includes('test') && Math.random() > 0.25;
      const priceModifier = isAvailable && Math.random() > 0.85 ? 1.5 : 1;
      
      return {
        available: isAvailable,
        domain: `${baseDomain}${tld.tld}`,
        tld: tld.tld,
        baseDomain,
        price: Math.round(tld.basePrice * priceModifier * 100) / 100,
        isPremium: tld.premium || priceModifier > 1,
        isRecommended: tld.recommended || false,
      };
    });
    
    // Sort: available first, then by recommended, then by price
    results.sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      if (a.isRecommended !== b.isRecommended) return a.isRecommended ? -1 : 1;
      return a.price - b.price;
    });
    
    setDomainResults(results);
    setStep('results');
  };

  const handleAddToCart = (result: DomainCheckResult) => {
    addToCart({
      domain: result.domain,
      tld: result.tld,
      baseDomain: result.baseDomain,
      price: result.price,
      isPremium: result.isPremium,
    });
    setSelectedDomain(result);
    toast({
      title: 'Added to cart',
      description: `${result.domain} has been added to your cart`,
    });
  };

  const createAppAndAnalyze = async () => {
    if (!selectedDomain) return;
    
    setStep('creating');
    const color = getNextAppColor();
    setAppColor(color);
    
    try {
      // Actually create the site in Supabase
      const siteName = selectedDomain.baseDomain.charAt(0).toUpperCase() + selectedDomain.baseDomain.slice(1);
      
      const createdSite = await createSiteMutation.mutateAsync({
        name: siteName,
        domain: selectedDomain.domain,
        tenant_id: tenantId || undefined,
        status: 'demo',
        owner_type: 'admin',
        lovable_url: `https://lovable.dev/projects/${selectedDomain.baseDomain}`,
        app_color: color,
      });
      
      setStep('analyzing');
      
      // Analyze app for integrations
      const analysis = analyzeAppForIntegrations(selectedDomain.baseDomain, selectedDomain.domain);
      setAnalyzedIntegrations(analysis.detectedIntegrations);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create the app with integrations
      const appData: LinkedApp = {
        siteId: createdSite.id,
        siteName: siteName,
        domain: selectedDomain.domain,
        color,
        linkedAt: new Date().toISOString(),
      };
      
      // Import integrations for this app
      importIntegrationsForApp(analysis.detectedIntegrations, appData);
      
      // Create email accounts
      const emailAccounts: EmailAccount[] = DEFAULT_EMAIL_ACCOUNTS.map((name, index) => ({
        id: `acc-${Date.now()}-${index}`,
        tenantId,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: `${name}@${selectedDomain.domain}`,
        type: name as EmailAccount['type'],
        createdAt: new Date().toISOString(),
      }));

      const newSite: NewSiteData = {
        name: appData.siteName,
        domain: selectedDomain.domain,
        url: `https://${selectedDomain.domain}`,
        appColor: color,
        requiredIntegrations: analysis.detectedIntegrations,
      };

      onCreate(newSite, emailAccounts);
      
      setStep('success');
      
      toast({
        title: 'App created successfully!',
        description: `${analysis.detectedIntegrations.length} integrations imported. Domain pending in cart.`,
      });
    } catch (error) {
      console.error('Failed to create site:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create site');
      setStep('error');
      toast({
        title: 'Failed to create site',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setDomain('');
    setStep('input');
    setDomainResults([]);
    setSelectedDomain(null);
    setAnalyzedIntegrations([]);
    setErrorMessage('');
    setAppColor('');
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
    
    const baseDomain = parseBaseDomain(domain);
    checkDomainAvailability(baseDomain);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Create Site
          </DialogTitle>
          <DialogDescription>
            Search for a domain, add to cart, and create your app
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Domain Search Input */}
          {(step === 'input' || step === 'checking') && (
            <div className="space-y-2">
              <Label htmlFor="domain">Enter your desired domain name</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="domain"
                    placeholder="myawesomesite"
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
                  Checking availability across all extensions...
                </p>
              )}
            </div>
          )}

          {/* Domain Results */}
          {step === 'results' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Available extensions for "{parseBaseDomain(domain)}"</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setStep('input')}
                  className="text-xs"
                >
                  Search again
                </Button>
              </div>
              
              <ScrollArea className="h-[280px] pr-3">
                <div className="space-y-2">
                  {domainResults.map((result, index) => (
                    <div
                      key={result.tld}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all",
                        result.available 
                          ? selectedDomain?.domain === result.domain
                            ? "bg-primary/10 border-primary"
                            : "bg-card hover:border-primary/50"
                          : "bg-muted/30 opacity-60",
                        "animate-slide-up"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        {result.available ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-destructive" />
                        )}
                        <div>
                          <p className="font-mono font-medium text-sm">
                            {result.domain}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {result.isRecommended && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/30">
                                <Star className="h-2.5 w-2.5 mr-0.5" />
                                Recommended
                              </Badge>
                            )}
                            {result.isPremium && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-500 border-amber-500/30">
                                Premium
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {result.available ? (
                          <>
                            <div className="text-right">
                              <p className="font-semibold">${result.price.toFixed(2)}</p>
                              <p className="text-[10px] text-muted-foreground">/year</p>
                            </div>
                            {selectedDomain?.domain === result.domain ? (
                              <Badge variant="active" className="gap-1">
                                <Check className="h-3 w-3" />
                                Selected
                              </Badge>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleAddToCart(result)}
                                className="gap-1.5"
                              >
                                <ShoppingCart className="h-3.5 w-3.5" />
                                Add
                              </Button>
                            )}
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unavailable</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Creating/Analyzing */}
          {(step === 'creating' || step === 'analyzing') && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div>
                  <p className="font-medium">
                    {step === 'creating' ? 'Creating Lovable app...' : 'Analyzing integrations...'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {step === 'creating' 
                      ? `Setting up ${selectedDomain?.domain}`
                      : 'Detecting required third-party platforms'}
                  </p>
                </div>
              </div>

              {step === 'analyzing' && (
                <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">Auto-importing integrations...</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analyzedIntegrations.map((id, i) => (
                      <Badge 
                        key={id} 
                        variant="outline"
                        className="animate-scale-in"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        {id}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-3" />
                <p className="font-medium text-lg">App created successfully!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-mono">{selectedDomain?.domain}</span> is ready
                </p>
              </div>
              
              <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  <span>Domain added to cart (pending purchase)</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>4 email accounts provisioned</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>{analyzedIntegrations.length} integrations auto-imported</span>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Creation failed</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {errorMessage || 'An error occurred. Please try again.'}
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
              disabled={step === 'creating' || step === 'analyzing'}
            >
              Cancel
            </Button>
          )}
          {step === 'results' && selectedDomain && (
            <Button onClick={createAppAndAnalyze}>
              <Globe className="h-4 w-4 mr-2" />
              Create App
            </Button>
          )}
          {step === 'success' && (
            <Button onClick={handleClose}>
              Done
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
