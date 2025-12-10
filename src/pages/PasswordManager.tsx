import { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  KeyRound,
  ChevronDown,
  ChevronUp,
  FileJson,
  FileSpreadsheet,
  Filter,
  Shield
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { SiteCredentialGroup } from '@/components/passwords/SiteCredentialGroup';
import { TwoFactorManager } from '@/components/passwords/TwoFactorManager';
import { GoLiveDialog } from '@/components/sites/GoLiveDialog';
import { usePasswordManager } from '@/contexts/PasswordManagerContext';
import { useTwoFactor } from '@/contexts/TwoFactorContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function PasswordManager() {
  const { toast } = useToast();
  const { 
    credentials, 
    getDemoCredentials, 
    getLiveCredentials,
    getDemoCount,
    getLiveCount,
    getTotalCount,
    promoteToLive,
  } = usePasswordManager();
  const { getAccountCount } = useTwoFactor();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [demoExpanded, setDemoExpanded] = useState(true);
  const [liveExpanded, setLiveExpanded] = useState(true);
  const [goLiveDialogOpen, setGoLiveDialogOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<{
    siteId: string;
    siteName: string;
    siteDomain: string;
  } | null>(null);

  // Get unique sites
  const sites = useMemo(() => {
    const siteMap = new Map<string, { id: string; name: string; domain: string }>();
    credentials.forEach(c => {
      if (!siteMap.has(c.siteId)) {
        siteMap.set(c.siteId, { id: c.siteId, name: c.siteName, domain: c.siteDomain });
      }
    });
    return Array.from(siteMap.values());
  }, [credentials]);

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(credentials.map(c => c.category))];
  }, [credentials]);

  // Filter credentials
  const filteredCredentials = useMemo(() => {
    return credentials.filter(c => {
      const matchesSearch = 
        c.integrationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.siteName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSite = siteFilter === 'all' || c.siteId === siteFilter;
      const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
      return matchesSearch && matchesSite && matchesCategory;
    });
  }, [credentials, searchQuery, siteFilter, categoryFilter]);

  // Group by site and status
  const groupedCredentials = useMemo(() => {
    const demo: Record<string, typeof filteredCredentials> = {};
    const live: Record<string, typeof filteredCredentials> = {};

    filteredCredentials.forEach(c => {
      if (c.status === 'demo') {
        if (!demo[c.siteId]) demo[c.siteId] = [];
        demo[c.siteId].push(c);
      } else {
        if (!live[c.siteId]) live[c.siteId] = [];
        live[c.siteId].push(c);
      }
    });

    return { demo, live };
  }, [filteredCredentials]);

  const handleGoLive = (siteId: string, siteName: string, siteDomain: string) => {
    setSelectedSite({ siteId, siteName, siteDomain });
    setGoLiveDialogOpen(true);
  };

  const handleGoLiveConfirm = async () => {
    if (!selectedSite) return;
    promoteToLive(selectedSite.siteId);
    toast({
      title: 'Site is now live!',
      description: `${selectedSite.siteName} has been activated with all integration accounts.`,
    });
  };

  const exportCredentials = (format: 'json' | 'csv') => {
    const data = filteredCredentials.map(c => ({
      site: c.siteName,
      integration: c.integrationName,
      email: c.email,
      password: c.password,
      status: c.status,
      ...c.additionalFields,
    }));

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'credentials.json';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = ['Site', 'Integration', 'Email', 'Password', 'Status'];
      const rows = data.map(d => [d.site, d.integration, d.email, d.password, d.status]);
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'credentials.csv';
      a.click();
      URL.revokeObjectURL(url);
    }

    toast({ title: `Exported as ${format.toUpperCase()}` });
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 opacity-0 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <KeyRound className="h-6 w-6 text-primary" />
              Password Manager
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage all your integration credentials in one secure place
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportCredentials('json')}>
                <FileJson className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportCredentials('csv')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6 opacity-0 animate-fade-in" style={{ animationDelay: '50ms' }}>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-2xl font-bold">{getTotalCount()}</p>
          <p className="text-sm text-muted-foreground">Total Credentials</p>
        </div>
        <div className="p-4 rounded-xl border border-status-warning/30 bg-status-warning/5">
          <p className="text-2xl font-bold text-status-warning">{getDemoCount()}</p>
          <p className="text-sm text-muted-foreground">Demo</p>
        </div>
        <div className="p-4 rounded-xl border border-status-active/30 bg-status-active/5">
          <p className="text-2xl font-bold text-status-active">{getLiveCount()}</p>
          <p className="text-sm text-muted-foreground">Live</p>
        </div>
        <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <p className="text-2xl font-bold text-primary">{getAccountCount()}</p>
          </div>
          <p className="text-sm text-muted-foreground">2FA Accounts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search credentials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={siteFilter} onValueChange={setSiteFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Sites" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sites</SelectItem>
            {sites.map(site => (
              <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 2FA Section */}
      <TwoFactorManager />

      {/* Demo Section */}
      <Collapsible open={demoExpanded} onOpenChange={setDemoExpanded} className="mb-6">
        <div className={cn(
          "rounded-xl border-2 border-status-warning/30 overflow-hidden",
          "opacity-0 animate-fade-in"
        )} style={{ animationDelay: '150ms' }}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 bg-status-warning/10 cursor-pointer hover:bg-status-warning/15 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-status-warning animate-pulse" />
                <div>
                  <h2 className="font-semibold text-status-warning">DEMO CREDENTIALS</h2>
                  <p className="text-sm text-muted-foreground">
                    Sandbox accounts for testing - not connected to real services
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-status-warning/50 text-status-warning">
                  {Object.values(groupedCredentials.demo).flat().length} credentials
                </Badge>
                {demoExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 space-y-4 bg-status-warning/5">
              {Object.entries(groupedCredentials.demo).length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No demo credentials</p>
              ) : (
                Object.entries(groupedCredentials.demo).map(([siteId, creds]) => (
                  <SiteCredentialGroup
                    key={siteId}
                    siteId={siteId}
                    siteName={creds[0].siteName}
                    siteDomain={creds[0].siteDomain}
                    siteColor={creds[0].siteColor}
                    credentials={creds}
                    status="demo"
                    isControlCenter={creds[0].source === 'control-center'}
                    onGoLive={() => handleGoLive(siteId, creds[0].siteName, creds[0].siteDomain)}
                  />
                ))
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Live Section */}
      <Collapsible open={liveExpanded} onOpenChange={setLiveExpanded}>
        <div className={cn(
          "rounded-xl border-2 border-status-active/30 overflow-hidden",
          "opacity-0 animate-fade-in"
        )} style={{ animationDelay: '200ms' }}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 bg-status-active/10 cursor-pointer hover:bg-status-active/15 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-status-active" />
                <div>
                  <h2 className="font-semibold text-status-active">LIVE CREDENTIALS</h2>
                  <p className="text-sm text-muted-foreground">
                    Real accounts connected to production services
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-status-active/50 text-status-active">
                  {Object.values(groupedCredentials.live).flat().length} credentials
                </Badge>
                {liveExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 space-y-4 bg-status-active/5">
              {Object.entries(groupedCredentials.live).length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No live credentials yet. Click "Go Live" on a demo site to activate.
                </p>
              ) : (
                Object.entries(groupedCredentials.live).map(([siteId, creds]) => (
                  <SiteCredentialGroup
                    key={siteId}
                    siteId={siteId}
                    siteName={creds[0].siteName}
                    siteDomain={creds[0].siteDomain}
                    siteColor={creds[0].siteColor}
                    credentials={creds}
                    status="live"
                    isControlCenter={creds[0].source === 'control-center'}
                  />
                ))
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Go Live Dialog */}
      {selectedSite && (
        <GoLiveDialog
          isOpen={goLiveDialogOpen}
          onClose={() => setGoLiveDialogOpen(false)}
          siteName={selectedSite.siteName}
          siteDomain={selectedSite.siteDomain}
          domainPrice={12.99}
          credentials={credentials.filter(c => c.siteId === selectedSite.siteId)}
          onGoLive={handleGoLiveConfirm}
        />
      )}
    </DashboardLayout>
  );
}
