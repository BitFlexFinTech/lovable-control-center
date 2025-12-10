import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Globe,
  Users,
  Shield,
  Plug,
  ScrollText,
  Settings,
  Mail,
  KeyRound,
  Share2,
  Sparkles,
  Plus,
  RefreshCw,
  Moon,
  Sun,
  Search,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import { sites } from '@/data/seed-data';

const navigationItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/', keywords: 'dashboard home' },
  { icon: Mail, label: 'Mail', path: '/mail', keywords: 'email inbox messages' },
  { icon: KeyRound, label: 'Password Manager', path: '/passwords', keywords: 'credentials vault' },
  { icon: Building2, label: 'Tenants', path: '/tenants', keywords: 'workspaces organizations' },
  { icon: Globe, label: 'Sites', path: '/sites', keywords: 'websites domains' },
  { icon: Users, label: 'Users', path: '/users', keywords: 'team members' },
  { icon: Shield, label: 'Roles', path: '/roles', keywords: 'permissions access' },
  { icon: Plug, label: 'Integrations', path: '/integrations', keywords: 'connections apps' },
  { icon: Share2, label: 'Social Prefill', path: '/social-prefill', keywords: 'accounts' },
  { icon: ScrollText, label: 'Audit Logs', path: '/audit-logs', keywords: 'history activity' },
  { icon: Sparkles, label: 'Guided Tour', path: '/guided-tour', keywords: 'help onboarding' },
  { icon: Settings, label: 'Settings', path: '/settings', keywords: 'preferences config' },
];

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { setTheme, theme } = useTheme();
  const { toast } = useToast();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.path}
              value={`${item.label} ${item.keywords}`}
              onSelect={() => runCommand(() => navigate(item.path))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Sites">
          {sites.slice(0, 5).map((site) => (
            <CommandItem
              key={site.id}
              value={`site ${site.name} ${site.domain}`}
              onSelect={() => runCommand(() => navigate(`/sites`))}
            >
              <Globe className="mr-2 h-4 w-4" />
              {site.name}
              <span className="ml-2 text-xs text-muted-foreground">{site.domain}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Actions">
          <CommandItem
            value="create new site add"
            onSelect={() => runCommand(() => {
              navigate('/sites');
              toast({ title: 'Create Site', description: 'Opening site creation...' });
            })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Site
          </CommandItem>
          <CommandItem
            value="refresh sync data"
            onSelect={() => runCommand(() => {
              toast({ title: 'Syncing', description: 'Refreshing all data...' });
            })}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync All Data
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Theme">
          <CommandItem
            value="light mode theme"
            onSelect={() => runCommand(() => setTheme('light'))}
          >
            <Sun className="mr-2 h-4 w-4" />
            Light Mode
            {theme === 'light' && <span className="ml-auto text-xs text-primary">Active</span>}
          </CommandItem>
          <CommandItem
            value="dark mode theme"
            onSelect={() => runCommand(() => setTheme('dark'))}
          >
            <Moon className="mr-2 h-4 w-4" />
            Dark Mode
            {theme === 'dark' && <span className="ml-auto text-xs text-primary">Active</span>}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
