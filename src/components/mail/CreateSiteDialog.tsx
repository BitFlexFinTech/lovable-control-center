import { useState } from 'react';
import { Plus, Globe, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { EmailAccount } from '@/types/mail';

interface CreateSiteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (site: NewSiteData, emailAccounts: EmailAccount[]) => void;
  tenantId: string;
}

export interface NewSiteData {
  name: string;
  domain: string;
  url: string;
}

const DEFAULT_EMAIL_ACCOUNTS = ['admin', 'accounts', 'social', 'marketing'];

export function CreateSiteDialog({ isOpen, onClose, onCreate, tenantId }: CreateSiteDialogProps) {
  const { toast } = useToast();
  const [siteName, setSiteName] = useState('');
  const [domain, setDomain] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [provisioningStep, setProvisioningStep] = useState(0);

  const handleCreate = async () => {
    if (!siteName || !domain) {
      toast({
        title: 'Missing information',
        description: 'Please provide a site name and domain.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    
    // Simulate provisioning steps
    for (let i = 1; i <= 4; i++) {
      setProvisioningStep(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Create email accounts
    const emailAccounts: EmailAccount[] = DEFAULT_EMAIL_ACCOUNTS.map((name, index) => ({
      id: `acc-${Date.now()}-${index}`,
      tenantId,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: `${name}@${domain}`,
      type: name as EmailAccount['type'],
      createdAt: new Date().toISOString(),
    }));

    const newSite: NewSiteData = {
      name: siteName,
      domain,
      url: `https://${domain}`,
    };

    onCreate(newSite, emailAccounts);
    
    toast({
      title: 'Site created successfully',
      description: `${siteName} has been created with ${emailAccounts.length} email accounts.`,
    });

    setIsCreating(false);
    setProvisioningStep(0);
    setSiteName('');
    setDomain('');
    onClose();
  };

  const provisioningSteps = [
    'Creating site...',
    'Provisioning admin@' + (domain || 'domain.com'),
    'Provisioning accounts@' + (domain || 'domain.com'),
    'Provisioning social@ & marketing@',
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Create New Site
          </DialogTitle>
          <DialogDescription>
            Create a new site with automatic email provisioning
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              placeholder="My Awesome Store"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              placeholder="mystore.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              disabled={isCreating}
            />
          </div>

          {/* Auto-provision preview */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Auto-provisioned Email Accounts</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEFAULT_EMAIL_ACCOUNTS.map((account, index) => (
                <div
                  key={account}
                  className={`flex items-center gap-2 text-sm p-2 rounded-md transition-all ${
                    isCreating && provisioningStep > index
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {isCreating && provisioningStep > index ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : isCreating && provisioningStep === index + 1 ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Mail className="h-3.5 w-3.5" />
                  )}
                  <span>{account}@{domain || 'domain.com'}</span>
                </div>
              ))}
            </div>
          </div>

          {isCreating && (
            <div className="text-sm text-center text-muted-foreground animate-pulse">
              {provisioningSteps[provisioningStep - 1] || 'Finishing up...'}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !siteName || !domain}>
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Site
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
