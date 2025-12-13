import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Import, Loader2, Check, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { analyzeAppForIntegrations } from '@/utils/integrationAnalyzer';

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
  const [step, setStep] = useState<'url' | 'preview' | 'importing'>('url');
  const [lovableUrl, setLovableUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [detectedIntegrations, setDetectedIntegrations] = useState<string[]>([]);
  const [appType, setAppType] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [availableIntegrations, setAvailableIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Extract project name from URL - prioritize readable names over UUIDs
  const parseUrl = (url: string): string => {
    // Try to get project slug from various URL patterns
    const patterns = [
      // lovable.dev/projects/my-project-name or lovable.dev/projects/uuid
      /lovable\.dev\/projects\/([^\/\?\#]+)/,
      // my-project.lovable.app
      /([^\/\.]+)\.lovable\.app/,
      // lovable.app/my-project
      /lovable\.app\/([^\/\?\#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        const slug = match[1];
        // Check if it's a UUID pattern - if so, try to get a better name
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidPattern.test(slug)) {
          // Return a formatted version but user can edit
          return 'My Lovable Project';
        }
        // Convert slug to readable name: my-project-name -> My Project Name
        return slug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
    
    // Fallback: extract something meaningful from the URL
    const cleanUrl = url.replace(/https?:\/\//, '');
    const firstPart = cleanUrl.split('/')[0].split('.')[0];
    
    // If it looks like a UUID, use default name
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

    // Auto-detect integrations
    const domain = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.lovable.app`;
    const analysis = analyzeAppForIntegrations(name, domain);
    setDetectedIntegrations(analysis.detectedIntegrations);
    setAppType(analysis.appType);
    setConfidence(analysis.confidence);

    // Fetch available integrations from DB
    const { data } = await supabase.from('integrations').select('*').order('category');
    setAvailableIntegrations(data || []);
    
    setIsLoading(false);
    setStep('preview');
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
        name: projectName.charAt(0).toUpperCase() + projectName.slice(1).replace(/-/g, ' '),
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

      // Auto-import ALL detected integrations
      for (const integrationId of detectedIntegrations) {
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
        description: `${projectName} imported with ${detectedIntegrations.length} integrations auto-detected`,
      });

      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      onOpenChange(false);
      resetDialog();
    } catch (error) {
      console.error('Import error:', error);
      toast({ title: 'Import failed', description: (error as Error).message, variant: 'destructive' });
      setStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  const resetDialog = () => {
    setStep('url');
    setLovableUrl('');
    setProjectName('');
    setDetectedIntegrations([]);
  };

  const matchedIntegrations = availableIntegrations.filter(i => detectedIntegrations.includes(i.id));

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
            {step === 'preview' && 'Review detected integrations before importing'}
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
            </Button>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4 py-4">
            {/* Editable Project Name */}
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
              />
              <p className="text-xs text-muted-foreground">This name will be used to identify the site in Control Center</p>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-start gap-3">
                <ExternalLink className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{projectName || 'Untitled Project'}</p>
                  <p className="text-xs text-muted-foreground truncate">{lovableUrl}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="capitalize">{appType} app</Badge>
                    <Badge variant="outline">{Math.round(confidence * 100)}% confidence</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <Label>Auto-Detected Integrations ({matchedIntegrations.length})</Label>
              </div>
              <ScrollArea className="h-[200px] rounded-md border p-3">
                {matchedIntegrations.length > 0 ? (
                  <div className="space-y-2">
                    {matchedIntegrations.map((int) => (
                      <div key={int.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                        <Check className="h-4 w-4 text-status-active" />
                        <span className="text-lg">{int.icon}</span>
                        <span className="text-sm font-medium">{int.name}</span>
                        <Badge variant="secondary" className="ml-auto text-xs">{int.category}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground p-4">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">No integrations detected</span>
                  </div>
                )}
              </ScrollArea>
              <p className="text-xs text-muted-foreground">All detected integrations will be automatically imported with demo credentials</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('url')} className="flex-1">Back</Button>
              <Button onClick={handleImport} className="flex-1">
                Import App
                <Badge variant="secondary" className="ml-2">{matchedIntegrations.length}</Badge>
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
              <p className="text-sm text-muted-foreground">Auto-importing {detectedIntegrations.length} integrations...</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
