import { Plug, Check, ExternalLink, Settings } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const integrations = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and subscription management',
    icon: '💳',
    connected: true,
    category: 'Payments',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team notifications and alerts',
    icon: '💬',
    connected: true,
    category: 'Communication',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Version control and deployments',
    icon: '🐙',
    connected: false,
    category: 'Development',
  },
  {
    id: 'analytics',
    name: 'Google Analytics',
    description: 'Website traffic and user behavior',
    icon: '📊',
    connected: true,
    category: 'Analytics',
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Transactional and marketing emails',
    icon: '✉️',
    connected: false,
    category: 'Communication',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Frontend deployment and hosting',
    icon: '▲',
    connected: false,
    category: 'Development',
  },
];

const Integrations = () => {
  const categories = [...new Set(integrations.map(i => i.category))];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 opacity-0 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
            <p className="text-muted-foreground mt-1">
              Connect third-party services to extend functionality
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories.map((category, catIndex) => (
        <div key={category} className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 opacity-0 animate-fade-in" style={{ animationDelay: `${catIndex * 50}ms` }}>
            {category}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations
              .filter(i => i.category === category)
              .map((integration, index) => (
                <div
                  key={integration.id}
                  className={cn(
                    "group rounded-xl border bg-card p-5 transition-all duration-300 hover:shadow-card opacity-0 animate-slide-up",
                    integration.connected ? "border-primary/30" : "border-border hover:border-primary/20"
                  )}
                  style={{ animationDelay: `${(catIndex * 3 + index) * 50 + 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <h3 className="font-semibold">{integration.name}</h3>
                      </div>
                    </div>
                    {integration.connected && (
                      <Badge variant="active" className="gap-1">
                        <Check className="h-3 w-3" />
                        Connected
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {integration.description}
                  </p>

                  <div className="flex items-center gap-2">
                    {integration.connected ? (
                      <>
                        <Button variant="subtle" size="sm" className="flex-1 gap-1.5">
                          <Settings className="h-3.5 w-3.5" />
                          Configure
                        </Button>
                        <Button variant="ghost" size="icon-sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                        <Plug className="h-3.5 w-3.5" />
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </DashboardLayout>
  );
};

export default Integrations;
