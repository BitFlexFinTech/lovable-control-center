import { useState, useEffect } from 'react';
import { Settings, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useUpdateTenant, useDeleteTenant, SupabaseTenant } from '@/hooks/useSupabaseTenants';
import { TenantSettings } from '@/types/monitoring';

interface TenantSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: SupabaseTenant | null;
  onUpdateTenant?: (tenant: SupabaseTenant) => void;
  onDeleteTenant?: (tenantId: string) => void;
}

export function TenantSettingsDialog({
  isOpen,
  onClose,
  tenant,
  onUpdateTenant,
  onDeleteTenant,
}: TenantSettingsDialogProps) {
  const { toast } = useToast();
  const updateTenantMutation = useUpdateTenant();
  const deleteTenantMutation = useDeleteTenant();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<SupabaseTenant & { settings: TenantSettings }>>({});

  // Update form when tenant changes
  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name,
        slug: tenant.slug,
        environment: tenant.environment,
        custom_domain: tenant.custom_domain,
        ssl_enabled: tenant.ssl_enabled,
        backups_enabled: tenant.backups_enabled,
        settings: {
          maxSites: 10,
          maxUsers: 50,
          storageLimit: 10737418240,
          bandwidthLimit: 107374182400,
          customDomainEnabled: tenant.custom_domain ?? true,
          sslEnabled: tenant.ssl_enabled ?? true,
          backupEnabled: tenant.backups_enabled ?? true,
          backupFrequency: 'daily',
        },
      });
    }
  }, [tenant]);

  const handleSave = async () => {
    if (!tenant) return;

    try {
      await updateTenantMutation.mutateAsync({
        id: tenant.id,
        name: formData.name || tenant.name,
        slug: formData.slug || tenant.slug,
        environment: formData.environment || tenant.environment,
        custom_domain: formData.settings?.customDomainEnabled ?? tenant.custom_domain,
        ssl_enabled: formData.settings?.sslEnabled ?? tenant.ssl_enabled,
        backups_enabled: formData.settings?.backupEnabled ?? tenant.backups_enabled,
      });

      onUpdateTenant?.(tenant);
      toast({
        title: 'Tenant Updated',
        description: 'Settings have been saved successfully.',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update tenant settings.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!tenant) return;

    try {
      await deleteTenantMutation.mutateAsync(tenant.id);
      onDeleteTenant?.(tenant.id);
      setShowDeleteDialog(false);
      onClose();
      toast({
        title: 'Tenant Deleted',
        description: `${tenant.name} has been deleted.`,
        variant: 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete tenant.',
        variant: 'destructive',
      });
    }
  };

  const isSaving = updateTenantMutation.isPending;

  if (!tenant) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Tenant Settings - {tenant.name}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="general">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="limits">Limits</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="danger">Danger Zone</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Tenant Name</Label>
                <Input
                  value={formData.name || tenant.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={formData.slug || tenant.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Environment</Label>
                <Select
                  value={formData.environment || tenant.environment}
                  onValueChange={(value: SupabaseTenant['environment']) =>
                    setFormData(prev => ({ ...prev, environment: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="limits" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Sites</Label>
                  <Input
                    type="number"
                    value={formData.settings?.maxSites || 10}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings!, maxSites: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Users</Label>
                  <Input
                    type="number"
                    value={formData.settings?.maxUsers || 50}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings!, maxUsers: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Storage Limit (GB)</Label>
                  <Input
                    type="number"
                    value={(formData.settings?.storageLimit || 10737418240) / 1073741824}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings!, storageLimit: parseInt(e.target.value) * 1073741824 }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bandwidth Limit (GB)</Label>
                  <Input
                    type="number"
                    value={(formData.settings?.bandwidthLimit || 107374182400) / 1073741824}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings!, bandwidthLimit: parseInt(e.target.value) * 1073741824 }
                    }))}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Custom Domain</p>
                    <p className="text-sm text-muted-foreground">Allow custom domain configuration</p>
                  </div>
                  <Switch
                    checked={formData.settings?.customDomainEnabled ?? true}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings!, customDomainEnabled: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">SSL/TLS</p>
                    <p className="text-sm text-muted-foreground">Enable SSL certificates</p>
                  </div>
                  <Switch
                    checked={formData.settings?.sslEnabled ?? true}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings!, sslEnabled: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Automated Backups</p>
                    <p className="text-sm text-muted-foreground">Enable scheduled backups</p>
                  </div>
                  <Switch
                    checked={formData.settings?.backupEnabled ?? true}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings!, backupEnabled: checked }
                    }))}
                  />
                </div>
                {formData.settings?.backupEnabled && (
                  <div className="space-y-2 pl-4">
                    <Label>Backup Frequency</Label>
                    <Select
                      value={formData.settings?.backupFrequency || 'daily'}
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                        setFormData(prev => ({
                          ...prev,
                          settings: { ...prev.settings!, backupFrequency: value }
                        }))
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="danger" className="mt-4">
              <div className="p-4 border border-status-inactive/30 rounded-lg bg-status-inactive/5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-status-inactive mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-status-inactive">Delete Tenant</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Once you delete a tenant, there is no going back. All sites, users, and data
                      associated with this tenant will be permanently deleted.
                    </p>
                    <Button
                      variant="destructive"
                      className="mt-4"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      Delete Tenant
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tenant
              "{tenant?.name}" and all associated data including sites, users, and configurations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-status-inactive text-white hover:bg-status-inactive/90"
              onClick={handleDelete}
            >
              Delete Tenant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
