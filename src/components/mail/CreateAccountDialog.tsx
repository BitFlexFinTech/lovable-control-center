import { useState } from 'react';
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
import { Mail } from 'lucide-react';

interface CreateAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAccount: (name: string) => void;
  domain: string;
}

export function CreateAccountDialog({
  isOpen,
  onClose,
  onCreateAccount,
  domain,
}: CreateAccountDialogProps) {
  const [accountName, setAccountName] = useState('');

  const handleCreate = () => {
    if (accountName.trim()) {
      onCreateAccount(accountName.trim().toLowerCase());
      setAccountName('');
      onClose();
    }
  };

  const previewEmail = accountName ? `${accountName.toLowerCase()}@${domain}` : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Create Email Account
          </DialogTitle>
          <DialogDescription>
            Create a new email account for your domain.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <div className="flex items-center gap-2">
              <Input
                id="accountName"
                placeholder="support"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="flex-1"
              />
              <span className="text-muted-foreground">@{domain}</span>
            </div>
          </div>
          {previewEmail && (
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Preview:</p>
              <p className="text-sm font-medium text-primary">{previewEmail}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!accountName.trim()}>
            Create Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
