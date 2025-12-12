import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Import, Loader2, Check, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

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
  const [step, setStep] = useState<'url' | 'integrations' | 'importing'>('url');
  const [lovableUrl, setLovableUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Extract project name from Lovable URL
  const parseUrl = (url: string) => {
    // Handle various Lovable URL formats
    const patterns = [
      /lovable\.dev\/projects\/([^\/\?]+)/,
      /([^\/\.]+)\.lovable\.app/,
      /lovable\.app\/([^\/\?]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    // Fallback: just use the URL as-is for the name
    return url.replace(/https?:\/\//, '').split('/')[0].split('.')[0];
  };

  const handleUrlSubmit = async () => {
    if (!lovableUrl.trim()) {
      toast({ title: 'Please enter a Lovable project URL', variant: 'destructive' });
      return;
    }

    const name = parseUrl(lovableUrl);
    setProjectName(name);

    // Fetch available integrations
    setIsLoading(true);
    const { data } = await supabase.from('integrations').select('*').order('category');
    setIntegrations(data || []);
    setIsLoading(false);
    setStep('integrations');
  };

  const handleImport = async () => {
    if (!user) {
      toast({ title: 'Please sign in to import apps', variant: 'destructive' });
      return;
    }

    setStep('importing');
    setIsLoading(true);

    try {
      // Get next available color
      const { data: existingSites } = await supabase.from('sites').select('app_color');
      const usedColors = existingSites?.map(s => s.app_color) || [];
      const availableColor = APP_COLORS.find(c => !usedColors.includes(c)) || APP_COLORS[0];

      // Get default tenant
      const { data: tenants } = await supabase.from('tenants').select('id').limit(1);
      const tenantId = tenants?.[0]?.id;

      if (!tenantId) {
        throw new Error('No tenant found');
      }

      // Create the site
      const domain = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.lovable.app`;
      const { data: site, error: siteError } = await supabase.from('sites').insert({
        name: projectName.charAt(0).toUpperCase() + projectName.slice(1).replace(/-/g, ' '),
        domain,
        tenant_id: tenantId,
        status: 'demo',
        owner_type: 'admin',
        lovable_url: lovableUrl,
        app_color: availableColor,
      }).select().single();

      if (siteError) throw siteError;

      // Create imported_apps record
      await supabase.from('imported_apps').insert({
        site_id: site.id,
        lovable_url: lovableUrl,
        project_name: projectName,
        user_id: user.id,
      });

      // Create site_integrations and credentials for selected integrations
      for (const integrationId of selectedIntegrations) {
        const integration = integrations.find(i => i.id === integrationId);
        if (!integration) continue;

        // Link integration to site
        await supabase.from('site_integrations').insert({
          site_id: site.id,
          integration_id: integrationId,
          status: 'pending',
        });

        // Generate demo credentials
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
        description: `${projectName} has been added with ${selectedIntegrations.length} integrations`,
      });

      queryClient.invalidateQueries({ queryKey: ['sites'] });
      onOpenChange(false);
      resetDialog();
    } catch (error) {
      console.error('Import error:', error);
      toast({ 
        title: 'Import failed', 
        description: (error as Error).message,
        variant: 'destructive' 
      });
      setStep('integrations');
    } finally {
      setIsLoading(false);
    }
  };

  const resetDialog = () => {
    setStep('url');
    setLovableUrl('');
    setProjectName('');
    setSelectedIntegrations([]);
  };

  const toggleIntegration = (id: string) => {
    setSelectedIntegrations(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Group integrations by category
  const groupedIntegrations = integrations.reduce((acc, int) => {
    if (!acc[int.category]) acc[int.category] = [];
    acc[int.category].push(int);
    return acc;
  }, {} as Record<string, Integration[]>);

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetDialog(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Import className="h-5 w-5 text-primary" />
            Import Lovable App
          </DialogTitle>
          <DialogDescription>
            {step === 'url' && 'Enter your Lovable project URL to import it into Control Center'}
            {step === 'integrations' && 'Select the integrations your app uses'}
            {step === 'importing' && 'Importing your app...'}
          </DialogDescription>
        </DialogHeader>

        {step === 'url' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lovable-url">Lovable Project URL</Label>
              <Input
                id="lovable-url"
                placeholder="https://myproject.lovable.app or https://lovable.dev/projects/my-project"
                value={lovableUrl}
                onChange={(e) => setLovableUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Paste the URL from your Lovable project
              </p>
            </div>
            <Button onClick={handleUrlSubmit} className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Continue
            </Button>
          </div>
        )}

        {step === 'integrations' && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <ExternalLink className="h-4 w-4 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{projectName}</p>
                <p className="text-xs text-muted-foreground truncate">{lovableUrl}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Integrations</Label>
              <ScrollArea className="h-[280px] rounded-md border p-3">
                {Object.entries(groupedIntegrations).map(([category, ints]) => (
                  <div key={category} className="mb-4 last:mb-0">
                    <p className="text-xs font-medium text-muted-foreground mb-2">{category}</p>
                    <div className="space-y-1">
                      {ints.map((int) => (
                        <label
                          key={int.id}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedIntegrations.includes(int.id)}
                            onCheckedChange={() => toggleIntegration(int.id)}
                          />
                          <span className="text-lg">{int.icon}</span>
                          <span className="text-sm">{int.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('url')} className="flex-1">
                Back
              </Button>
              <Button onClick={handleImport} className="flex-1">
                Import App
                {selectedIntegrations.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedIntegrations.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="py-8 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-medium">Importing {projectName}</p>
              <p className="text-sm text-muted-foreground">
                Creating site and generating demo credentials...
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
