import { useState } from 'react';
import { Eye, EyeOff, Copy, Check, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StoredCredential } from '@/types/credentials';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CredentialCardProps {
  credential: StoredCredential;
  compact?: boolean;
}

export function CredentialCard({ credential, compact = false }: CredentialCardProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: `${field} copied to clipboard` });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
    // Auto-hide after 10 seconds
    if (!showPassword) {
      setTimeout(() => setShowPassword(false), 10000);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-lg">{credential.integrationIcon}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{credential.integrationName}</p>
            <p className="text-xs text-muted-foreground truncate">{credential.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => copyToClipboard(credential.email, 'Email')}
          >
            {copiedField === 'Email' ? (
              <Check className="h-3 w-3 text-status-active" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={togglePassword}
          >
            {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => copyToClipboard(credential.password, 'Password')}
          >
            {copiedField === 'Password' ? (
              <Check className="h-3 w-3 text-status-active" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center text-lg",
            "bg-gradient-to-br",
            credential.category === 'Payments' && "from-purple-500/20 to-indigo-600/20",
            credential.category === 'Social' && "from-pink-500/20 to-purple-600/20",
            credential.category === 'Analytics' && "from-orange-400/20 to-yellow-500/20",
            credential.category === 'Email' && "from-blue-400/20 to-cyan-500/20",
            credential.category === 'Development' && "from-gray-700/20 to-gray-900/20",
            credential.category === 'Communication' && "from-purple-600/20 to-pink-600/20",
            credential.category === 'Storage' && "from-orange-500/20 to-orange-700/20",
            credential.category === 'Auth' && "from-gray-700/20 to-gray-900/20",
          )}>
            {credential.integrationIcon}
          </div>
          <div>
            <h4 className="font-medium">{credential.integrationName}</h4>
            <p className="text-xs text-muted-foreground">{credential.category}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-mono truncate">{credential.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => copyToClipboard(credential.email, 'Email')}
          >
            {copiedField === 'Email' ? (
              <Check className="h-3 w-3 text-status-active" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Password</p>
            <p className="text-sm font-mono truncate">
              {showPassword ? credential.password : '••••••••••••••••'}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={togglePassword}
            >
              {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => copyToClipboard(credential.password, 'Password')}
            >
              {copiedField === 'Password' ? (
                <Check className="h-3 w-3 text-status-active" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        {Object.entries(credential.additionalFields).length > 0 && (
          <div className="pt-2 space-y-1">
            {Object.entries(credential.additionalFields).slice(0, 2).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="font-medium truncate ml-2">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
