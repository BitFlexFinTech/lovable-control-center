import { ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface IntegrationSectionProps {
  title: string;
  description: string;
  variant: 'control-center' | 'created-sites';
  activeCount: number;
  totalCount: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function IntegrationSection({
  title,
  description,
  variant,
  activeCount,
  totalCount,
  isOpen,
  onOpenChange,
  children,
}: IntegrationSectionProps) {
  const isControlCenter = variant === 'control-center';
  
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange} className="mb-6">
      <div className={cn(
        "rounded-xl border-2 overflow-hidden",
        isControlCenter 
          ? "border-primary/30" 
          : "border-status-active/30"
      )}>
        <CollapsibleTrigger asChild>
          <div className={cn(
            "flex items-center justify-between p-4 cursor-pointer transition-colors",
            isControlCenter
              ? "bg-primary/10 hover:bg-primary/15"
              : "bg-status-active/10 hover:bg-status-active/15"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-3 w-3 rounded-full",
                isControlCenter ? "bg-primary" : "bg-status-active"
              )} />
              <div>
                <h2 className={cn(
                  "font-semibold uppercase tracking-wide",
                  isControlCenter ? "text-primary" : "text-status-active"
                )}>
                  {title}
                </h2>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn(
                  isControlCenter 
                    ? "border-primary/50 text-primary" 
                    : "border-status-active/50 text-status-active"
                )}
              >
                {activeCount}/{totalCount} active
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
          <div className={cn(
            "p-4",
            isControlCenter ? "bg-primary/5" : "bg-status-active/5"
          )}>
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
