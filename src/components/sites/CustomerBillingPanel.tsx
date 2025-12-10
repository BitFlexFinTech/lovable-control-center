import { useState } from 'react';
import { CreditCard, Calendar, AlertCircle, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BillingInfo, PaymentHistoryItem, BILLING_STATUS_COLORS, SUBSCRIPTION_TIERS, SubscriptionTier } from '@/types/billing';
import { cn } from '@/lib/utils';

interface CustomerBillingPanelProps {
  siteName: string;
  billing: BillingInfo;
  paymentHistory: PaymentHistoryItem[];
  onUpgrade: () => void;
}

export function CustomerBillingPanel({ 
  siteName, 
  billing, 
  paymentHistory,
  onUpgrade 
}: CustomerBillingPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const statusColors = BILLING_STATUS_COLORS[billing.status];
  const tierInfo = SUBSCRIPTION_TIERS[billing.subscriptionTier];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">{siteName} Billing</p>
                <p className="text-xs text-muted-foreground">
                  {tierInfo.name} Plan • {formatCurrency(billing.monthlyPrice)}/mo
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={cn(statusColors.bg, statusColors.text, statusColors.border, 'border capitalize')}>
                {billing.status.replace('_', ' ')}
              </Badge>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border p-4 space-y-4">
            {/* Subscription Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Current Plan</p>
                <p className="font-medium">{tierInfo.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Monthly Price</p>
                <p className="font-medium">{formatCurrency(billing.monthlyPrice)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Billing Period
                </p>
                <p className="text-sm">
                  {formatDate(billing.currentPeriodStart)} - {formatDate(billing.currentPeriodEnd)}
                </p>
              </div>
              {billing.paymentMethod && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Payment Method</p>
                  <p className="text-sm capitalize">
                    {billing.paymentMethod.brand} •••• {billing.paymentMethod.last4}
                  </p>
                </div>
              )}
            </div>

            {/* Past Due Warning */}
            {billing.status === 'past_due' && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-status-warning/10 text-status-warning text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Payment is past due. Please update payment method.</span>
              </div>
            )}

            {/* Recent Payments */}
            {paymentHistory.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Recent Payments</p>
                <div className="space-y-2">
                  {paymentHistory.slice(0, 3).map((payment) => (
                    <div 
                      key={payment.id} 
                      className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'h-2 w-2 rounded-full',
                          payment.status === 'paid' ? 'bg-status-active' :
                          payment.status === 'pending' ? 'bg-status-warning' : 'bg-status-inactive'
                        )} />
                        <span>{formatDate(payment.date)}</span>
                        <span className="text-muted-foreground">{payment.description}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(payment.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={onUpgrade}>
                <TrendingUp className="h-3.5 w-3.5" />
                Upgrade Plan
              </Button>
              <Button variant="ghost" size="sm">
                View All Invoices
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
