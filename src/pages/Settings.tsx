import { useState } from 'react';
import { 
  Save, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Key, 
  RefreshCw, 
  Copy, 
  Eye, 
  EyeOff,
  Plus,
  Trash2,
  Clock,
  AlertTriangle,
  Server,
  Webhook,
  Activity,
  Database,
  Loader2,
  Check
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useApiKeys, useCreateApiKey, useRotateApiKey, useDeleteApiKey } from '@/hooks/useSupabaseApiKeys';
import { useWebhooks, useCreateWebhook, useDeleteWebhook } from '@/hooks/useSupabaseWebhooks';
import { useErrorLogs } from '@/hooks/useSupabaseErrorLogs';

const Settings = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [isCreateKeyOpen, setIsCreateKeyOpen] = useState(false);
  const [isCreateWebhookOpen, setIsCreateWebhookOpen] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '', events: [] as string[] });
  const [logLevelFilter, setLogLevelFilter] = useState('all');

  // Supabase hooks
  const { data: apiKeys = [], isLoading: apiKeysLoading } = useApiKeys();
  const createApiKeyMutation = useCreateApiKey();
  const rotateApiKeyMutation = useRotateApiKey();
  const deleteApiKeyMutation = useDeleteApiKey();

  const { data: webhooks = [], isLoading: webhooksLoading } = useWebhooks();
  const createWebhookMutation = useCreateWebhook();
  const deleteWebhookMutation = useDeleteWebhook();

  const { data: errorLogs = [], isLoading: logsLoading } = useErrorLogs(logLevelFilter === 'all' ? undefined : logLevelFilter);

  // Settings state
  const [settings, setSettings] = useState({
    emailAlerts: true,
    slackAlerts: true,
    healthAlerts: true,
    twoFactor: false,
    sessionTimeout: true,
    compactMode: false,
    animations: true,
    autoBackup: true,
    apiRateLimit: 1000,
    logRetention: 30,
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: 'Settings Saved',
      description: 'Your preferences have been updated.',
    });
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName) {
      toast({ title: 'Error', description: 'Please enter a key name.', variant: 'destructive' });
      return;
    }

    try {
      await createApiKeyMutation.mutateAsync({ name: newKeyName });
      setNewKeyName('');
      setIsCreateKeyOpen(false);
      toast({ title: 'API Key Created', description: 'New API key has been generated.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create API key.', variant: 'destructive' });
    }
  };

  const handleRotateKey = async (keyId: string) => {
    try {
      await rotateApiKeyMutation.mutateAsync(keyId);
      toast({ title: 'Key Rotated', description: 'API key has been rotated successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to rotate API key.', variant: 'destructive' });
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      await deleteApiKeyMutation.mutateAsync(keyId);
      toast({ title: 'Key Deleted', description: 'API key has been removed.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete API key.', variant: 'destructive' });
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: 'Copied', description: 'API key copied to clipboard.' });
  };

  const handleCreateWebhook = async () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast({ title: 'Error', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }

    try {
      await createWebhookMutation.mutateAsync({
        name: newWebhook.name,
        url: newWebhook.url,
        events: newWebhook.events.length > 0 ? newWebhook.events : ['site.down', 'site.up'],
      });
      setNewWebhook({ name: '', url: '', events: [] });
      setIsCreateWebhookOpen(false);
      toast({ title: 'Webhook Created', description: 'New webhook has been configured.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create webhook.', variant: 'destructive' });
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      await deleteWebhookMutation.mutateAsync(webhookId);
      toast({ title: 'Webhook Deleted', description: 'Webhook has been removed.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete webhook.', variant: 'destructive' });
    }
  };

  const handleToggleMaintenance = (enabled: boolean) => {
    setMaintenanceMode(enabled);
    toast({
      title: enabled ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled',
      description: enabled 
        ? 'All sites are now showing maintenance page.' 
        : 'Sites are back online.',
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-status-inactive bg-status-inactive/10';
      case 'error': return 'text-status-warning bg-status-warning/10';
      case 'warning': return 'text-amber-500 bg-amber-500/10';
      case 'info': return 'text-primary bg-primary/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 opacity-0 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Configure your Control Center preferences
            </p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="logs">Error Logs</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <div className="max-w-2xl space-y-8">
            {/* Notifications */}
            <div className="opacity-0 animate-slide-up" style={{ animationDelay: '50ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold">Notifications</h2>
                  <p className="text-sm text-muted-foreground">Manage how you receive alerts</p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex flex-col gap-1">
                    <span>Email Alerts</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      Receive email notifications for critical events
                    </span>
                  </Label>
                  <Switch 
                    checked={settings.emailAlerts} 
                    onCheckedChange={(v) => setSettings(prev => ({ ...prev, emailAlerts: v }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label className="flex flex-col gap-1">
                    <span>Slack Notifications</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      Send alerts to your Slack workspace
                    </span>
                  </Label>
                  <Switch 
                    checked={settings.slackAlerts}
                    onCheckedChange={(v) => setSettings(prev => ({ ...prev, slackAlerts: v }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label className="flex flex-col gap-1">
                    <span>Health Check Alerts</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      Get notified when a site goes down
                    </span>
                  </Label>
                  <Switch 
                    checked={settings.healthAlerts}
                    onCheckedChange={(v) => setSettings(prev => ({ ...prev, healthAlerts: v }))}
                  />
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="opacity-0 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold">Security</h2>
                  <p className="text-sm text-muted-foreground">Authentication and access settings</p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex flex-col gap-1">
                    <span>Two-Factor Authentication</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      Require 2FA for all admin accounts
                    </span>
                  </Label>
                  <Switch 
                    checked={settings.twoFactor}
                    onCheckedChange={(v) => setSettings(prev => ({ ...prev, twoFactor: v }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label className="flex flex-col gap-1">
                    <span>Session Timeout</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      Auto-logout after 30 minutes of inactivity
                    </span>
                  </Label>
                  <Switch 
                    checked={settings.sessionTimeout}
                    onCheckedChange={(v) => setSettings(prev => ({ ...prev, sessionTimeout: v }))}
                  />
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="opacity-0 animate-slide-up" style={{ animationDelay: '150ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold">Appearance</h2>
                  <p className="text-sm text-muted-foreground">Customize the interface</p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex flex-col gap-1">
                    <span>Compact Mode</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      Use smaller spacing and font sizes
                    </span>
                  </Label>
                  <Switch 
                    checked={settings.compactMode}
                    onCheckedChange={(v) => setSettings(prev => ({ ...prev, compactMode: v }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label className="flex flex-col gap-1">
                    <span>Animations</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      Enable smooth transitions and effects
                    </span>
                  </Label>
                  <Switch 
                    checked={settings.animations}
                    onCheckedChange={(v) => setSettings(prev => ({ ...prev, animations: v }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">API Keys</h2>
              <p className="text-sm text-muted-foreground">Manage your API access tokens</p>
            </div>
            <Button onClick={() => setIsCreateKeyOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Create Key
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeysLoading && [1, 2].map((i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))}
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {showApiKey === key.id ? key.key : key.key.substring(0, 10) + '...'}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setShowApiKey(showApiKey === key.id ? null : key.id)}
                          >
                            {showApiKey === key.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleCopyKey(key.key)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {key.created_at ? new Date(key.created_at).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {key.expires_at ? new Date(key.expires_at).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {key.last_used_at ? new Date(key.last_used_at).toLocaleString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRotateKey(key.id)}
                            disabled={rotateApiKeyMutation.isPending}
                          >
                            <RefreshCw className={`h-3.5 w-3.5 ${rotateApiKeyMutation.isPending ? 'animate-spin' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteKey(key.id)}
                            disabled={deleteApiKeyMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-status-inactive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!apiKeysLoading && apiKeys.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No API keys found. Create one to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Webhooks</h2>
              <p className="text-sm text-muted-foreground">Configure event notifications</p>
            </div>
            <Button onClick={() => setIsCreateWebhookOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Webhook
            </Button>
          </div>

          <div className="grid gap-4">
            {webhooksLoading && [1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        webhook.status === 'active' ? 'bg-status-active/10' : 
                        webhook.status === 'error' ? 'bg-status-inactive/10' : 'bg-muted'
                      }`}>
                        <Webhook className={`h-5 w-5 ${
                          webhook.status === 'active' ? 'text-status-active' :
                          webhook.status === 'error' ? 'text-status-inactive' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{webhook.name}</p>
                        <p className="text-sm text-muted-foreground">{webhook.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        {(webhook.events || []).slice(0, 2).map((event) => (
                          <Badge key={event} variant="outline">{event}</Badge>
                        ))}
                        {(webhook.events || []).length > 2 && (
                          <Badge variant="outline">+{(webhook.events || []).length - 2}</Badge>
                        )}
                      </div>
                      <Badge variant={
                        webhook.status === 'active' ? 'active' :
                        webhook.status === 'error' ? 'destructive' : 'secondary'
                      }>
                        {webhook.status}
                      </Badge>
                      {(webhook.failure_count || 0) > 0 && (
                        <Badge variant="destructive">{webhook.failure_count} failures</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDeleteWebhook(webhook.id)}
                        disabled={deleteWebhookMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-status-inactive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!webhooksLoading && webhooks.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No webhooks configured. Add one to get started.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Maintenance Mode */}
        <TabsContent value="maintenance" className="space-y-6">
          <div className="max-w-2xl">
            <Card className={maintenanceMode ? 'border-status-warning' : ''}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${maintenanceMode ? 'bg-status-warning/10' : 'bg-muted'}`}>
                    <Server className={`h-5 w-5 ${maintenanceMode ? 'text-status-warning' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <CardTitle>Maintenance Mode</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Enable to show maintenance page on all sites
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Enable Maintenance Mode</p>
                    <p className="text-sm text-muted-foreground">
                      All sites will display a maintenance page
                    </p>
                  </div>
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={handleToggleMaintenance}
                  />
                </div>
                {maintenanceMode && (
                  <div className="p-4 border border-status-warning/30 bg-status-warning/5 rounded-lg">
                    <div className="flex items-center gap-2 text-status-warning mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Maintenance Mode Active</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      All sites are currently showing the maintenance page. Users cannot access
                      any sites until maintenance mode is disabled.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span>Database</span>
                  </div>
                  <Badge variant="active">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>API Services</span>
                  </div>
                  <Badge variant="active">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>CDN</span>
                  </div>
                  <Badge variant="active">Running</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Error Logs */}
        <TabsContent value="logs" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Error Logs</h2>
              <p className="text-sm text-muted-foreground">Monitor system errors and warnings</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={logLevelFilter} onValueChange={setLogLevelFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                Export Logs
              </Button>
            </div>
          </div>

          {/* Log Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2 w-2 rounded-full bg-status-inactive" />
                  <span className="text-sm text-muted-foreground">Critical</span>
                </div>
                <p className="text-2xl font-bold">
                  {errorLogs.filter(l => l.level === 'critical').length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2 w-2 rounded-full bg-status-warning" />
                  <span className="text-sm text-muted-foreground">Errors</span>
                </div>
                <p className="text-2xl font-bold">
                  {errorLogs.filter(l => l.level === 'error').length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-sm text-muted-foreground">Warnings</span>
                </div>
                <p className="text-2xl font-bold">
                  {errorLogs.filter(l => l.level === 'warning').length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">Info</span>
                </div>
                <p className="text-2xl font-bold">
                  {errorLogs.filter(l => l.level === 'info').length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Log Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Level</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsLoading && [1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    </TableRow>
                  ))}
                  {errorLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge className={getLevelColor(log.level)}>
                          {log.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium max-w-md truncate">
                        {log.message}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{log.component || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!logsLoading && errorLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No error logs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create API Key Dialog */}
      <Dialog open={isCreateKeyOpen} onOpenChange={setIsCreateKeyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Key Name</Label>
              <Input
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production API Key"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateKeyOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateApiKey} disabled={createApiKeyMutation.isPending}>
              {createApiKeyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Webhook Dialog */}
      <Dialog open={isCreateWebhookOpen} onOpenChange={setIsCreateWebhookOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Webhook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newWebhook.name}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Slack Notifications"
              />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={newWebhook.url}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateWebhookOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateWebhook} disabled={createWebhookMutation.isPending}>
              {createWebhookMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Settings;
