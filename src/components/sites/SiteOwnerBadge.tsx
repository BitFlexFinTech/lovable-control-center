import { Crown, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SiteOwnerType, SubscriptionTier, OWNER_TYPE_COLORS } from '@/types/billing';
import { cn } from '@/lib/utils';

interface SiteOwnerBadgeProps {
  ownerType: SiteOwnerType;
  subscriptionTier?: SubscriptionTier;
  showTier?: boolean;
  size?: 'sm' | 'md';
}

const tierLabels: Record<SubscriptionTier, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

export function SiteOwnerBadge({ 
  ownerType, 
  subscriptionTier, 
  showTier = false,
  size = 'sm'
}: SiteOwnerBadgeProps) {
  const colors = OWNER_TYPE_COLORS[ownerType];
  const Icon = ownerType === 'admin' ? Crown : User;

  return (
    <div className="flex items-center gap-1.5">
      <Badge 
        className={cn(
          colors.bg, 
          colors.text, 
          colors.border,
          'border gap-1',
          size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5'
        )}
      >
        <Icon className={size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
        {ownerType === 'admin' ? 'Admin' : 'Customer'}
      </Badge>
      {showTier && subscriptionTier && ownerType === 'customer' && (
        <Badge 
          variant="outline"
          className={cn(
            size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5'
          )}
        >
          {tierLabels[subscriptionTier]}
        </Badge>
      )}
    </div>
  );
}
