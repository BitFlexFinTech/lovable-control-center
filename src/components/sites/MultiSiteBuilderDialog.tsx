import { useState } from 'react';
import { Layers, FileDown, Check, Loader2, Globe, Copy, CheckCheck, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { exportMultiSiteToPDF } from '@/utils/pdfExport';
import { prepareFullPrompt, MULTI_SITE_SYSTEM_PROMPT } from '@/utils/multiSiteSystemPrompt';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface MultiSiteBuilderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBuild: (sites: GeneratedSite[]) => void;
}

interface SitePrompt {
  name: string;
  prompt: string;
  domain: string;
}

interface GeneratedSite {
  id: string;
  name: string;
  domain: string;
  description: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    style: string;
  };
  features: string[];
  seoTitle: string;
  seoDescription: string;
  fullPrompt: string;
}

const SITE_COUNT_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10];

const THEME_STYLES = [
  { id: 'modern', name: 'Modern Minimal', colors: ['#0F172A', '#3B82F6'] },
  { id: 'vibrant', name: 'Vibrant Bold', colors: ['#7C3AED', '#F59E0B'] },
  { id: 'elegant', name: 'Elegant Classic', colors: ['#1F2937', '#D4AF37'] },
  { id: 'playful', name: 'Playful Fun', colors: ['#EC4899', '#06B6D4'] },
  { id: 'nature', name: 'Nature Organic', colors: ['#166534', '#84CC16'] },
  { id: 'tech', name: 'Tech Futuristic', colors: ['#0EA5E9', '#8B5CF6'] },
];

const APP_COLORS = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

export function MultiSiteBuilderDialog({ isOpen, onClose, onBuild }: MultiSiteBuilderDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState<'count' | 'prompts' | 'preview' | 'building'>('count');
  const [siteCount, setSiteCount] = useState(3);
  const [sitePrompts, setSitePrompts] = useState<SitePrompt[]>([]);
  const [generatedSites, setGeneratedSites] = useState<GeneratedSite[]>([]);
  const [buildProgress, setBuildProgress] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Initialize prompts when count changes
  const initializePrompts = () => {
    const prompts: SitePrompt[] = Array.from({ length: siteCount }, (_, i) => ({
      name: `Site ${i + 1}`,
      prompt: '',
      domain: ''
    }));
    setSitePrompts(prompts);
    setStep('prompts');
  };

  const updatePrompt = (index: number, field: keyof SitePrompt, value: string) => {
    setSitePrompts(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const generateSites = () => {
    const sites: GeneratedSite[] = sitePrompts.map((sp, i) => {
      const theme = THEME_STYLES[i % THEME_STYLES.length];
      const fullPrompt = prepareFullPrompt(sp.prompt, i);
      const domainSlug = sp.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      return {
        id: `site-${Date.now()}-${i}`,
        name: sp.name || `Site ${i + 1}`,
        domain: sp.domain || `${domainSlug}.lovable.app`,
        description: sp.prompt.slice(0, 100) + (sp.prompt.length > 100 ? '...' : ''),
        theme: {
          primaryColor: theme.colors[0],
          secondaryColor: theme.colors[1],
          fontFamily: ['Inter', 'Playfair Display', 'Space Grotesk', 'DM Sans'][i % 4],
          style: theme.id,
        },
        features: ['Responsive Design', 'SEO Optimized', 'Contact Form', 'Analytics'],
        seoTitle: `${sp.name} - Professional Solutions`,
        seoDescription: sp.prompt.slice(0, 150),
        fullPrompt,
      };
    });
    
    setGeneratedSites(sites);
    setStep('preview');
  };

  const copyPrompt = async (index: number) => {
    const site = generatedSites[index];
    await navigator.clipboard.writeText(site.fullPrompt);
    setCopiedIndex(index);
    toast({
      title: 'Prompt copied!',
      description: `Full prompt for ${site.name} copied to clipboard. Paste in Lovable to create.`,
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllPrompts = async () => {
    const allPrompts = generatedSites.map((site, i) => 
      `=== ${site.name} ===\n\n${site.fullPrompt}`
    ).join('\n\n' + '='.repeat(50) + '\n\n');
    
    await navigator.clipboard.writeText(allPrompts);
    toast({
      title: 'All prompts copied!',
      description: 'All site prompts copied to clipboard.',
    });
  };

  const handleBuild = async () => {
    if (!user) {
      toast({ title: 'Please sign in', variant: 'destructive' });
      return;
    }

    setStep('building');
    
    try {
      const { data: tenants } = await supabase.from('tenants').select('id').limit(1);
      const tenantId = tenants?.[0]?.id;
      if (!tenantId) throw new Error('No tenant found');

      const { data: existingSites } = await supabase.from('sites').select('app_color');
      const usedColors = existingSites?.map(s => s.app_color) || [];

      for (let i = 0; i < generatedSites.length; i++) {
        const site = generatedSites[i];
        setBuildProgress(((i + 1) / generatedSites.length) * 100);
        
        // Find available color
        const availableColor = APP_COLORS.find(c => !usedColors.includes(c)) || APP_COLORS[i % APP_COLORS.length];
        usedColors.push(availableColor);

        // Create site in database with pending_creation status
        const { data: createdSite, error } = await supabase.from('sites').insert({
          name: site.name,
          domain: site.domain,
          tenant_id: tenantId,
          status: 'pending_creation',
          owner_type: 'admin',
          app_color: availableColor,
        }).select().single();

        if (error) throw error;

        // Store the prompt for later reference
        await supabase.from('imported_apps').insert({
          site_id: createdSite.id,
          lovable_url: '', // Will be filled when user creates the project
          project_name: site.name,
          user_id: user.id,
        });

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      queryClient.invalidateQueries({ queryKey: ['sites'] });
      
      toast({
        title: 'Sites prepared successfully!',
        description: `${generatedSites.length} sites created as pending. Copy the prompts to create them in Lovable.`,
      });
      
      onBuild(generatedSites);
      handleClose();
    } catch (error) {
      console.error('Error creating sites:', error);
      toast({ title: 'Error creating sites', variant: 'destructive' });
      setStep('preview');
    }
  };

  const handleExportPDF = () => {
    exportMultiSiteToPDF(generatedSites);
    toast({
      title: 'PDF Generated',
      description: 'Your presentation will open in a new tab.',
    });
  };

  const handleClose = () => {
    onClose();
    setStep('count');
    setSiteCount(3);
    setSitePrompts([]);
    setGeneratedSites([]);
    setBuildProgress(0);
  };

  const allPromptsValid = sitePrompts.every(sp => sp.name.trim() && sp.prompt.trim());

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Multi-Site Builder
            {step !== 'count' && (
              <Badge variant="outline" className="ml-2">
                {siteCount} Sites
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === 'count' && 'Select how many sites you want to create'}
            {step === 'prompts' && 'Enter a prompt for each site describing what it should do'}
            {step === 'preview' && 'Review your sites and copy prompts to create in Lovable'}
            {step === 'building' && 'Creating site entries in Control Center...'}
          </DialogDescription>
        </DialogHeader>

        {/* Step: Count Selection */}
        {step === 'count' && (
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>Number of Sites</Label>
              <Select value={siteCount.toString()} onValueChange={(v) => setSiteCount(parseInt(v))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SITE_COUNT_OPTIONS.map(n => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} Sites
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[2, 5, 10].map(n => (
                <button
                  key={n}
                  onClick={() => setSiteCount(n)}
                  className={cn(
                    "p-4 rounded-lg border transition-all text-center",
                    siteCount === n 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="text-2xl font-bold">{n}</div>
                  <div className="text-xs text-muted-foreground">sites</div>
                </button>
              ))}
            </div>

            <Button className="w-full" onClick={initializePrompts}>
              <Sparkles className="h-4 w-4 mr-2" />
              Continue to Prompts
            </Button>
          </div>
        )}

        {/* Step: Per-Site Prompts */}
        {step === 'prompts' && (
          <div className="space-y-4">
            <ScrollArea className="h-[400px] -mx-6 px-6">
              <div className="space-y-6 pb-4">
                {sitePrompts.map((sp, i) => (
                  <div key={i} className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: APP_COLORS[i % APP_COLORS.length] }}
                      >
                        {i + 1}
                      </div>
                      <Label className="text-base font-medium">Site {i + 1}</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`name-${i}`} className="text-sm">Site Name</Label>
                      <Input
                        id={`name-${i}`}
                        value={sp.name}
                        onChange={(e) => updatePrompt(i, 'name', e.target.value)}
                        placeholder="e.g., My E-commerce Store"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`domain-${i}`} className="text-sm">Domain (optional)</Label>
                      <Input
                        id={`domain-${i}`}
                        value={sp.domain}
                        onChange={(e) => updatePrompt(i, 'domain', e.target.value)}
                        placeholder="e.g., mystore.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`prompt-${i}`} className="text-sm">Prompt</Label>
                      <Textarea
                        id={`prompt-${i}`}
                        value={sp.prompt}
                        onChange={(e) => updatePrompt(i, 'prompt', e.target.value)}
                        placeholder="Describe what this site should do, its features, target audience, etc..."
                        rows={4}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setStep('count')}>
                Back
              </Button>
              <Button 
                className="flex-1" 
                onClick={generateSites}
                disabled={!allPromptsValid}
              >
                Generate Sites
              </Button>
            </div>
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Copy each prompt and paste it in Lovable to create the project
              </p>
              <Button variant="outline" size="sm" onClick={copyAllPrompts}>
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy All
              </Button>
            </div>

            <ScrollArea className="h-[350px] -mx-6 px-6">
              <div className="grid gap-4">
                {generatedSites.map((site, i) => (
                  <div
                    key={site.id}
                    className="p-4 rounded-lg border border-border hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-10 w-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: site.theme.primaryColor }}
                        >
                          <Globe className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium">{site.name}</h4>
                          <p className="text-sm text-muted-foreground">{site.domain}</p>
                        </div>
                      </div>
                      <Button 
                        variant={copiedIndex === i ? "default" : "outline"} 
                        size="sm"
                        onClick={() => copyPrompt(i)}
                      >
                        {copiedIndex === i ? (
                          <>
                            <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 mr-1.5" />
                            Copy Prompt
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{site.description}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-muted-foreground">Theme:</span>
                      <div 
                        className="h-4 w-4 rounded-full border"
                        style={{ backgroundColor: site.theme.primaryColor }}
                      />
                      <div 
                        className="h-4 w-4 rounded-full border"
                        style={{ backgroundColor: site.theme.secondaryColor }}
                      />
                      <span className="text-xs font-mono">{site.theme.fontFamily}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {site.features.map(f => (
                        <Badge key={f} variant="secondary" className="text-xs">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" className="flex-1 gap-2" onClick={handleExportPDF}>
                <FileDown className="h-4 w-4" />
                Export PDF
              </Button>
              <Button className="flex-1 gap-2" onClick={handleBuild}>
                <Layers className="h-4 w-4" />
                Create in Control Center
              </Button>
            </div>
          </div>
        )}

        {/* Step: Building */}
        {step === 'building' && (
          <div className="py-8 space-y-6">
            <div className="text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <h3 className="text-lg font-medium">Creating {generatedSites.length} Sites</h3>
              <p className="text-sm text-muted-foreground">Setting up site entries...</p>
            </div>

            <div className="space-y-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${buildProgress}%` }}
                />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                {Math.round(buildProgress)}% Complete
              </p>
            </div>

            <div className="space-y-2">
              {generatedSites.map((site, i) => {
                const isComplete = (i + 1) / generatedSites.length * 100 <= buildProgress;
                return (
                  <div 
                    key={site.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg transition-all",
                      isComplete ? "bg-status-active/10" : "bg-muted/50"
                    )}
                  >
                    {isComplete ? (
                      <Check className="h-4 w-4 text-status-active" />
                    ) : (
                      <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                    )}
                    <span className={cn(
                      "text-sm",
                      isComplete ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {site.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
