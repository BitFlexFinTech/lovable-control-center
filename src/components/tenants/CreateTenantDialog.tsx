import { useState } from 'react';
import { Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { Tenant } from '@/types';

interface CreateTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTenant: (tenant: Tenant) => void;
}

export function CreateTenantDialog({ isOpen, onClose, onCreateTenant }: CreateTenantDialogProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    environment: 'development' as Tenant['environment'],
    customDomainEnabled: false,
    backupEnabled: true,
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      name: formData.name,
      slug: formData.slug,
      environment: formData.environment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      baseUrl: `https://${formData.slug}.example.com`,
      adminUrl: `https://admin.${formData.slug}.example.com`,
      apiKeys: { public: `pk_${Date.now()}`, private: `sk_${Date.now()}` },
      permissions: ['read', 'write', 'admin'],
    };

    onCreateTenant(newTenant);
    setIsCreating(false);
    setFormData({
      name: '',
      slug: '',
      environment: 'development',
      customDomainEnabled: false,
      backupEnabled: true,
    });
    onClose();

    toast({
      title: 'Tenant Created',
      description: `${newTenant.name} has been created successfully.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create New Tenant
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tenant Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Acme Corporation"
            />
          </div>

          <div className="space-y-2">
            <Label>Slug *</Label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="e.g., acme-corp"
            />
            <p className="text-xs text-muted-foreground">
              Used in URLs and API endpoints
            </p>
          </div>

          <div className="space-y-2">
            <Label>Environment</Label>
            <Select
              value={formData.environment}
              onValueChange={(value: Tenant['environment']) =>
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

          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Custom Domain</p>
                <p className="text-xs text-muted-foreground">Enable custom domain support</p>
              </div>
              <Switch
                checked={formData.customDomainEnabled}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, customDomainEnabled: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Automated Backups</p>
                <p className="text-xs text-muted-foreground">Enable daily automated backups</p>
              </div>
              <Switch
                checked={formData.backupEnabled}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, backupEnabled: checked }))
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Tenant'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
