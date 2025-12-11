import { Settings, ExternalLink, AlertCircle, Check, Import, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Integration } from '@/types';
import { AppTag } from './AppTag';
import { cn } from '@/lib/utils';
import { CONTROL_CENTER_ANALYSIS } from '@/utils/controlCenterAnalyzer';
import { IN_APP_ALTERNATIVES } from '@/contexts/IntegrationsContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface IntegrationCardProps {
  integration: Integration;
  onConfigure?: () => void;
  onConnect?: () => void;
  onRemoveApp?: (siteId: string) => void;
  animationDelay?: number;
  showCriticality?: boolean;
}

type Criticality = 'critical' | 'important' | 'optional';

function getCriticality(integrationId: string): Criticality {
  if (CONTROL_CENTER_ANALYSIS.criticalIntegrations.some(i => i.id === integrationId)) return 'critical';
  if (CONTROL_CENTER_ANALYSIS.importantIntegrations.some(i => i.id === integrationId)) return 'important';
  return 'optional';
}

const criticalityConfig: Record<Criticality, { label: string; className: string }> = {
  critical: { label: 'Critical', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
  important: { label: 'Important', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  optional: { label: 'Optional', className: 'bg-muted text-muted-foreground border-border' },
};

export function IntegrationCard({ 
  integration, 
  onConfigure,
  onConnect,
  onRemoveApp,
  animationDelay = 0,
  showCriticality = false,
}: IntegrationCardProps) {
  const hasLinkedApps = integration.linkedApps.length > 0;
  const isImported = integration.status === 'imported' || integration.status === 'active';
  const needsSetup = isImported && integration.status === 'imported';
  const criticality = getCriticality(integration.id);
  const criticalityStyle = criticalityConfig[criticality];
  const inAppAlt = IN_APP_ALTERNATIVES[integration.id];
  const isInAppActive = inAppAlt && integration.status === 'active';

  return (
    <div
      className={cn(
        "group rounded-xl border bg-card p-5 transition-all duration-300 hover:shadow-card opacity-0 animate-slide-up",
        hasLinkedApps ? "border-primary/30" : "border-border hover:border-primary/20",
        isInAppActive && "border-status-active/40 bg-status-active/5"
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{integration.icon}</span>
          <div>
            <h3 className="font-semibold">{integration.name}</h3>
            {showCriticality && !isInAppActive && (
              <span className={cn(
                "inline-block text-[10px] px-1.5 py-0.5 rounded border mt-1",
                criticalityStyle.className
              )}>
                {criticalityStyle.label}
              </span>
            )}
          </div>
        </div>
        {isInAppActive ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className="gap-1 bg-status-active/20 text-status-active border-status-active/30">
                <Sparkles className="h-3 w-3" />
                In-App
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[200px]">
              <p className="font-medium">{inAppAlt.name}</p>
              <p className="text-xs text-muted-foreground">{inAppAlt.description}</p>
            </TooltipContent>
          </Tooltip>
        ) : isImported && (
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
        {isInAppActive ? inAppAlt.description : integration.description}
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
        {isInAppActive ? (
          <div className="text-xs text-status-active flex items-center gap-1.5 flex-1">
            <Check className="h-3.5 w-3.5" />
            Working automatically
          </div>
        ) : isImported ? (
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
