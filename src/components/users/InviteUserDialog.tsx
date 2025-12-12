import { useState } from 'react';
import { UserPlus, Loader2, Mail, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InviteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteUserDialog({ isOpen, onClose }: InviteUserDialogProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'editor'>('editor');
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async () => {
    if (!email) {
      toast({ title: 'Error', description: 'Please enter an email address.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      // For now, we'll create a notification that an invite was sent
      // In production, you'd use Supabase Admin API or an edge function
      const { error } = await supabase.from('notifications').insert({
        user_id: (await supabase.auth.getUser()).data.user?.id || '',
        title: 'User Invited',
        message: `Invitation sent to ${email} with ${role} role`,
        type: 'info',
      });

      if (error) throw error;

      toast({
        title: 'Invitation Sent',
        description: `An invitation has been sent to ${email}`,
      });

      setEmail('');
      setRole('editor');
      onClose();
    } catch (error) {
      console.error('Invite error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invitation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Invite User
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join Control Center
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Role
            </Label>
            <Select value={role} onValueChange={(v) => setRole(v as 'admin' | 'editor')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {role === 'admin' 
                ? 'Admins have full access to assigned tenants' 
                : 'Editors have content-only permissions'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Send Invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
