import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LinkIcon, CheckCircle2, Loader2, AlertCircle, Clock 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface PendingSite {
  id: string;
  name: string;
  domain: string | null;
  app_color: string | null;
  status: string;
  lovable_url: string | null;
}

interface VerifyProjectsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VerifyProjectsDialog({ open, onOpenChange }: VerifyProjectsDialogProps) {
  const [pendingSites, setPendingSites] = useState<PendingSite[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [verifying, setVerifying] = useState<Record<string, boolean>>({});
  const [verified, setVerified] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      fetchPendingSites();
    }
  }, [open]);

  const fetchPendingSites = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sites')
      .select('id, name, domain, app_color, status, lovable_url')
      .eq('status', 'pending_creation')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending sites:', error);
    } else {
      setPendingSites(data || []);
    }
    setLoading(false);
  };

  const extractProjectSlug = (url: string): string | null => {
    // Handle various Lovable URL formats
    const patterns = [
      /lovable\.dev\/projects\/([^/]+)/,
      /([a-zA-Z0-9-]+)\.lovable\.app/,
      /lovable\.app\/([^/]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleVerify = async (siteId: string) => {
    const url = urls[siteId];
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter the Lovable project URL",
        variant: "destructive"
      });
      return;
    }

    const projectSlug = extractProjectSlug(url);
    if (!projectSlug) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Lovable project URL",
        variant: "destructive"
      });
      return;
    }

    setVerifying(prev => ({ ...prev, [siteId]: true }));

    try {
      // Update site with Lovable URL and change status to demo
      const { error: siteError } = await supabase
        .from('sites')
        .update({ 
          lovable_url: url,
          status: 'demo'
        })
        .eq('id', siteId);

      if (siteError) throw siteError;

      // Also update imported_apps if exists
      await supabase
        .from('imported_apps')
        .update({ lovable_url: url })
        .eq('site_id', siteId);

      setVerified(prev => ({ ...prev, [siteId]: true }));
      
      toast({
        title: "Project Verified",
        description: "The project has been linked and is now in demo mode."
      });

      // Refresh the sites list
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Could not verify the project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setVerifying(prev => ({ ...prev, [siteId]: false }));
    }
  };

  const handleClose = () => {
    setUrls({});
    setVerified({});
    onOpenChange(false);
  };

  const verifiedCount = Object.values(verified).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            Verify Pending Projects
          </DialogTitle>
          <DialogDescription>
            Link your pending sites to their actual Lovable projects by entering their URLs.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : pendingSites.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No pending projects to verify</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-4">
              {pendingSites.map((site) => (
                <div 
                  key={site.id}
                  className="p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: site.app_color || '#3b82f6' }}
                    />
                    <span className="font-medium">{site.name}</span>
                    {verified[site.id] ? (
                      <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/30">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/30">
                        <Clock className="h-3 w-3" />
                        Pending
                      </Badge>
                    )}
                  </div>

                  {!verified[site.id] && (
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`url-${site.id}`} className="sr-only">
                          Lovable Project URL
                        </Label>
                        <Input
                          id={`url-${site.id}`}
                          placeholder="https://project-name.lovable.app or Lovable project URL"
                          value={urls[site.id] || ''}
                          onChange={(e) => setUrls(prev => ({ 
                            ...prev, 
                            [site.id]: e.target.value 
                          }))}
                          disabled={verifying[site.id]}
                        />
                      </div>
                      <Button 
                        onClick={() => handleVerify(site.id)}
                        disabled={verifying[site.id] || !urls[site.id]}
                        size="sm"
                      >
                        {verifying[site.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Verify'
                        )}
                      </Button>
                    </div>
                  )}

                  {verified[site.id] && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="truncate">{urls[site.id]}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-muted-foreground">
              {verifiedCount} of {pendingSites.length} verified
            </span>
            <Button onClick={handleClose}>
              {verifiedCount > 0 ? 'Done' : 'Close'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
