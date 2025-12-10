import { Save, Bell, Shield, Palette, Globe } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const Settings = () => {
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
          <Button size="sm" className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            Save Changes
          </Button>
        </div>
      </div>

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
              <Label htmlFor="email-alerts" className="flex flex-col gap-1">
                <span>Email Alerts</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Receive email notifications for critical events
                </span>
              </Label>
              <Switch id="email-alerts" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="slack-alerts" className="flex flex-col gap-1">
                <span>Slack Notifications</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Send alerts to your Slack workspace
                </span>
              </Label>
              <Switch id="slack-alerts" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="health-alerts" className="flex flex-col gap-1">
                <span>Health Check Alerts</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Get notified when a site goes down
                </span>
              </Label>
              <Switch id="health-alerts" defaultChecked />
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
              <Label htmlFor="2fa" className="flex flex-col gap-1">
                <span>Two-Factor Authentication</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Require 2FA for all admin accounts
                </span>
              </Label>
              <Switch id="2fa" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="session-timeout" className="flex flex-col gap-1">
                <span>Session Timeout</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Auto-logout after 30 minutes of inactivity
                </span>
              </Label>
              <Switch id="session-timeout" defaultChecked />
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
              <Label htmlFor="compact-mode" className="flex flex-col gap-1">
                <span>Compact Mode</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Use smaller spacing and font sizes
                </span>
              </Label>
              <Switch id="compact-mode" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="animations" className="flex flex-col gap-1">
                <span>Animations</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Enable smooth transitions and effects
                </span>
              </Label>
              <Switch id="animations" defaultChecked />
            </div>
          </div>
        </div>

        {/* API */}
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold">API Access</h2>
              <p className="text-sm text-muted-foreground">Manage API keys and webhooks</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">API Keys</p>
                <p className="text-sm text-muted-foreground">
                  Generate and manage API access tokens
                </p>
              </div>
              <Button variant="outline" size="sm">
                Manage Keys
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
