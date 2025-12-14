import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface RenameSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: { id: string; name: string; lovable_url?: string | null } | null;
}

export function RenameSiteDialog({ open, onOpenChange, site }: RenameSiteDialogProps) {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingFromLovable, setIsFetchingFromLovable] = useState(false);

  useEffect(() => {
    if (site) {
      setNewName(site.name);
    }
  }, [site]);

  const handleFetchFromLovable = async () => {
    if (!site?.lovable_url) {
      toast({ title: 'No Lovable URL', description: 'This site has no linked Lovable project URL.', variant: 'destructive' });
      return;
    }

    setIsFetchingFromLovable(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-lovable-project', {
        body: { lovableUrl: site.lovable_url },
      });

      if (error) throw error;

      if (data?.projectName) {
        setNewName(data.projectName);
        toast({ title: 'Name fetched!', description: `Found project name: ${data.projectName}` });
      } else {
        toast({ title: 'Could not fetch name', description: 'The project name could not be extracted from Lovable.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error fetching from Lovable:', error);
      toast({ title: 'Fetch failed', description: 'Could not fetch project name from Lovable.', variant: 'destructive' });
    } finally {
      setIsFetchingFromLovable(false);
    }
  };

  const handleRename = async () => {
    if (!site || !newName.trim()) return;

    setIsLoading(true);
    try {
      // Update site name
      const { error: siteError } = await supabase
        .from('sites')
        .update({ name: newName.trim() })
        .eq('id', site.id);

      if (siteError) throw siteError;

      // Also update imported_apps if exists
      const { error: importedError } = await supabase
        .from('imported_apps')
        .update({ project_name: newName.trim() })
        .eq('site_id', site.id);

      // Ignore error for imported_apps as it may not exist

      toast({ title: 'Site renamed', description: `Site has been renamed to "${newName.trim()}"` });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      onOpenChange(false);
    } catch (error) {
      console.error('Error renaming site:', error);
      toast({ title: 'Rename failed', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Rename Site
          </DialogTitle>
          <DialogDescription>
            Enter a new name for this site or fetch from Lovable.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name</Label>
            <Input
              id="site-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter site name"
            />
          </div>

          {site?.lovable_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleFetchFromLovable}
              disabled={isFetchingFromLovable}
              className="w-full"
            >
              {isFetchingFromLovable ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Fetching from Lovable...
                </>
              ) : (
                'Fetch Name from Lovable'
              )}
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={isLoading || !newName.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
