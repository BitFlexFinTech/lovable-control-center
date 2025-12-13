import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Github, FileJson, Loader2, Check, AlertCircle, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { parsePackageJson, parseGitHubUrl } from '@/utils/dependencyParser';

interface ResyncIntegrationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: {
    id: string;
    name: string;
    domain?: string;
  };
  currentIntegrations: string[];
}

interface Integration {
  id: string;
  name: string;
  icon: string;
  category: string;
}

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

export function ResyncIntegrationsDialog({ 
  open, 
  onOpenChange, 
  site,
  currentIntegrations 
}: ResyncIntegrationsDialogProps) {
  const queryClient = useQueryClient();
  const [githubUrl, setGithubUrl] = useState('');
  const [packageJsonContent, setPackageJsonContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [detectedIntegrations, setDetectedIntegrations] = useState<string[]>([]);
  const [matchedPackages, setMatchedPackages] = useState<{ package: string; integration: string }[]>([]);
  const [availableIntegrations, setAvailableIntegrations] = useState<Integration[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const newIntegrations = detectedIntegrations.filter(id => !currentIntegrations.includes(id));
  const removedIntegrations = currentIntegrations.filter(id => !detectedIntegrations.includes(id));
  const unchangedIntegrations = detectedIntegrations.filter(id => currentIntegrations.includes(id));

  const handleFetchFromGitHub = async () => {
    if (!githubUrl.trim()) {
      toast({ title: 'Please enter a GitHub URL', variant: 'destructive' });
      return;
    }

    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) {
      toast({ title: 'Invalid GitHub URL', description: 'Expected format: https://github.com/owner/repo', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-github-deps', {
        body: { githubUrl },
      });

      if (error) throw error;

      if (data.error) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
        return;
      }

      setDetectedIntegrations(data.detectedIntegrations);
      setMatchedPackages(data.matchedPackages);
      
      // Fetch available integrations for display
      const { data: integrations } = await supabase.from('integrations').select('*');
      setAvailableIntegrations(integrations || []);
      setHasAnalyzed(true);

      toast({ 
        title: 'Dependencies analyzed!',
        description: `Found ${data.detectedIntegrations.length} integrations from ${data.totalDependencies} packages`,
      });
    } catch (error) {
      console.error('Error fetching from GitHub:', error);
      toast({ title: 'Failed to fetch from GitHub', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleParsePackageJson = async () => {
    if (!packageJsonContent.trim()) {
      toast({ title: 'Please paste your package.json content', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const result = parsePackageJson(packageJsonContent);
      
      if (result.detectedIntegrations.length === 0 && result.allDependencies.length === 0) {
        toast({ title: 'Invalid JSON', description: 'Could not parse package.json content', variant: 'destructive' });
        return;
      }

      setDetectedIntegrations(result.detectedIntegrations);
      setMatchedPackages(result.matchedPackages);

      // Fetch available integrations for display
      const { data: integrations } = await supabase.from('integrations').select('*');
      setAvailableIntegrations(integrations || []);
      setHasAnalyzed(true);

      toast({ 
        title: 'Dependencies parsed!',
        description: `Found ${result.detectedIntegrations.length} integrations from ${result.allDependencies.length} packages`,
      });
    } catch (error) {
      console.error('Error parsing package.json:', error);
      toast({ title: 'Failed to parse package.json', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const domain = site.domain || `${site.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.lovable.app`;

      // Add new integrations
      for (const integrationId of newIntegrations) {
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
        title: 'Integrations synced!',
        description: `Added ${newIntegrations.length} new integrations to ${site.name}`,
      });

      queryClient.invalidateQueries({ queryKey: ['site-integrations'] });
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
      onOpenChange(false);
      resetDialog();
    } catch (error) {
      console.error('Error syncing integrations:', error);
      toast({ title: 'Failed to sync integrations', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetDialog = () => {
    setGithubUrl('');
    setPackageJsonContent('');
    setDetectedIntegrations([]);
    setMatchedPackages([]);
    setHasAnalyzed(false);
  };

  const getIntegrationName = (id: string) => {
    return availableIntegrations.find(i => i.id === id)?.name || id;
  };

  const getIntegrationIcon = (id: string) => {
    return availableIntegrations.find(i => i.id === id)?.icon || '📦';
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetDialog(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Re-Sync Integrations
          </DialogTitle>
          <DialogDescription>
            Analyze {site.name}'s dependencies to detect and sync required integrations
          </DialogDescription>
        </DialogHeader>

        {!hasAnalyzed ? (
          <Tabs defaultValue="github" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="github" className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                GitHub
              </TabsTrigger>
              <TabsTrigger value="paste" className="flex items-center gap-2">
                <FileJson className="h-4 w-4" />
                Paste JSON
              </TabsTrigger>
            </TabsList>

            <TabsContent value="github" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>GitHub Repository URL</Label>
                <Input
                  placeholder="https://github.com/username/my-project"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Repository must be public. We'll fetch and analyze package.json automatically.
                </p>
              </div>
              <Button onClick={handleFetchFromGitHub} className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Github className="h-4 w-4 mr-2" />}
                Fetch Dependencies
              </Button>
            </TabsContent>

            <TabsContent value="paste" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>package.json Content</Label>
                <Textarea
                  placeholder='{"dependencies": {"@stripe/stripe-js": "^1.0.0", ...}}'
                  value={packageJsonContent}
                  onChange={(e) => setPackageJsonContent(e.target.value)}
                  className="h-32 font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Paste the contents of your project's package.json file
                </p>
              </div>
              <Button onClick={handleParsePackageJson} className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileJson className="h-4 w-4 mr-2" />}
                Parse Dependencies
              </Button>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            {/* Analysis Results */}
            <div className="space-y-3">
              {/* Matched Packages */}
              {matchedPackages.length > 0 && (
                <div className="rounded-lg border p-3 bg-muted/30">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Detected from packages:</p>
                  <div className="flex flex-wrap gap-1">
                    {matchedPackages.map(({ package: pkg, integration }) => (
                      <Badge key={pkg} variant="outline" className="text-xs">
                        {pkg} → {integration}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* New Integrations */}
              {newIntegrations.length > 0 && (
                <div className="rounded-lg border border-green-500/30 p-3 bg-green-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Plus className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-medium text-green-600">New Integrations ({newIntegrations.length})</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newIntegrations.map(id => (
                      <Badge key={id} className="bg-green-500/20 text-green-700 border-green-500/30">
                        {getIntegrationIcon(id)} {getIntegrationName(id)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Unchanged */}
              {unchangedIntegrations.length > 0 && (
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">Already Linked ({unchangedIntegrations.length})</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {unchangedIntegrations.map(id => (
                      <Badge key={id} variant="secondary">
                        {getIntegrationIcon(id)} {getIntegrationName(id)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* No new integrations found */}
              {newIntegrations.length === 0 && hasAnalyzed && (
                <div className="rounded-lg border p-4 text-center">
                  <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="font-medium">All integrations already synced!</p>
                  <p className="text-sm text-muted-foreground">No new integrations were detected.</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setHasAnalyzed(false)} className="flex-1">
                Re-Analyze
              </Button>
              <Button 
                onClick={handleSync} 
                className="flex-1" 
                disabled={isLoading || newIntegrations.length === 0}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Sync {newIntegrations.length} New
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
