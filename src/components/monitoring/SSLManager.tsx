import { useState, useMemo } from 'react';
import { 
  Shield, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Calendar,
  Clock,
  Settings2,
  RotateCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { SSLCertificate } from '@/types/monitoring';
import { useSites } from '@/hooks/useSupabaseSites';
import { cn } from '@/lib/utils';

export function SSLManager() {
  const { toast } = useToast();
  const { data: sites = [] } = useSites();
  
  // Generate SSL certificates from Supabase sites
  const generateCertificates = useMemo((): SSLCertificate[] => {
    return sites.map((site, index) => {
      const issuedDate = new Date(Date.now() - (index * 30 + 10) * 24 * 60 * 60 * 1000);
      const expiresDate = new Date(issuedDate.getTime() + 90 * 24 * 60 * 60 * 1000);
      const daysUntilExpiry = Math.floor((expiresDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      
      let status: SSLCertificate['status'] = 'active';
      if (daysUntilExpiry <= 0) status = 'expired';
      else if (daysUntilExpiry <= 14) status = 'expiring_soon';
      
      return {
        id: `ssl-${site.id}`,
        domain: site.domain || site.name.toLowerCase().replace(/\s+/g, '-') + '.lovable.app',
        siteId: site.id,
        issuedAt: issuedDate.toISOString(),
        expiresAt: expiresDate.toISOString(),
        status,
        issuer: "Let's Encrypt Authority X3",
        autoRenew: true,
      };
    });
  }, [sites]);

  const [certificates, setCertificates] = useState<SSLCertificate[]>([]);
  const [isRenewingAll, setIsRenewingAll] = useState(false);
  const [selectedCert, setSelectedCert] = useState<SSLCertificate | null>(null);
  const [isRenewing, setIsRenewing] = useState<string | null>(null);

  // Initialize certificates when sites load
  useMemo(() => {
    if (generateCertificates.length > 0 && certificates.length === 0) {
      setCertificates(generateCertificates);
    }
  }, [generateCertificates, certificates.length]);

  const displayCertificates = certificates.length > 0 ? certificates : generateCertificates;

  const getDaysUntilExpiry = (expiresAt: string) => {
    return Math.floor((new Date(expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  };

  const getStatusInfo = (cert: SSLCertificate) => {
    switch (cert.status) {
      case 'active':
        return { icon: CheckCircle, color: 'text-status-active', bg: 'bg-status-active/10' };
      case 'expiring_soon':
        return { icon: AlertTriangle, color: 'text-status-warning', bg: 'bg-status-warning/10' };
      case 'expired':
        return { icon: XCircle, color: 'text-status-inactive', bg: 'bg-status-inactive/10' };
      case 'pending':
        return { icon: Clock, color: 'text-primary', bg: 'bg-primary/10' };
      case 'failed':
        return { icon: XCircle, color: 'text-status-inactive', bg: 'bg-status-inactive/10' };
      default:
        return { icon: Shield, color: 'text-muted-foreground', bg: 'bg-muted' };
    }
  };

  const handleRenew = async (certId: string) => {
    setIsRenewing(certId);
    
    // Simulate renewal process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setCertificates(prev => prev.map(cert => {
      if (cert.id === certId) {
        const newIssuedAt = new Date().toISOString();
        const newExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
        return {
          ...cert,
          issuedAt: newIssuedAt,
          expiresAt: newExpiresAt,
          status: 'active' as const,
          lastRenewalAttempt: newIssuedAt,
        };
      }
      return cert;
    }));
    
    setIsRenewing(null);
    toast({
      title: 'Certificate Renewed',
      description: 'SSL certificate has been successfully renewed for 90 days.',
    });
  };

  const handleRenewAll = async () => {
    setIsRenewingAll(true);
    
    for (const cert of displayCertificates.filter(c => c.status === 'expiring_soon' || c.status === 'expired')) {
      await handleRenew(cert.id);
    }
    
    setIsRenewingAll(false);
    toast({
      title: 'All Certificates Renewed',
      description: 'All expiring certificates have been renewed.',
    });
  };

  const toggleAutoRenew = (certId: string) => {
    setCertificates(prev => prev.map(cert => {
      if (cert.id === certId) {
        return { ...cert, autoRenew: !cert.autoRenew };
      }
      return cert;
    }));
    toast({
      title: 'Auto-Renew Updated',
      description: 'Auto-renewal setting has been updated.',
    });
  };

  const activeCerts = displayCertificates.filter(c => c.status === 'active').length;
  const expiringCerts = displayCertificates.filter(c => c.status === 'expiring_soon').length;
  const expiredCerts = displayCertificates.filter(c => c.status === 'expired').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">SSL Certificates</h2>
            <p className="text-sm text-muted-foreground">
              Managed by Let's Encrypt with auto-renewal
            </p>
          </div>
        </div>
        <Button
          onClick={handleRenewAll}
          disabled={isRenewingAll || (expiringCerts === 0 && expiredCerts === 0)}
          className="gap-1.5"
        >
          <RotateCcw className={cn("h-4 w-4", isRenewingAll && "animate-spin")} />
          Renew Expiring ({expiringCerts + expiredCerts})
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{displayCertificates.length}</p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-status-active/30 bg-status-active/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-status-active">{activeCerts}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-status-active/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-status-warning/30 bg-status-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-status-warning">{expiringCerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-status-warning/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-status-inactive/30 bg-status-inactive/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold text-status-inactive">{expiredCerts}</p>
              </div>
              <XCircle className="h-8 w-8 text-status-inactive/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificates List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Certificates</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {displayCertificates.length === 0 ? (
              <div className="px-6 py-8 text-center text-muted-foreground">
                No sites found. Create a site to generate SSL certificates.
              </div>
            ) : (
              displayCertificates.map((cert) => {
                const statusInfo = getStatusInfo(cert);
                const StatusIcon = statusInfo.icon;
                const daysLeft = getDaysUntilExpiry(cert.expiresAt);
                const progress = Math.max(0, Math.min(100, (daysLeft / 90) * 100));
                
                return (
                  <div key={cert.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", statusInfo.bg)}>
                          <StatusIcon className={cn("h-5 w-5", statusInfo.color)} />
                        </div>
                        <div>
                          <p className="font-medium">{cert.domain}</p>
                          <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right w-32">
                          <div className="flex items-center gap-2 justify-end mb-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">
                              {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                            </span>
                          </div>
                          <Progress value={progress} className="h-1.5" />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Auto-renew</span>
                          <Switch
                            checked={cert.autoRenew}
                            onCheckedChange={() => toggleAutoRenew(cert.id)}
                          />
                        </div>
                        
                        <Badge variant={
                          cert.status === 'active' ? 'active' :
                          cert.status === 'expiring_soon' ? 'warning' :
                          cert.status === 'expired' ? 'destructive' : 'secondary'
                        }>
                          {cert.status.replace('_', ' ')}
                        </Badge>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCert(cert)}
                          >
                            <Settings2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRenew(cert.id)}
                            disabled={isRenewing === cert.id}
                          >
                            <RefreshCw className={cn(
                              "h-3.5 w-3.5",
                              isRenewing === cert.id && "animate-spin"
                            )} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Certificate Details Dialog */}
      <Dialog open={!!selectedCert} onOpenChange={() => setSelectedCert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Certificate Details</DialogTitle>
          </DialogHeader>
          {selectedCert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Domain</p>
                  <p className="font-medium">{selectedCert.domain}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={
                    selectedCert.status === 'active' ? 'active' :
                    selectedCert.status === 'expiring_soon' ? 'warning' : 'destructive'
                  }>
                    {selectedCert.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Issued</p>
                  <p className="font-medium">
                    {new Date(selectedCert.issuedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expires</p>
                  <p className="font-medium">
                    {new Date(selectedCert.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Issuer</p>
                  <p className="font-medium">{selectedCert.issuer}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Auto-renewal</span>
                <Switch
                  checked={selectedCert.autoRenew}
                  onCheckedChange={() => {
                    toggleAutoRenew(selectedCert.id);
                    setSelectedCert(prev => prev ? { ...prev, autoRenew: !prev.autoRenew } : null);
                  }}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCert(null)}>
              Close
            </Button>
            <Button onClick={() => {
              if (selectedCert) {
                handleRenew(selectedCert.id);
                setSelectedCert(null);
              }
            }}>
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Renew Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
