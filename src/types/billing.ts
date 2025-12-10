// Site Owner Types
export type SiteOwnerType = 'admin' | 'customer';

// Subscription Tiers
export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise';

// Billing Status
export type BillingStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

// Payment History Item
export interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  invoiceUrl?: string;
  description: string;
}

// Billing Information
export interface BillingInfo {
  subscriptionTier: SubscriptionTier;
  status: BillingStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  monthlyPrice: number;
  paymentMethod?: {
    type: 'card' | 'bank';
    last4: string;
    brand?: string;
  };
}

// Extended Site Owner Info
export interface SiteOwner {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  type: SiteOwnerType;
  createdAt: string;
}

// Subscription Tier Config
export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, { name: string; price: number; features: string[] }> = {
  free: {
    name: 'Free',
    price: 0,
    features: ['1 site', 'Basic analytics', 'Community support'],
  },
  starter: {
    name: 'Starter',
    price: 29,
    features: ['3 sites', 'Advanced analytics', 'Email support', 'Custom domain'],
  },
  pro: {
    name: 'Pro',
    price: 79,
    features: ['10 sites', 'Priority support', 'API access', 'Team collaboration', 'Advanced integrations'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 199,
    features: ['Unlimited sites', 'Dedicated support', 'SLA guarantee', 'Custom integrations', 'White-label'],
  },
};

// Billing status colors
export const BILLING_STATUS_COLORS: Record<BillingStatus, { bg: string; text: string; border: string }> = {
  active: { bg: 'bg-status-active/10', text: 'text-status-active', border: 'border-status-active/30' },
  past_due: { bg: 'bg-status-warning/10', text: 'text-status-warning', border: 'border-status-warning/30' },
  canceled: { bg: 'bg-status-inactive/10', text: 'text-status-inactive', border: 'border-status-inactive/30' },
  trialing: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/30' },
};

// Owner type colors
export const OWNER_TYPE_COLORS: Record<SiteOwnerType, { bg: string; text: string; border: string; section: string }> = {
  admin: { 
    bg: 'bg-primary/10', 
    text: 'text-primary', 
    border: 'border-primary/30',
    section: 'from-primary/5 to-transparent'
  },
  customer: { 
    bg: 'bg-status-active/10', 
    text: 'text-status-active', 
    border: 'border-status-active/30',
    section: 'from-status-active/5 to-transparent'
  },
};
