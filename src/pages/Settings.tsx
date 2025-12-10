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
import { Progress } from '@/components/ui/progress';
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

// Mock API Keys
interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  expiresAt: string;
  lastUsed?: string;
  permissions: string[];
}

const mockApiKeys: ApiKey[] = [
  {
    id: 'key-1',
    name: 'Production API Key',
    key: 'pk_live_xxxxxxxxxxxxxxxxxxxxxxxx',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    permissions: ['read', 'write'],
  },
  {
    id: 'key-2',
    name: 'Development Key',
    key: 'pk_dev_xxxxxxxxxxxxxxxxxxxxxxxx',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    permissions: ['read', 'write', 'admin'],
  },
];

// Mock Webhooks
interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'error';
  lastTriggered?: string;
  failureCount: number;
}

const mockWebhooks: Webhook[] = [
  {
    id: 'wh-1',
    name: 'Slack Notifications',
    url: 'https://hooks.slack.com/services/xxx',
    events: ['site.down', 'site.up', 'backup.complete'],
    status: 'active',
    lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    failureCount: 0,
  },
  {
    id: 'wh-2',
    name: 'Analytics Webhook',
    url: 'https://analytics.example.com/webhook',
    events: ['user.login', 'user.signup'],
    status: 'active',
    lastTriggered: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    failureCount: 0,
  },
  {
    id: 'wh-3',
    name: 'Error Reporting',
    url: 'https://errors.example.com/hook',
    events: ['error.critical'],
    status: 'error',
    lastTriggered: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    failureCount: 3,
  },
];

// Mock Error Logs
interface ErrorLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  source: string;
  timestamp: string;
  count: number;
}

const mockErrorLogs: ErrorLog[] = [
  {
    id: 'err-1',
    level: 'critical',
    message: 'Database connection timeout',
    source: 'Database',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    count: 3,
  },
  {
    id: 'err-2',
    level: 'error',
    message: 'Failed to send email notification',
    source: 'Email Service',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    count: 12,
  },
  {
    id: 'err-3',
    level: 'warning',
    message: 'High memory usage detected',
    source: 'System Monitor',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    count: 5,
  },
  {
    id: 'err-4',
    level: 'info',
    message: 'Scheduled backup started',
    source: 'Backup Service',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    count: 1,
  },
];

const Settings = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [webhooks, setWebhooks] = useState<Webhook[]>(mockWebhooks);
  const [errorLogs] = useState<ErrorLog[]>(mockErrorLogs);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [isCreateKeyOpen, setIsCreateKeyOpen] = useState(false);
  const [isCreateWebhookOpen, setIsCreateWebhookOpen] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '', events: [] as string[] });

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

  const handleCreateApiKey = () => {
    if (!newKeyName) {
      toast({ title: 'Error', description: 'Please enter a key name.', variant: 'destructive' });
      return;
    }

    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      key: `pk_${Math.random().toString(36).substring(2, 30)}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      permissions: ['read', 'write'],
    };

    setApiKeys(prev => [newKey, ...prev]);
    setNewKeyName('');
    setIsCreateKeyOpen(false);
    toast({ title: 'API Key Created', description: 'New API key has been generated.' });
  };

  const handleRotateKey = async (keyId: string) => {
    setApiKeys(prev => prev.map(key => {
      if (key.id === keyId) {
        return {
          ...key,
          key: `pk_${Math.random().toString(36).substring(2, 30)}`,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        };
      }
      return key;
    }));
    toast({ title: 'Key Rotated', description: 'API key has been rotated successfully.' });
  };

  const handleDeleteKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(k => k.id !== keyId));
    toast({ title: 'Key Deleted', description: 'API key has been removed.' });
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: 'Copied', description: 'API key copied to clipboard.' });
  };

  const handleCreateWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast({ title: 'Error', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }

    const webhook: Webhook = {
      id: `wh-${Date.now()}`,
      ...newWebhook,
      status: 'active',
      failureCount: 0,
    };

    setWebhooks(prev => [webhook, ...prev]);
    setNewWebhook({ name: '', url: '', events: [] });
    setIsCreateWebhookOpen(false);
    toast({ title: 'Webhook Created', description: 'New webhook has been configured.' });
  };

  const handleDeleteWebhook = (webhookId: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== webhookId));
    toast({ title: 'Webhook Deleted', description: 'Webhook has been removed.' });
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

  const getLevelColor = (level: ErrorLog['level']) => {
    switch (level) {
      case 'critical': return 'text-status-inactive bg-status-inactive/10';
      case 'error': return 'text-status-warning bg-status-warning/10';
      case 'warning': return 'text-amber-500 bg-amber-500/10';
      case 'info': return 'text-primary bg-primary/10';
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
                        {new Date(key.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(key.expiresAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {key.lastUsed ? new Date(key.lastUsed).toLocaleString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRotateKey(key.id)}
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteKey(key.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-status-inactive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
                        {webhook.events.slice(0, 2).map((event) => (
                          <Badge key={event} variant="outline">{event}</Badge>
                        ))}
                        {webhook.events.length > 2 && (
                          <Badge variant="outline">+{webhook.events.length - 2}</Badge>
                        )}
                      </div>
                      <Badge variant={
                        webhook.status === 'active' ? 'active' :
                        webhook.status === 'error' ? 'destructive' : 'secondary'
                      }>
                        {webhook.status}
                      </Badge>
                      {webhook.failureCount > 0 && (
                        <Badge variant="destructive">{webhook.failureCount} failures</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDeleteWebhook(webhook.id)}
                      >
                        <Trash2 className="h-4 w-4 text-status-inactive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
              <Select defaultValue="all">
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
                    <TableHead>Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
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
                      <TableCell className="text-muted-foreground">{log.source}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.count}x</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
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
            <Button onClick={handleCreateApiKey}>Create Key</Button>
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
            <Button onClick={handleCreateWebhook}>Add Webhook</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Settings;
