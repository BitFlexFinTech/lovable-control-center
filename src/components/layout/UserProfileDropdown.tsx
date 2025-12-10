import { User, Settings, Building2, LogOut, ChevronDown, Keyboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function UserProfileDropdown() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut, isAdmin } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email || 'User';
  const displayEmail = user?.email || '';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
    navigate('/auth');
  };

  const handleShowShortcuts = () => {
    // Trigger the keyboard shortcuts modal by dispatching a '?' key event
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '?', shiftKey: true }));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {isAdmin ? 'Admin' : 'User'}
            </p>
          </div>
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">{displayEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          Account Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/tenants')} className="cursor-pointer">
          <Building2 className="mr-2 h-4 w-4" />
          Switch Workspace
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShowShortcuts} className="cursor-pointer">
          <Keyboard className="mr-2 h-4 w-4" />
          Keyboard Shortcuts
          <span className="ml-auto text-xs text-muted-foreground">?</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
