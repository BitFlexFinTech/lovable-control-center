import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Import, Loader2, Check, Github, FileJson, ChevronDown, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { parsePackageJson, parseGitHubUrl } from '@/utils/dependencyParser';
import { useDebounce } from '@/hooks/useDebounce';

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
  const [step, setStep] = useState<'url' | 'importing'>('url');
  const [lovableUrl, setLovableUrl] = useState('');
  const [projectName, setProjectName] = useState('');
  const [userEditedName, setUserEditedName] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [packageJsonContent, setPackageJsonContent] = useState('');
  const [selectedIntegrations, setSelectedIntegrations] = useState<Set<string>>(new Set());
  const [availableIntegrations, setAvailableIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isFetchingName, setIsFetchingName] = useState(false);
  const [autoDetected, setAutoDetected] = useState<string[]>([]);
  const [matchedPackages, setMatchedPackages] = useState<{ package: string; integration: string }[]>([]);
  const [detectionMethod, setDetectionMethod] = useState<'none' | 'github' | 'paste'>('none');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Debounce the lovable URL to avoid too many API calls
  const debouncedLovableUrl = useDebounce(lovableUrl, 500);

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

  const fetchAvailableIntegrations = async () => {
    const { data } = await supabase.from('integrations').select('*').order('category');
    setAvailableIntegrations(data || []);
    return data || [];
  };

  // Auto-fetch project name from Lovable when URL changes
  const fetchProjectNameFromLovable = useCallback(async (url: string) => {
    if (!url || userEditedName) return;
    
    // Check if it's a valid Lovable URL
    if (!url.includes('lovable.dev/projects/') && !url.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)) {
      return;
    }

    setIsFetchingName(true);
    try {
      console.log('Fetching project name from Lovable for:', url);
      const { data, error } = await supabase.functions.invoke('fetch-lovable-project', {
        body: { lovableUrl: url },
      });

      if (error) {
        console.error('Error fetching from Lovable:', error);
        return;
      }

      console.log('Lovable project fetch result:', data);

      if (data?.projectName && !userEditedName) {
        setProjectName(data.projectName);
        toast({ 
          title: 'Project name detected!', 
          description: `Found: ${data.projectName}` 
        });
      }
    } catch (error) {
      console.error('Error fetching project name:', error);
    } finally {
      setIsFetchingName(false);
    }
  }, [userEditedName]);

  // Effect to auto-fetch when debounced URL changes
  useEffect(() => {
    if (debouncedLovableUrl && !userEditedName) {
      fetchProjectNameFromLovable(debouncedLovableUrl);
    }
  }, [debouncedLovableUrl, fetchProjectNameFromLovable, userEditedName]);

  const handleDetectFromGitHub = async () => {
    if (!githubUrl.trim()) {
      toast({ title: 'Please enter a GitHub URL', variant: 'destructive' });
      return;
    }

    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) {
      toast({ title: 'Invalid GitHub URL', description: 'Expected format: https://github.com/owner/repo', variant: 'destructive' });
      return;
    }

    setIsDetecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-github-deps', {
        body: { githubUrl },
      });

      if (error) throw error;

      if (data.error) {
        toast({ title: 'Error', description: data.hint || data.error, variant: 'destructive' });
        return;
      }

      setAutoDetected(data.detectedIntegrations);
      setMatchedPackages(data.matchedPackages);
      setSelectedIntegrations(new Set(data.detectedIntegrations));
      setDetectionMethod('github');
      
      // Prioritize GitHub-detected name over URL-parsed fallback (unless user manually edited)
      if (!userEditedName) {
        const githubName = data.projectName || data.repoName?.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
        if (githubName) {
          setProjectName(githubName);
        }
      }

      await fetchAvailableIntegrations();

      toast({ 
        title: 'Integrations detected!',
        description: `Found ${data.detectedIntegrations.length} integrations from ${data.totalDependencies} packages`,
      });
    } catch (error) {
      console.error('Error detecting from GitHub:', error);
      toast({ title: 'Failed to fetch from GitHub', variant: 'destructive' });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleDetectFromPackageJson = async () => {
    if (!packageJsonContent.trim()) {
      toast({ title: 'Please paste your package.json content', variant: 'destructive' });
      return;
    }

    setIsDetecting(true);
    try {
      const result = parsePackageJson(packageJsonContent);
      
      if (result.detectedIntegrations.length === 0 && result.allDependencies.length === 0) {
        toast({ title: 'Invalid JSON', description: 'Could not parse package.json content', variant: 'destructive' });
        return;
      }

      setAutoDetected(result.detectedIntegrations);
      setMatchedPackages(result.matchedPackages);
      setSelectedIntegrations(new Set(result.detectedIntegrations));
      setDetectionMethod('paste');

      await fetchAvailableIntegrations();

      toast({ 
        title: 'Integrations detected!',
        description: `Found ${result.detectedIntegrations.length} integrations from ${result.allDependencies.length} packages`,
      });
    } catch (error) {
      console.error('Error parsing package.json:', error);
      toast({ title: 'Failed to parse package.json', variant: 'destructive' });
    } finally {
      setIsDetecting(false);
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

    if (!lovableUrl.trim()) {
      toast({ title: 'Please enter a Lovable project URL', variant: 'destructive' });
      return;
    }

    const name = projectName.trim() || parseUrl(lovableUrl);

    setStep('importing');
    setIsLoading(true);

    try {
      // Get available integrations if not already loaded
      let integrations = availableIntegrations;
      if (integrations.length === 0) {
        integrations = await fetchAvailableIntegrations();
      }

      // If no detection was done, import ALL integrations
      let integrationsToImport = Array.from(selectedIntegrations);
      if (detectionMethod === 'none') {
        integrationsToImport = integrations.map(i => i.id);
      }

      const { data: existingSites } = await supabase.from('sites').select('app_color');
      const usedColors = existingSites?.map(s => s.app_color) || [];
      const availableColor = APP_COLORS.find(c => !usedColors.includes(c)) || APP_COLORS[0];

      const { data: tenants } = await supabase.from('tenants').select('id').limit(1);
      const tenantId = tenants?.[0]?.id;
      if (!tenantId) throw new Error('No tenant found');

      const domain = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.lovable.app`;
      const { data: site, error: siteError } = await supabase.from('sites').insert({
        name,
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
        project_name: name,
        user_id: user.id,
      });

      // Import integrations
      for (const integrationId of integrationsToImport) {
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
        description: `${name} imported with ${integrationsToImport.length} integrations`,
      });

      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['site-integrations'] });
      onOpenChange(false);
      resetDialog();
    } catch (error) {
      console.error('Import error:', error);
      toast({ title: 'Import failed', description: (error as Error).message, variant: 'destructive' });
      setStep('url');
    } finally {
      setIsLoading(false);
    }
  };

  const resetDialog = () => {
    setStep('url');
    setLovableUrl('');
    setProjectName('');
    setUserEditedName(false);
    setGithubUrl('');
    setPackageJsonContent('');
    setSelectedIntegrations(new Set());
    setAutoDetected([]);
    setMatchedPackages([]);
    setDetectionMethod('none');
    setShowAdvanced(false);
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
            {step === 'url' && 'Import your Lovable project with auto-detected integrations'}
            {step === 'importing' && 'Importing your app...'}
          </DialogDescription>
        </DialogHeader>

        {step === 'url' && (
          <div className="space-y-4 py-4">
            {/* Required: Lovable URL */}
            <div className="space-y-2">
              <Label htmlFor="lovable-url">Lovable Project URL *</Label>
              <Input
                id="lovable-url"
                placeholder="https://lovable.dev/projects/your-project-id"
                value={lovableUrl}
                onChange={(e) => {
                  setLovableUrl(e.target.value);
                  if (projectName === '' && e.target.value) {
                    setProjectName(parseUrl(e.target.value));
                  }
                }}
              />
            </div>

            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="project-name"
                    placeholder="My Awesome App"
                    value={projectName}
                    onChange={(e) => {
                      setProjectName(e.target.value);
                      setUserEditedName(true);
                    }}
                    className={isFetchingName ? 'pr-10' : ''}
                  />
                  {isFetchingName && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setUserEditedName(false);
                    fetchProjectNameFromLovable(lovableUrl);
                  }}
                  disabled={isFetchingName || !lovableUrl}
                  title="Refresh name from Lovable"
                >
                  <RefreshCw className={`h-4 w-4 ${isFetchingName ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              {isFetchingName && (
                <p className="text-xs text-muted-foreground">Fetching project name from Lovable...</p>
              )}
            </div>

            {/* Auto-Detection Section */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between px-3 py-2 h-auto">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Auto-Detect Integrations (Optional)</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="rounded-lg border p-3 space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Provide your GitHub repo or package.json to auto-detect integrations. 
                    Skip this to import all available integrations.
                  </p>

                  <Tabs defaultValue="github" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="github" className="text-xs">
                        <Github className="h-3 w-3 mr-1" />
                        GitHub
                      </TabsTrigger>
                      <TabsTrigger value="paste" className="text-xs">
                        <FileJson className="h-3 w-3 mr-1" />
                        Paste JSON
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="github" className="space-y-2 mt-2">
                      <Input
                        placeholder="https://github.com/username/repo"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="text-sm"
                      />
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={handleDetectFromGitHub} 
                        disabled={isDetecting}
                        className="w-full"
                      >
                        {isDetecting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Github className="h-3 w-3 mr-1" />}
                        Detect from GitHub
                      </Button>
                    </TabsContent>

                    <TabsContent value="paste" className="space-y-2 mt-2">
                      <Textarea
                        placeholder='{"dependencies": {...}}'
                        value={packageJsonContent}
                        onChange={(e) => setPackageJsonContent(e.target.value)}
                        className="h-20 font-mono text-xs"
                      />
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={handleDetectFromPackageJson} 
                        disabled={isDetecting}
                        className="w-full"
                      >
                        {isDetecting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <FileJson className="h-3 w-3 mr-1" />}
                        Parse package.json
                      </Button>
                    </TabsContent>
                  </Tabs>

                  {/* Detection Results */}
                  {detectionMethod !== 'none' && autoDetected.length > 0 && (
                    <div className="rounded-md border border-green-500/30 bg-green-500/5 p-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-xs font-medium text-green-600">
                          Detected {autoDetected.length} integrations
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {matchedPackages.slice(0, 6).map(({ package: pkg, integration }) => (
                          <Badge key={pkg} variant="outline" className="text-[10px]">
                            {pkg}
                          </Badge>
                        ))}
                        {matchedPackages.length > 6 && (
                          <Badge variant="secondary" className="text-[10px]">
                            +{matchedPackages.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Integration Selection */}
                  {detectionMethod !== 'none' && availableIntegrations.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Adjust Selection</Label>
                        <Badge variant="secondary" className="text-[10px]">{selectedIntegrations.size} selected</Badge>
                      </div>
                      <ScrollArea className="h-[120px] rounded-md border p-2">
                        <div className="space-y-3">
                          {Object.entries(integrationsByCategory).map(([category, integrations]) => (
                            <div key={category}>
                              <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">{category}</p>
                              <div className="grid grid-cols-2 gap-1">
                                {integrations.map((int) => (
                                  <div
                                    key={int.id}
                                    className={`flex items-center gap-1 p-1.5 rounded text-xs cursor-pointer transition-colors ${
                                      selectedIntegrations.has(int.id)
                                        ? 'bg-primary/10 border border-primary/30'
                                        : 'hover:bg-muted/50 border border-transparent'
                                    }`}
                                    onClick={() => toggleIntegration(int.id)}
                                  >
                                    <Checkbox
                                      checked={selectedIntegrations.has(int.id)}
                                      onCheckedChange={() => toggleIntegration(int.id)}
                                      className="h-3 w-3"
                                    />
                                    <span>{int.icon}</span>
                                    <span className="truncate">{int.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Info Box */}
            <div className="rounded-lg border bg-muted/30 p-3 flex gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                {detectionMethod === 'none' 
                  ? 'All available integrations will be imported. You can manage them later in the Integrations page.'
                  : `${selectedIntegrations.size} integrations will be imported based on your project dependencies.`
                }
              </p>
            </div>

            {/* Import Button */}
            <Button onClick={handleImport} className="w-full" disabled={isLoading || !lovableUrl.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Import className="h-4 w-4 mr-2" />}
              Import App
              <Badge variant="secondary" className="ml-2">
                {detectionMethod === 'none' ? 'All' : selectedIntegrations.size}
              </Badge>
            </Button>
          </div>
        )}

        {step === 'importing' && (
          <div className="py-8 flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-medium">Importing {projectName || 'your app'}</p>
              <p className="text-sm text-muted-foreground">
                Creating {detectionMethod === 'none' ? 'all' : selectedIntegrations.size} integration credentials...
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
