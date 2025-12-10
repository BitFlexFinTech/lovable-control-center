import { useState } from 'react';
import { Shield, Plus, ChevronDown, ChevronUp, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { TwoFactorCodeDisplay } from './TwoFactorCodeDisplay';
import { useTwoFactor } from '@/contexts/TwoFactorContext';
import { usePasswordManager } from '@/contexts/PasswordManagerContext';
import { generateQRCodeURL } from '@/utils/totpGenerator';
import { cn } from '@/lib/utils';

export function TwoFactorManager() {
  const { accounts, codes, addAccount, removeAccount, getAccountCount } = useTwoFactor();
  const { credentials } = usePasswordManager();
  const [expanded, setExpanded] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');
  const [newAccountQR, setNewAccountQR] = useState<string | null>(null);

  // Get integrations that don't have 2FA yet
  const availableIntegrations = credentials.filter(c => 
    !accounts.some(a => a.integrationId === c.integrationId && a.siteId === c.siteId)
  );

  const handleAddAccount = () => {
    const cred = credentials.find(c => c.id === selectedIntegration);
    if (!cred) return;

    const newAccount = addAccount({
      integrationId: cred.integrationId,
      integrationName: cred.integrationName,
      integrationIcon: cred.integrationIcon || '🔐',
      siteId: cred.siteId,
      siteName: cred.siteName,
      email: cred.email,
      issuer: cred.integrationName,
    });

    // Show QR code
    const qrUrl = generateQRCodeURL(newAccount.secret, newAccount.email, newAccount.issuer);
    setNewAccountQR(qrUrl);
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
    setSelectedIntegration('');
    setNewAccountQR(null);
  };

  return (
    <>
      <Collapsible open={expanded} onOpenChange={setExpanded} className="mb-6">
        <div className={cn(
          "rounded-xl border-2 border-primary/30 overflow-hidden",
          "opacity-0 animate-fade-in"
        )} style={{ animationDelay: '250ms' }}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 bg-primary/10 cursor-pointer hover:bg-primary/15 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-primary flex items-center gap-2">
                    TWO-FACTOR AUTHENTICATION
                    <Smartphone className="h-4 w-4" />
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Authy-style TOTP codes for your integrations
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddDialogOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add 2FA
                </Button>
                <Badge variant="outline" className="border-primary/50 text-primary">
                  {getAccountCount()} accounts
                </Badge>
                {expanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 space-y-3 bg-primary/5">
              {accounts.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-2">No 2FA accounts configured</p>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First 2FA Account
                  </Button>
                </div>
              ) : (
                accounts.map(account => (
                  <TwoFactorCodeDisplay
                    key={account.id}
                    account={account}
                    code={codes[account.id]}
                    onRemove={removeAccount}
                  />
                ))
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Add 2FA Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={handleCloseAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {newAccountQR ? 'Scan QR Code' : 'Add Two-Factor Authentication'}
            </DialogTitle>
            <DialogDescription>
              {newAccountQR 
                ? 'Scan this QR code with your authenticator app (Authy, Google Authenticator, etc.)'
                : 'Select an integration to enable 2FA protection'
              }
            </DialogDescription>
          </DialogHeader>

          {newAccountQR ? (
            <div className="flex flex-col items-center py-4">
              <div className="p-4 bg-white rounded-lg mb-4">
                <img src={newAccountQR} alt="QR Code" className="w-48 h-48" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                After scanning, your authenticator app will show a 6-digit code that refreshes every 30 seconds.
              </p>
            </div>
          ) : (
            <div className="py-4">
              <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an integration" />
                </SelectTrigger>
                <SelectContent>
                  {availableIntegrations.length === 0 ? (
                    <SelectItem value="none" disabled>
                      All integrations already have 2FA
                    </SelectItem>
                  ) : (
                    availableIntegrations.map(cred => (
                      <SelectItem key={cred.id} value={cred.id}>
                        <div className="flex items-center gap-2">
                          <span>{cred.integrationIcon}</span>
                          <span>{cred.integrationName}</span>
                          <span className="text-muted-foreground">({cred.siteName})</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseAddDialog}>
              {newAccountQR ? 'Done' : 'Cancel'}
            </Button>
            {!newAccountQR && (
              <Button onClick={handleAddAccount} disabled={!selectedIntegration}>
                Enable 2FA
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}