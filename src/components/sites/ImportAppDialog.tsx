import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Import, Loader2, Check, ExternalLink, Sparkles, AlertCircle, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { analyzeAppForIntegrations, APP_CATEGORY_BUNDLES } from '@/utils/integrationAnalyzer';

interface ImportAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Integration {
  id: string;
  name: string;
  icon: string;
  category: string;
}

const APP_COLORS = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
  for (let i = 0; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export function ImportAppDialog({ open, onOpenChange }: ImportAppDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'url' | 'configure' | 'importing'>('url');
  const [lovableUrl, setLovableUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('other');
  const [selectedIntegrations, setSelectedIntegrations] = useState<Set<string>>(new Set());
  const [availableIntegrations, setAvailableIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoDetected, setAutoDetected] = useState<string[]>([]);

  // Extract project name from URL
  const parseUrl = (url: string): string => {
    const patterns = [
      /lovable\.dev\/projects\/([^\/\?\#]+)/,
      /([^\/\.]+)\.lovable\.app/,
      /lovable\.app\/([^\/\?\#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        const slug = match[1];
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidPattern.test(slug)) {
          return 'My Lovable Project';
        }
        return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }
    }
    
    const cleanUrl = url.replace(/https?:\/\//, '');
    const firstPart = cleanUrl.split('/')[0].split('.')[0];
    const uuidPattern = /^[0-9a-f]{8}/i;
    if (uuidPattern.test(firstPart)) {
      return 'My Lovable Project';
    }
    
    return firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
  };

  const handleUrlSubmit = async () => {
    if (!lovableUrl.trim()) {
      toast({ title: 'Please enter a Lovable project URL', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    const name = parseUrl(lovableUrl);
    setProjectName(name);

    // Auto-detect integrations from name
    const domain = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.lovable.app`;
    const analysis = analyzeAppForIntegrations(name, domain);
    setAutoDetected(analysis.detectedIntegrations);
    setSelectedIntegrations(new Set(analysis.detectedIntegrations));

    // Fetch available integrations from DB
    const { data } = await supabase.from('integrations').select('*').order('category');
    setAvailableIntegrations(data || []);
    
    setIsLoading(false);
    setStep('configure');
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const bundle = APP_CATEGORY_BUNDLES[category];
    if (bundle) {
      // Merge category integrations with auto-detected ones
      const newSet = new Set([...autoDetected, ...bundle.integrations]);
      setSelectedIntegrations(newSet);
    }
  };

  const toggleIntegration = (integrationId: string) => {
    setSelectedIntegrations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(integrationId)) {
        newSet.delete(integrationId);
      } else {
        newSet.add(integrationId);
      }
      return newSet;
    });
  };

  const handleImport = async () => {
    if (!user) {
      toast({ title: 'Please sign in to import apps', variant: 'destructive' });
      return;
    }

    setStep('importing');
    setIsLoading(true);

    try {
      const { data: existingSites } = await supabase.from('sites').select('app_color');
      const usedColors = existingSites?.map(s => s.app_color) || [];
      const availableColor = APP_COLORS.find(c => !usedColors.includes(c)) || APP_COLORS[0];

      const { data: tenants } = await supabase.from('tenants').select('id').limit(1);
      const tenantId = tenants?.[0]?.id;
      if (!tenantId) throw new Error('No tenant found');

      const domain = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.lovable.app`;
      const { data: site, error: siteError } = await supabase.from('sites').insert({
        name: projectName,
        domain,
        tenant_id: tenantId,
        status: 'demo',
        owner_type: 'admin',
        lovable_url: lovableUrl,
        app_color: availableColor,
      }).select().single();

      if (siteError) throw siteError;

      await supabase.from('imported_apps').insert({
        site_id: site.id,
        lovable_url: lovableUrl,
        project_name: projectName,
        user_id: user.id,
      });

      // Import selected integrations
      const integrationIds = Array.from(selectedIntegrations);
      for (const integrationId of integrationIds) {
        const integration = availableIntegrations.find(i => i.id === integrationId);
        if (!integration) continue;

        await supabase.from('site_integrations').insert({
          site_id: site.id,
          integration_id: integrationId,
          status: 'imported',
        });

        await supabase.from('credentials').insert({
          site_id: site.id,
          integration_id: integrationId,
          email: `${integrationId}@${domain}`,
          password: generatePassword(),
          status: 'demo',
        });
      }

      toast({ 
        title: 'App imported successfully!',
        description: `${projectName} imported with ${integrationIds.length} integrations`,
      });

      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      onOpenChange(false);
      resetDialog();
    } catch (error) {
      console.error('Import error:', error);
      toast({ title: 'Import failed', description: (error as Error).message, variant: 'destructive' });
      setStep('configure');
    } finally {
      setIsLoading(false);
    }
  };

  const resetDialog = () => {
    setStep('url');
    setLovableUrl('');
    setProjectName('');
    setSelectedCategory('other');
    setSelectedIntegrations(new Set());
    setAutoDetected([]);
  };

  // Group integrations by category for display
  const integrationsByCategory = availableIntegrations.reduce((acc, int) => {
    if (!acc[int.category]) acc[int.category] = [];
    acc[int.category].push(int);
    return acc;
  }, {} as Record<string, Integration[]>);

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetDialog(); }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Import className="h-5 w-5 text-primary" />
            Import Lovable App
          </DialogTitle>
          <DialogDescription>
            {step === 'url' && 'Enter your Lovable project URL to import it into Control Center'}
            {step === 'configure' && 'Configure project details and select integrations'}
            {step === 'importing' && 'Importing your app...'}
          </DialogDescription>
        </DialogHeader>

        {step === 'url' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lovable-url">Lovable Project URL</Label>
              <Input
                id="lovable-url"
                placeholder="https://lovable.dev/projects/your-project-id"
                value={lovableUrl}
                onChange={(e) => setLovableUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Paste the URL from your Lovable project</p>
            </div>
            <Button onClick={handleUrlSubmit} className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Analyze & Continue
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 'configure' && (
          <div className="space-y-4 py-4">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>

            {/* App Category Selector */}
            <div className="space-y-2">
              <Label>App Category</Label>
              <RadioGroup value={selectedCategory} onValueChange={handleCategoryChange} className="grid gap-2">
                {Object.entries(APP_CATEGORY_BUNDLES).map(([key, bundle]) => (
                  <div key={key} className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={key} id={key} />
                    <Label htmlFor={key} className="flex-1 cursor-pointer">
                      <span className="font-medium">{bundle.label}</span>
                      <span className="text-xs text-muted-foreground block">{bundle.description}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Integration Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <Label>Select Integrations</Label>
                </div>
                <Badge variant="secondary">{selectedIntegrations.size} selected</Badge>
              </div>
              <ScrollArea className="h-[200px] rounded-md border p-3">
                <div className="space-y-4">
                  {Object.entries(integrationsByCategory).map(([category, integrations]) => (
                    <div key={category}>
                      <p className="text-xs font-medium text-muted-foreground uppercase mb-2">{category}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {integrations.map((int) => (
                          <div
                            key={int.id}
                            className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                              selectedIntegrations.has(int.id)
                                ? 'bg-primary/10 border-primary/30'
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => toggleIntegration(int.id)}
                          >
                            <Checkbox
                              checked={selectedIntegrations.has(int.id)}
                              onCheckedChange={() => toggleIntegration(int.id)}
                            />
                            <span className="text-base">{int.icon}</span>
                            <span className="text-sm font-medium truncate">{int.name}</span>
                            {autoDetected.includes(int.id) && (
                              <Badge variant="outline" className="ml-auto text-[10px] px-1">auto</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <p className="text-xs text-muted-foreground">Select all integrations your app uses. Demo credentials will be auto-generated.</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('url')} className="flex-1">Back</Button>
              <Button onClick={handleImport} className="flex-1" disabled={selectedIntegrations.size === 0}>
                Import App
                <Badge variant="secondary" className="ml-2">{selectedIntegrations.size}</Badge>
              </Button>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="py-8 flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-medium">Importing {projectName}</p>
              <p className="text-sm text-muted-foreground">Creating {selectedIntegrations.size} integration credentials...</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
