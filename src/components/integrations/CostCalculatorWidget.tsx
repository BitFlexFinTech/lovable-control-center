import { useState, useMemo } from 'react';
import { Calculator, TrendingUp, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { INTEGRATION_PRICING, calculateTotalMonthlyCost, getFreeTierStatus } from '@/utils/integrationCosts';
import { useIntegrations } from '@/contexts/IntegrationsContext';
import { CONTROL_CENTER_INTEGRATIONS } from '@/types/credentials';
import { UsageMetrics } from '@/types/integrationHealth';
import { cn } from '@/lib/utils';

const integrationNames: Record<string, string> = {
  supabase: 'Supabase',
  sendgrid: 'SendGrid',
  'gmail-api': 'Gmail API',
  github: 'GitHub',
  slack: 'Slack',
  namecheap: 'Namecheap',
  letsencrypt: "Let's Encrypt",
  'lovable-cloud': 'Lovable Cloud',
  'google-analytics': 'Google Analytics',
  'microsoft-graph': 'Microsoft Graph',
  'aws-s3': 'AWS S3',
  discord: 'Discord',
  stripe: 'Stripe',
};

export function CostCalculatorWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [usage, setUsage] = useState<UsageMetrics>({
    emailsPerMonth: 1000,
    activeUsers: 100,
    databaseSize: 100,
    storage: 500,
    apiCalls: 10000,
    domains: 1,
  });

  const { integrations } = useIntegrations();
  
  const activeIntegrations = useMemo(() => 
    CONTROL_CENTER_INTEGRATIONS.filter(id => 
      integrations.find(i => i.id === id)?.linkedApps.some(a => a.siteId === 'control-center')
    ),
    [integrations]
  );

  const { total, breakdown } = useMemo(
    () => calculateTotalMonthlyCost(activeIntegrations, usage),
    [activeIntegrations, usage]
  );

  const freeCount = activeIntegrations.filter(id => getFreeTierStatus(id) === 'free').length;
  const freemiumCount = activeIntegrations.filter(id => getFreeTierStatus(id) === 'freemium').length;
  const paidCount = activeIntegrations.filter(id => getFreeTierStatus(id) === 'paid').length;

  const potentialSavings = Object.entries(breakdown)
    .filter(([_, cost]) => cost > 0)
    .reduce((sum, [_, cost]) => sum + cost, 0);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calculator className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Monthly Cost Estimate</CardTitle>
              <p className="text-sm text-muted-foreground">
                Based on {activeIntegrations.length} active integrations
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              ${total.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">/month</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-status-active/10">
            <div className="text-lg font-semibold text-status-active">{freeCount}</div>
            <div className="text-xs text-muted-foreground">Free</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-status-warning/10">
            <div className="text-lg font-semibold text-status-warning">{freemiumCount}</div>
            <div className="text-xs text-muted-foreground">Freemium</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-primary/10">
            <div className="text-lg font-semibold text-primary">{paidCount}</div>
            <div className="text-xs text-muted-foreground">Paid</div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between h-auto py-2">
              <span className="text-sm font-medium">Cost Breakdown</span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            {/* Integration Costs */}
            <div className="space-y-2">
              {activeIntegrations.map(id => {
                const pricing = INTEGRATION_PRICING[id];
                const cost = breakdown[id] || 0;
                const tierStatus = getFreeTierStatus(id);
                
                return (
                  <div 
                    key={id}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{pricing?.icon || '🔌'}</span>
                      <span className="text-sm">{integrationNames[id] || id}</span>
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          'text-xs',
                          tierStatus === 'free' && 'bg-status-active/10 text-status-active',
                          tierStatus === 'freemium' && 'bg-status-warning/10 text-status-warning',
                          tierStatus === 'paid' && 'bg-primary/10 text-primary'
                        )}
                      >
                        {tierStatus === 'free' ? 'Free' : tierStatus === 'freemium' ? 'Free Tier' : 'Paid'}
                      </Badge>
                    </div>
                    <span className={cn(
                      'text-sm font-medium',
                      cost === 0 ? 'text-status-active' : 'text-foreground'
                    )}>
                      ${cost.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Usage Sliders */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Adjust Usage Projections
              </h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Emails/month</span>
                    <span className="font-medium">{usage.emailsPerMonth.toLocaleString()}</span>
                  </div>
                  <Slider
                    value={[usage.emailsPerMonth]}
                    min={0}
                    max={100000}
                    step={1000}
                    onValueChange={([val]) => setUsage(prev => ({ ...prev, emailsPerMonth: val }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Users</span>
                    <span className="font-medium">{usage.activeUsers.toLocaleString()}</span>
                  </div>
                  <Slider
                    value={[usage.activeUsers]}
                    min={0}
                    max={50000}
                    step={100}
                    onValueChange={([val]) => setUsage(prev => ({ ...prev, activeUsers: val }))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Storage (MB)</span>
                    <span className="font-medium">{usage.storage.toLocaleString()} MB</span>
                  </div>
                  <Slider
                    value={[usage.storage]}
                    min={0}
                    max={10000}
                    step={100}
                    onValueChange={([val]) => setUsage(prev => ({ ...prev, storage: val }))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Domains</span>
                    <span className="font-medium">{usage.domains}</span>
                  </div>
                  <Slider
                    value={[usage.domains]}
                    min={0}
                    max={20}
                    step={1}
                    onValueChange={([val]) => setUsage(prev => ({ ...prev, domains: val }))}
                  />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Savings Tip */}
        <Alert className="bg-status-active/5 border-status-active/20">
          <Lightbulb className="h-4 w-4 text-status-active" />
          <AlertDescription className="text-sm text-status-active">
            You're using {freeCount} free-tier integrations.{' '}
            {potentialSavings > 0 ? (
              <>Upgrade to unlock more features (est. +${potentialSavings.toFixed(2)}/mo)</>
            ) : (
              <>Optimal cost configuration!</>
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
