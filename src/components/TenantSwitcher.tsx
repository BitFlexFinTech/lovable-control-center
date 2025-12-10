import { useState } from 'react';
import { Check, ChevronDown, Building2, Globe } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function TenantSwitcher() {
  const { currentTenant, allTenants, setCurrentTenant } = useTenant();
  const [open, setOpen] = useState(false);

  const displayName = currentTenant?.name || 'All Tenants';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[220px] justify-between bg-card hover:bg-secondary"
        >
          <div className="flex items-center gap-2 truncate">
            {currentTenant ? (
              <Building2 className="h-4 w-4 text-primary shrink-0" />
            ) : (
              <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className="truncate">{displayName}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-1" align="start">
        <div className="space-y-0.5">
          <button
            onClick={() => {
              setCurrentTenant(null);
              setOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
              !currentTenant 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-secondary text-foreground"
            )}
          >
            <Globe className="h-4 w-4" />
            <span className="flex-1 text-left">All Tenants</span>
            {!currentTenant && <Check className="h-4 w-4" />}
          </button>
          
          <div className="h-px bg-border my-1" />
          
          {allTenants.map((tenant) => (
            <button
              key={tenant.id}
              onClick={() => {
                setCurrentTenant(tenant);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                currentTenant?.id === tenant.id 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-secondary text-foreground"
              )}
            >
              <Building2 className="h-4 w-4" />
              <span className="flex-1 text-left truncate">{tenant.name}</span>
              <Badge 
                variant={tenant.environment === 'production' ? 'active' : 'muted'}
                className="text-[10px] px-1.5"
              >
                {tenant.environment.slice(0, 4)}
              </Badge>
              {currentTenant?.id === tenant.id && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
