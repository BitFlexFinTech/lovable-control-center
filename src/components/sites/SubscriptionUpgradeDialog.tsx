import { useState } from 'react';
import { TrendingUp, Check, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/types/billing';
import { cn } from '@/lib/utils';

interface SubscriptionUpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  siteName: string;
  currentTier: SubscriptionTier;
  onUpgrade: (newTier: SubscriptionTier) => void;
}

export function SubscriptionUpgradeDialog({ 
  isOpen, 
  onClose, 
  siteName,
  currentTier,
  onUpgrade 
}: SubscriptionUpgradeDialogProps) {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(currentTier);

  const handleUpgrade = () => {
    if (selectedTier !== currentTier) {
      onUpgrade(selectedTier);
    }
    onClose();
  };

  const tiers = Object.entries(SUBSCRIPTION_TIERS) as [SubscriptionTier, typeof SUBSCRIPTION_TIERS[SubscriptionTier]][];
  const currentTierIndex = tiers.findIndex(([key]) => key === currentTier);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Upgrade Subscription
          </DialogTitle>
          <DialogDescription>
            Upgrade "{siteName}" to unlock more features
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {tiers.map(([key, tier], index) => {
            const isCurrent = key === currentTier;
            const isSelected = key === selectedTier;
            const isDowngrade = index < currentTierIndex;
            const isRecommended = key === 'pro';

            return (
              <button
                key={key}
                onClick={() => !isDowngrade && setSelectedTier(key)}
                disabled={isDowngrade}
                className={cn(
                  'relative p-4 rounded-xl border text-left transition-all',
                  isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' :
                  isCurrent ? 'border-border bg-muted/50' :
                  isDowngrade ? 'border-border opacity-50 cursor-not-allowed' :
                  'border-border hover:border-primary/50'
                )}
              >
                {isRecommended && !isCurrent && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
                      <Sparkles className="h-2.5 w-2.5" />
                      Recommended
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{tier.name}</h3>
                    {isCurrent && (
                      <span className="text-[10px] text-muted-foreground">Current plan</span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">
                      {tier.price === 0 ? 'Free' : `$${tier.price}`}
                    </p>
                    {tier.price > 0 && (
                      <span className="text-xs text-muted-foreground">/month</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-1.5">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className={cn(
                        'h-3.5 w-3.5',
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      )} />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isSelected && !isCurrent && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="flex-1" 
            disabled={selectedTier === currentTier}
            onClick={handleUpgrade}
          >
            {selectedTier === currentTier ? 'Select a Plan' : `Upgrade to ${SUBSCRIPTION_TIERS[selectedTier].name}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
