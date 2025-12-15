import { Search, Command } from 'lucide-react';
import { TenantSwitcher } from '@/components/TenantSwitcher';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { NotificationCenter } from '@/components/monitoring/NotificationCenter';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { UserProfileDropdown } from '@/components/layout/UserProfileDropdown';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { ImpersonationBanner } from '@/components/impersonation/ImpersonationBanner';
import { ImpersonationDialog } from '@/components/impersonation/ImpersonationDialog';
import { OnlineAdmins } from '@/components/dashboard/OnlineAdmins';

export function TopBar() {
  const handleSearchClick = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  return (
    <>
      <ImpersonationBanner />
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-40">
        <div className="flex items-center justify-between h-full px-4 md:px-6">
          {/* Left side - Mobile Menu + Tenant Switcher */}
          <div className="flex items-center gap-2">
            <MobileSidebar />
            <TenantSwitcher />
          </div>

          {/* Center - Search (triggers command palette) */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <button 
              onClick={handleSearchClick}
              className="relative w-full group"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <div
                className="w-full h-9 pl-9 pr-12 bg-secondary border border-transparent rounded-lg text-sm text-muted-foreground text-left flex items-center group-hover:border-primary/50 transition-all cursor-pointer"
              >
                Search sites, users...
              </div>
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 h-5 bg-muted rounded text-[10px] text-muted-foreground font-medium">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>
          </div>

          {/* Right side - Theme, Cart, Notifications & Profile */}
          <div className="flex items-center gap-2 md:gap-3">
            <OnlineAdmins />
            <ImpersonationDialog />
            <ThemeToggle />
            <CartDrawer />
            <NotificationCenter />
            <div className="h-6 w-px bg-border hidden sm:block" />
            <UserProfileDropdown />
          </div>
        </div>
      </header>
    </>
  );
}