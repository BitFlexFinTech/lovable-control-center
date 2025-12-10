import { Search, Command } from 'lucide-react';
import { TenantSwitcher } from '@/components/TenantSwitcher';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { NotificationCenter } from '@/components/monitoring/NotificationCenter';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { users } from '@/data/seed-data';

export function TopBar() {
  const currentUser = users[0]; // Mock current user

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side - Tenant Switcher */}
        <TenantSwitcher />

        {/* Center - Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search sites, users..."
              className="w-full h-9 pl-9 pr-12 bg-secondary border border-transparent rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 h-5 bg-muted rounded text-[10px] text-muted-foreground font-medium">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </div>
        </div>

        {/* Right side - Theme, Cart, Notifications & Profile */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          <CartDrawer />
          
          <NotificationCenter />
          
          <div className="h-6 w-px bg-border" />
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium leading-none">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
            </div>
            <Avatar className="h-8 w-8 border border-border">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
