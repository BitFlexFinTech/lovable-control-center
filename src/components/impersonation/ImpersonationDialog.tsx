import { useState } from 'react';
import { Eye, Shield, Edit, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const ROLES: Array<{ value: AppRole; label: string; description: string; icon: typeof Shield }> = [
  { 
    value: 'admin', 
    label: 'Admin', 
    description: 'Full access to assigned tenants and sites',
    icon: Shield,
  },
  { 
    value: 'editor', 
    label: 'Editor', 
    description: 'Content-only access to assigned sites',
    icon: Edit,
  },
];

export const ImpersonationDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [reason, setReason] = useState('');
  const { startImpersonation, isImpersonating } = useImpersonation();
  const { isSuperAdmin } = usePermissions();

  if (!isSuperAdmin || isImpersonating) return null;

  const handleStart = async () => {
    if (!selectedRole) return;
    await startImpersonation(selectedRole, reason || undefined);
    setOpen(false);
    setSelectedRole(null);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Eye className="h-3.5 w-3.5" />
          View As
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Impersonate Role
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            View the Control Center as another role for testing and support purposes. 
            All actions during impersonation are logged.
          </p>

          <div className="space-y-2">
            <Label>Select Role</Label>
            <div className="grid gap-2">
              {ROLES.map((role) => (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-all text-left",
                    selectedRole === role.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    selectedRole === role.value ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    <role.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{role.label}</p>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input
              id="reason"
              placeholder="e.g., Testing new permission setup"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleStart} disabled={!selectedRole}>
            Start Impersonation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};