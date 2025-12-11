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
  Loader2,
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
import { useFuzzySearch } from '@/hooks/useFuzzySearch';

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
  const [search, setSearch] = React.useState('');
  const navigate = useNavigate();
  const { setTheme, theme } = useTheme();
  const { toast } = useToast();
  
  // Fuzzy search from Supabase
  const searchResults = useFuzzySearch(search);

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
    setSearch('');
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Type a command or search..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {/* Search Results from Supabase */}
        {search.length > 0 && searchResults.length > 0 && (
          <>
            <CommandGroup heading="Search Results">
              {searchResults.map((result) => (
                <CommandItem
                  key={`${result.type}-${result.id}`}
                  value={`search ${result.title} ${result.subtitle}`}
                  onSelect={() => runCommand(() => navigate(result.path))}
                >
                  {result.type === 'site' && <Globe className="mr-2 h-4 w-4" />}
                  {result.type === 'tenant' && <Building2 className="mr-2 h-4 w-4" />}
                  {result.type === 'user' && <Users className="mr-2 h-4 w-4" />}
                  <span>{result.title}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{result.subtitle}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}
        
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