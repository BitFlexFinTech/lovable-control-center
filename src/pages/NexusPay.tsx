import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Bitcoin, 
  Shield, 
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Download,
  Plus,
  Settings,
  Activity,
  Zap,
  Eye,
  EyeOff,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Wallet
} from 'lucide-react';
import { useSites } from '@/hooks/useDashboardData';
import { 
  useNexusPayTransactions, 
  useNexusPayKPIs, 
  usePaymentProviders,
  useConnectPaymentProvider,
  useActiveGodModeSession,
  useStartGodMode,
  useDeactivateGodMode,
  useFeatureToggles,
  useToggleFeature,
  PaymentGateway
} from '@/hooks/useNexusPay';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CurrencyBalanceCards } from '@/components/billing/CurrencyBalanceCards';
import { SitePaymentToggles } from '@/components/billing/SitePaymentToggles';
import { UnifiedPaymentDashboard } from '@/components/billing/UnifiedPaymentDashboard';

const gatewayIcons: Record<PaymentGateway, React.ReactNode> = {
  stripe: <CreditCard className="h-4 w-4" />,
  paypal: <DollarSign className="h-4 w-4" />,
  btc: <Bitcoin className="h-4 w-4" />,
  usdt: <DollarSign className="h-4 w-4 text-green-500" />,
  eth: <Activity className="h-4 w-4 text-purple-500" />,
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  refunded: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  cancelled: 'bg-muted text-muted-foreground border-border',
};

const NexusPay = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: sites = [] } = useSites();
  const [selectedSiteId, setSelectedSiteId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isGodModeModalOpen, setIsGodModeModalOpen] = useState(false);
  const [godModeReason, setGodModeReason] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<PaymentGateway | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletNetwork, setWalletNetwork] = useState('');

  const { data: transactions = [], isLoading: txLoading } = useNexusPayTransactions(selectedSiteId);
  const kpis = useNexusPayKPIs(selectedSiteId);
  const { data: providers = [] } = usePaymentProviders();
  const { data: activeGodMode } = useActiveGodModeSession();
  const { data: featureToggles = [] } = useFeatureToggles();

  const connectProvider = useConnectPaymentProvider();
  const startGodMode = useStartGodMode();
  const deactivateGodMode = useDeactivateGodMode();
  const toggleFeature = useToggleFeature();

  const filteredTransactions = transactions.filter(tx => {
    if (!searchQuery) return true;
    return (
      tx.gateway_ref_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleConnectProvider = async () => {
    if (!selectedProvider || !selectedSiteId || selectedSiteId === 'all') {
      toast({ title: 'Please select a site and provider', variant: 'destructive' });
      return;
    }

    try {
      await connectProvider.mutateAsync({
        siteId: selectedSiteId,
        provider: selectedProvider,
        isSandbox: true
      });
      toast({ title: 'Provider connected successfully' });
      setIsConnectModalOpen(false);
      setSelectedProvider(null);
    } catch (error) {
      toast({ title: 'Failed to connect provider', variant: 'destructive' });
    }
  };

  const handleStartGodMode = async () => {
    if (!user?.id || !godModeReason.trim()) {
      toast({ title: 'Please provide a reason for GodMode access', variant: 'destructive' });
      return;
    }

    try {
      await startGodMode.mutateAsync({
        adminUserId: user.id,
        reason: godModeReason,
        durationMinutes: 30
      });
      toast({ title: 'GodMode activated for 30 minutes' });
      setIsGodModeModalOpen(false);
      setGodModeReason('');
    } catch (error) {
      toast({ title: 'Failed to activate GodMode', variant: 'destructive' });
    }
  };

  const handleDeactivateGodMode = async () => {
    if (!activeGodMode) return;

    try {
      await deactivateGodMode.mutateAsync(activeGodMode.id);
      toast({ title: 'GodMode deactivated' });
    } catch (error) {
      toast({ title: 'Failed to deactivate GodMode', variant: 'destructive' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Billing Management</h1>
            <p className="text-muted-foreground text-sm">Unified payment & currency management across all sites</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                {sites.map(site => (
                  <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {activeGodMode ? (
              <Button variant="destructive" onClick={handleDeactivateGodMode} className="gap-2">
                <ShieldAlert className="h-4 w-4" />
                Deactivate GodMode
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setIsGodModeModalOpen(true)} className="gap-2">
                <Shield className="h-4 w-4" />
                GodMode
              </Button>
            )}
            
            <Button onClick={() => setIsConnectModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Connect Provider
            </Button>
          </div>
        </div>

        {/* GodMode Active Banner */}
        {activeGodMode && (
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-yellow-500">GodMode Active</p>
                  <p className="text-sm text-muted-foreground">
                    Expires: {format(new Date(activeGodMode.expires_at), 'PPp')} | Reason: {activeGodMode.reason}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleDeactivateGodMode}>
                Kill Switch
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Currency Balance Cards */}
        <CurrencyBalanceCards />

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(kpis.netRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500 inline-flex items-center gap-0.5">
                  <ArrowUpRight className="h-3 w-3" /> 12.5%
                </span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(kpis.averageTransactionValue)}</div>
              <p className="text-xs text-muted-foreground">
                {kpis.transactionCount} total transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.successRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Transaction success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Value</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(kpis.pendingValue)}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting confirmation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Per-Site Payment Toggles */}
        {selectedSiteId !== 'all' && (
          <SitePaymentToggles siteId={selectedSiteId} />
        )}

        {/* Main Content */}
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="all-sites">All Sites</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Unified Payments Log</CardTitle>
                    <CardDescription>All transactions across gateways</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 w-[250px]"
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Gateway</TableHead>
                      <TableHead>Amount (USD)</TableHead>
                      <TableHead>Native</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {txLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                          Loading transactions...
                        </TableCell>
                      </TableRow>
                    ) : filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map(tx => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-mono text-xs">
                            {tx.gateway_ref_id.slice(0, 16)}...
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {gatewayIcons[tx.gateway_source]}
                              <span className="capitalize">{tx.gateway_source}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(Number(tx.amount_usd))}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {Number(tx.native_amount).toFixed(8)} {tx.crypto_network || tx.gateway_source.toUpperCase()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColors[tx.status]}>
                              {tx.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {tx.customer_name || 'Anonymous'}
                              {tx.customer_email && (
                                <p className="text-xs text-muted-foreground">{tx.customer_email}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(tx.created_at), 'MMM d, HH:mm')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all-sites" className="space-y-4">
            <UnifiedPaymentDashboard />
          </TabsContent>

          <TabsContent value="providers" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(['stripe', 'paypal', 'btc', 'usdt', 'eth'] as PaymentGateway[]).map(provider => {
                const connected = providers.find(p => p.provider === provider && p.is_connected);
                return (
                  <Card key={provider} className={connected ? 'border-green-500/30' : ''}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {gatewayIcons[provider]}
                          <CardTitle className="text-lg capitalize">{provider}</CardTitle>
                        </div>
                        <Badge variant={connected ? 'default' : 'secondary'}>
                          {connected ? 'Connected' : 'Not Connected'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {connected ? (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Mode: {connected.is_sandbox ? 'Sandbox' : 'Production'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Last sync: {connected.last_synced_at ? format(new Date(connected.last_synced_at), 'PPp') : 'Never'}
                          </p>
                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm">Manage</Button>
                            <Button variant="ghost" size="sm" className="text-destructive">Disconnect</Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => {
                            setSelectedProvider(provider);
                            setIsConnectModalOpen(true);
                          }}
                          className="w-full"
                        >
                          Connect {provider.toUpperCase()}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Gateway</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(kpis.byGateway).map(([gateway, data]) => (
                      <div key={gateway} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {gatewayIcons[gateway as PaymentGateway]}
                          <span className="capitalize">{gateway}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(data.total)}</p>
                          <p className="text-xs text-muted-foreground">{data.count} transactions</p>
                        </div>
                      </div>
                    ))}
                    {Object.keys(kpis.byGateway).length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No transaction data</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Crypto Volatility Panel</CardTitle>
                  <CardDescription>Real-time crypto price tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bitcoin className="h-5 w-5 text-orange-500" />
                        <span>Bitcoin</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">$67,432.50</p>
                        <p className="text-xs text-green-500">+2.4%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-purple-500" />
                        <span>Ethereum</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">$3,892.18</p>
                        <p className="text-xs text-red-500">-0.8%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        <span>USDT</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">$1.00</p>
                        <p className="text-xs text-muted-foreground">Stable</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Feature Toggles</CardTitle>
                <CardDescription>Enable or disable advanced features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {featureToggles.map(toggle => (
                    <div key={toggle.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{toggle.feature_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                        <p className="text-sm text-muted-foreground">{toggle.description}</p>
                      </div>
                      <Switch 
                        checked={toggle.is_enabled}
                        onCheckedChange={(checked) => toggleFeature.mutate({ featureKey: toggle.feature_key, isEnabled: checked })}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Connect Provider Modal */}
      <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Payment Provider</DialogTitle>
            <DialogDescription>
              Connect a payment gateway to start accepting payments
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedSiteId === 'all' && (
              <div className="space-y-2">
                <Label>Select Site</Label>
                <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map(site => (
                      <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Payment Provider</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['stripe', 'paypal', 'btc', 'usdt', 'eth'] as PaymentGateway[]).map(provider => (
                  <Button
                    key={provider}
                    variant={selectedProvider === provider ? 'default' : 'outline'}
                    className="flex-col h-auto py-3 gap-1"
                    onClick={() => {
                      setSelectedProvider(provider);
                      setWalletAddress('');
                      setWalletNetwork(provider === 'btc' ? 'bitcoin' : provider === 'eth' ? 'ethereum' : provider === 'usdt' ? 'trc20' : '');
                    }}
                  >
                    {gatewayIcons[provider]}
                    <span className="capitalize text-xs">{provider}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Wallet Address Input for Crypto Providers */}
            {selectedProvider && ['btc', 'usdt', 'eth'].includes(selectedProvider) && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Wallet Address</Label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder={`Enter your ${selectedProvider.toUpperCase()} wallet address`}
                      className="pl-9 font-mono text-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Network</Label>
                  <Select value={walletNetwork} onValueChange={setWalletNetwork}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProvider === 'btc' && (
                        <>
                          <SelectItem value="bitcoin">Bitcoin Mainnet</SelectItem>
                          <SelectItem value="lightning">Lightning Network</SelectItem>
                        </>
                      )}
                      {selectedProvider === 'eth' && (
                        <>
                          <SelectItem value="ethereum">Ethereum Mainnet</SelectItem>
                          <SelectItem value="polygon">Polygon</SelectItem>
                          <SelectItem value="arbitrum">Arbitrum</SelectItem>
                          <SelectItem value="optimism">Optimism</SelectItem>
                        </>
                      )}
                      {selectedProvider === 'usdt' && (
                        <>
                          <SelectItem value="trc20">TRC-20 (Tron)</SelectItem>
                          <SelectItem value="erc20">ERC-20 (Ethereum)</SelectItem>
                          <SelectItem value="bep20">BEP-20 (BSC)</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConnectModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleConnectProvider} 
              disabled={
                !selectedProvider || 
                selectedSiteId === 'all' ||
                (['btc', 'usdt', 'eth'].includes(selectedProvider || '') && !walletAddress)
              }
            >
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GodMode Modal */}
      <Dialog open={isGodModeModalOpen} onOpenChange={setIsGodModeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Activate GodMode
            </DialogTitle>
            <DialogDescription>
              GodMode grants elevated privileges for 30 minutes. All actions will be logged.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-500">Security Warning</p>
                  <p className="text-muted-foreground">This action will be audited and logged. Use responsibly.</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason for Access</Label>
              <Textarea
                value={godModeReason}
                onChange={(e) => setGodModeReason(e.target.value)}
                placeholder="Describe why you need GodMode access..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGodModeModalOpen(false)}>Cancel</Button>
            <Button onClick={handleStartGodMode} disabled={!godModeReason.trim()}>
              Activate GodMode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default NexusPay;
