import { useAdminPresence, OnlineAdmin } from '@/hooks/useAdminPresence';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export const OnlineAdmins = () => {
  const { onlineAdmins, isConnected } = useAdminPresence();

  if (!isConnected || onlineAdmins.length === 0) return null;

  const displayAdmins = onlineAdmins.slice(0, 5);
  const remainingCount = onlineAdmins.length - 5;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <div className="flex -space-x-2">
          {displayAdmins.map((admin) => (
            <Tooltip key={admin.id}>
              <TooltipTrigger asChild>
                <button type="button" className="relative focus:outline-none">
                  <Avatar className="h-7 w-7 border-2 border-background">
                    <AvatarImage src={admin.avatar_url || undefined} />
                    <AvatarFallback className="text-[10px]">
                      {admin.full_name?.split(' ').map(n => n[0]).join('') || admin.email?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className={cn(
                    "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background",
                    "bg-status-active animate-pulse"
                  )} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p className="font-medium">{admin.full_name || 'Unknown'}</p>
                <p className="text-muted-foreground">{admin.email}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {remainingCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium focus:outline-none">
                  +{remainingCount}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p>{remainingCount} more online</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        
        <span className="text-xs text-muted-foreground ml-1">
          {onlineAdmins.length} online
        </span>
      </div>
    </TooltipProvider>
  );
};