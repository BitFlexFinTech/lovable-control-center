import { useState } from 'react';
import { ChevronDown, ChevronUp, Edit, Rocket, Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CredentialCard } from './CredentialCard';
import { StoredCredential } from '@/types/credentials';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface SiteCredentialGroupProps {
  siteId: string;
  siteName: string;
  siteDomain: string;
  siteColor: string;
  credentials: StoredCredential[];
  status: 'demo' | 'live';
  isControlCenter?: boolean;
  onGoLive?: () => void;
  onEditAll?: () => void;
}

export function SiteCredentialGroup({
  siteId,
  siteName,
  siteDomain,
  siteColor,
  credentials,
  status,
  isControlCenter = false,
  onGoLive,
  onEditAll,
}: SiteCredentialGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={cn(
      "rounded-xl border overflow-hidden transition-all",
      status === 'demo' 
        ? "border-status-warning/30 bg-status-warning/5" 
        : "border-status-active/30 bg-status-active/5"
    )}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div 
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: siteColor }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{siteName}</h3>
                  {isControlCenter && (
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                      Platform
                    </Badge>
                  )}
                  {status === 'live' && (
                    <Badge className="text-xs bg-status-active/20 text-status-active border-status-active/30 gap-1">
                      <Check className="h-3 w-3" />
                      Live
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{siteDomain}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {credentials.length} credentials
              </Badge>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-2">
            {credentials.map(cred => (
              <CredentialCard key={cred.id} credential={cred} compact />
            ))}
            
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1.5"
                onClick={onEditAll}
              >
                <Edit className="h-3.5 w-3.5" />
                Edit All
              </Button>
              {status === 'demo' && onGoLive && (
                <Button 
                  size="sm" 
                  className="gap-1.5 bg-status-active hover:bg-status-active/90"
                  onClick={onGoLive}
                >
                  <Rocket className="h-3.5 w-3.5" />
                  Go Live
                </Button>
              )}
              {status === 'live' && (
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
