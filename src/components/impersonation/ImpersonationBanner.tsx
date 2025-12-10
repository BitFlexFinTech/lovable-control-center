import { AlertTriangle, X } from 'lucide-react';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
};

export const ImpersonationBanner = () => {
  const { isImpersonating, impersonatedRole, currentSession, endImpersonation } = useImpersonation();

  if (!isImpersonating || !impersonatedRole) return null;

  const duration = currentSession 
    ? Math.floor((Date.now() - new Date(currentSession.started_at).getTime()) / 1000 / 60)
    : 0;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-[100] px-4 py-2",
      "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500",
      "text-white shadow-lg animate-pulse-slow"
    )}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <div className="flex items-center gap-2 text-sm font-medium">
            <span>Viewing as</span>
            <span className="bg-white/20 px-2 py-0.5 rounded font-bold">
              {ROLE_LABELS[impersonatedRole]}
            </span>
            {currentSession?.reason && (
              <span className="opacity-80">• {currentSession.reason}</span>
            )}
            <span className="opacity-60">• {duration}m active</span>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={endImpersonation}
          className="text-white hover:bg-white/20 gap-1.5"
        >
          <X className="h-4 w-4" />
          End Session
        </Button>
      </div>
    </div>
  );
};