import { useState } from 'react';
import { ArrowRight, Search, User, Mail, Check, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/types/billing';
import { cn } from '@/lib/utils';

interface Customer {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface SiteTransferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  siteName: string;
  siteId: string;
  onTransfer: (customerId: string, tier: SubscriptionTier) => void;
}

// Mock customers for demo
const MOCK_CUSTOMERS: Customer[] = [
  { id: 'cust-1', name: 'John Smith', email: 'john@company.com' },
  { id: 'cust-2', name: 'Sarah Johnson', email: 'sarah@startup.io' },
  { id: 'cust-3', name: 'Mike Wilson', email: 'mike@agency.co' },
  { id: 'cust-4', name: 'Emily Chen', email: 'emily@brand.com' },
];

export function SiteTransferDialog({ 
  isOpen, 
  onClose, 
  siteName, 
  siteId,
  onTransfer 
}: SiteTransferDialogProps) {
  const [step, setStep] = useState<'search' | 'tier' | 'confirm'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('starter');

  const filteredCustomers = MOCK_CUSTOMERS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTransfer = () => {
    if (selectedCustomer) {
      onTransfer(selectedCustomer.id, selectedTier);
      onClose();
      // Reset state
      setStep('search');
      setSearchQuery('');
      setSelectedCustomer(null);
      setSelectedTier('starter');
    }
  };

  const handleClose = () => {
    onClose();
    setStep('search');
    setSearchQuery('');
    setSelectedCustomer(null);
    setSelectedTier('starter');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Transfer Site Ownership
          </DialogTitle>
          <DialogDescription>
            Transfer "{siteName}" to a paying customer
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 py-2">
          {['search', 'tier', 'confirm'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                'h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                step === s ? 'bg-primary text-primary-foreground' :
                ['search', 'tier', 'confirm'].indexOf(step) > i ? 'bg-status-active text-white' :
                'bg-muted text-muted-foreground'
              )}>
                {['search', 'tier', 'confirm'].indexOf(step) > i ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              {i < 2 && <div className="w-8 h-0.5 bg-muted" />}
            </div>
          ))}
        </div>

        {/* Step 1: Search Customer */}
        {step === 'search' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={cn(
                    'w-full p-3 rounded-lg border text-left transition-all',
                    selectedCustomer?.id === customer.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </p>
                    </div>
                    {selectedCustomer?.id === customer.id && (
                      <Check className="h-5 w-5 text-primary ml-auto" />
                    )}
                  </div>
                </button>
              ))}
              {filteredCustomers.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No customers found
                </p>
              )}
            </div>

            <Button 
              className="w-full" 
              disabled={!selectedCustomer}
              onClick={() => setStep('tier')}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Select Tier */}
        {step === 'tier' && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{selectedCustomer?.name}</p>
                <p className="text-xs text-muted-foreground">{selectedCustomer?.email}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Select Subscription Tier</Label>
              <RadioGroup value={selectedTier} onValueChange={(v) => setSelectedTier(v as SubscriptionTier)}>
                {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => (
                  <div
                    key={key}
                    className={cn(
                      'flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all',
                      selectedTier === key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    )}
                    onClick={() => setSelectedTier(key as SubscriptionTier)}
                  >
                    <RadioGroupItem value={key} id={key} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={key} className="font-medium cursor-pointer">
                          {tier.name}
                        </Label>
                        <span className="font-semibold">
                          {tier.price === 0 ? 'Free' : `$${tier.price}/mo`}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {tier.features.slice(0, 2).join(' • ')}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('search')}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => setStep('confirm')}>
                Review Transfer
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-status-warning/10 border border-status-warning/20 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-status-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-status-warning">Confirm Transfer</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will transfer ownership of "{siteName}" to {selectedCustomer?.name}. 
                  They will receive an invitation email to accept the transfer.
                </p>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-lg bg-muted/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Site</span>
                <span className="font-medium">{siteName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">New Owner</span>
                <span className="font-medium">{selectedCustomer?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subscription</span>
                <Badge variant="outline">{SUBSCRIPTION_TIERS[selectedTier].name}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly Price</span>
                <span className="font-medium">
                  {SUBSCRIPTION_TIERS[selectedTier].price === 0 
                    ? 'Free' 
                    : `$${SUBSCRIPTION_TIERS[selectedTier].price}/mo`}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('tier')}>
                Back
              </Button>
              <Button className="flex-1 gap-1.5" onClick={handleTransfer}>
                <ArrowRight className="h-4 w-4" />
                Transfer Ownership
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
