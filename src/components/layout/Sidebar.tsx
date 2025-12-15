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
  Zap,
  Mail,
  Share2,
  KeyRound,
  Sparkles,
  CreditCard,
  Search,
  MessageCircle,
  Youtube,
  Bot
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/', tourId: 'nav-overview' },
  { icon: CreditCard, label: 'Billing', path: '/nexuspay', tourId: 'nav-billing' },
  { icon: Mail, label: 'Mail', path: '/mail', tourId: 'nav-mail' },
  { icon: MessageCircle, label: 'WhatsApp', path: '/whatsapp', tourId: 'nav-whatsapp' },
  { icon: Youtube, label: 'StreamEngine', path: '/streamengine', tourId: 'nav-streamengine' },
  { icon: Bot, label: 'QuantOps', path: '/quantops', tourId: 'nav-quantops' },
  { icon: KeyRound, label: 'Password Manager', path: '/passwords', tourId: 'nav-passwords' },
  { icon: Building2, label: 'Tenants', path: '/tenants', tourId: 'nav-tenants' },
  { icon: Globe, label: 'Sites', path: '/sites', tourId: 'nav-sites' },
  { icon: Users, label: 'Users', path: '/users', tourId: 'nav-users' },
];

const configNavItems = [
  { icon: Search, label: 'Analyze', path: '/analyze', tourId: 'nav-analyze' },
  { icon: Shield, label: 'Roles', path: '/roles', tourId: 'nav-roles' },
  { icon: Plug, label: 'Integrations', path: '/integrations', tourId: 'nav-integrations' },
  { icon: Share2, label: 'Social Prefill', path: '/social-prefill', tourId: 'nav-social-prefill' },
  { icon: ScrollText, label: 'Audit Logs', path: '/audit-logs', tourId: 'nav-audit-logs' },
  { icon: Sparkles, label: 'Guided Tour', path: '/guided-tour', tourId: 'nav-guided-tour' },
];

const NavItem = ({ item }: { item: typeof mainNavItems[0] }) => (
  <NavLink
    to={item.path}
    data-tour={item.tourId}
    className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
      "text-muted-foreground hover:text-foreground hover:bg-secondary"
    )}
    activeClassName="bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
  >
    <item.icon className="h-4 w-4" />
    {item.label}
  </NavLink>
);

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-5 border-b border-sidebar-border" data-tour="sidebar-logo">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-lg tracking-tight">Control Center</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </div>

        <div className="mt-8">
          <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Configuration
          </p>
          <div className="space-y-1">
            {configNavItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <NavLink
          to="/settings"
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
    </aside>
  );
}
