import { Settings, ExternalLink, AlertCircle, Check, Import } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Integration } from '@/types';
import { AppTag } from './AppTag';
import { cn } from '@/lib/utils';

interface IntegrationCardProps {
  integration: Integration;
  onConfigure?: () => void;
  onConnect?: () => void;
  onRemoveApp?: (siteId: string) => void;
  animationDelay?: number;
}

export function IntegrationCard({ 
  integration, 
  onConfigure,
  onConnect,
  onRemoveApp,
  animationDelay = 0 
}: IntegrationCardProps) {
  const hasLinkedApps = integration.linkedApps.length > 0;
  const isImported = integration.status === 'imported' || integration.status === 'active';
  const needsSetup = isImported && integration.status === 'imported';

  return (
    <div
      className={cn(
        "group rounded-xl border bg-card p-5 transition-all duration-300 hover:shadow-card opacity-0 animate-slide-up",
        hasLinkedApps ? "border-primary/30" : "border-border hover:border-primary/20"
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{integration.icon}</span>
          <div>
            <h3 className="font-semibold">{integration.name}</h3>
          </div>
        </div>
        {isImported && (
          <Badge 
            variant={integration.status === 'active' ? 'active' : 'default'}
            className="gap-1"
          >
            {integration.status === 'active' ? (
              <>
                <Check className="h-3 w-3" />
                Active
              </>
            ) : (
              <>
                <Import className="h-3 w-3" />
                Imported
              </>
            )}
          </Badge>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        {integration.description}
      </p>

      {/* Linked Apps */}
      {hasLinkedApps && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Used by:</p>
          <div className="flex flex-wrap gap-1.5">
            {integration.linkedApps.map(app => (
              <AppTag 
                key={app.siteId} 
                app={app} 
                onRemove={onRemoveApp ? () => onRemoveApp(app.siteId) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Setup Required Warning */}
      {needsSetup && (
        <div className="flex items-center gap-2 text-xs text-amber-500 mb-3 p-2 rounded-md bg-amber-500/10">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Setup required - Add credentials to activate</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {isImported ? (
          <>
            <Button 
              variant="subtle" 
              size="sm" 
              className="flex-1 gap-1.5"
              onClick={onConfigure}
            >
              <Settings className="h-3.5 w-3.5" />
              {needsSetup ? 'Complete Setup' : 'Configure'}
            </Button>
            <Button variant="ghost" size="icon-sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-1.5" 
            onClick={onConnect}
            disabled={!onConnect}
          >
            <Import className="h-3.5 w-3.5" />
            {onConnect ? 'Connect' : 'Not in use'}
          </Button>
        )}
      </div>
    </div>
  );
}
