import { useState } from 'react';
import { Menu, X, Zap } from 'lucide-react';
import { 
  LayoutDashboard, 
  Building2, 
  Globe, 
  Users, 
  Shield, 
  Plug, 
  ScrollText,
  Settings,
  HelpCircle,
  Mail,
  Share2,
  KeyRound,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/' },
  { icon: CreditCard, label: 'Billing', path: '/nexuspay' },
  { icon: Mail, label: 'Mail', path: '/mail' },
  { icon: KeyRound, label: 'Password Manager', path: '/passwords' },
  { icon: Building2, label: 'Tenants', path: '/tenants' },
  { icon: Globe, label: 'Sites', path: '/sites' },
  { icon: Users, label: 'Users', path: '/users' },
];

const configNavItems = [
  { icon: Shield, label: 'Roles', path: '/roles' },
  { icon: Plug, label: 'Integrations', path: '/integrations' },
  { icon: Share2, label: 'Social Prefill', path: '/social-prefill' },
  { icon: ScrollText, label: 'Audit Logs', path: '/audit-logs' },
  { icon: Sparkles, label: 'Guided Tour', path: '/guided-tour' },
];

const NavItem = ({ 
  item, 
  onClick 
}: { 
  item: typeof mainNavItems[0]; 
  onClick: () => void;
}) => (
  <NavLink
    to={item.path}
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
      "text-muted-foreground hover:text-foreground hover:bg-secondary"
    )}
    activeClassName="bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
  >
    <item.icon className="h-4 w-4" />
    {item.label}
  </NavLink>
);

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  const closeSheet = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="h-16 flex flex-row items-center gap-2 px-5 border-b border-border">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <SheetTitle className="font-semibold text-lg tracking-tight">Control Center</SheetTitle>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavItem key={item.path} item={item} onClick={closeSheet} />
            ))}
          </div>

          <div className="mt-8">
            <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Configuration
            </p>
            <div className="space-y-1">
              {configNavItems.map((item) => (
                <NavItem key={item.path} item={item} onClick={closeSheet} />
              ))}
            </div>
          </div>
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <NavLink
            to="/settings"
            onClick={closeSheet}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
            activeClassName="bg-primary/10 text-primary"
          >
            <Settings className="h-4 w-4" />
            Settings
          </NavLink>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
          >
            <HelpCircle className="h-4 w-4" />
            Help & Docs
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
