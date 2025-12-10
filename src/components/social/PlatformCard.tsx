import { useState } from 'react';
import { Copy, RefreshCw, Check, Eye, EyeOff, Code, Globe, Instagram, Music2, Twitter, Facebook, MessageCircle, Youtube, Linkedin, LucideIcon, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const iconMap: Record<string, LucideIcon> = {
  Instagram,
  Music2,
  Twitter,
  Facebook,
  MessageCircle,
  Youtube,
  Linkedin,
  Globe,
};

interface PlatformCardProps {
  platform: string;
  name: string;
  color: string;
  iconName: string;
  fields: Record<string, string>;
  fieldLabels: { key: string; label: string }[];
  onRegenerate: () => void;
  isAvailable?: boolean;
}

export function PlatformCard({
  platform,
  name,
  color,
  iconName,
  fields,
  fieldLabels,
  onRegenerate,
  isAvailable,
}: PlatformCardProps) {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const [viewMode, setViewMode] = useState<'form' | 'json'>('form');

  const IconComponent = iconMap[iconName] || Globe;

  const copyField = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyAll = async () => {
    const text = fieldLabels.map(({ key, label }) => `${label}: ${fields[key]}`).join('\n');
    await navigator.clipboard.writeText(text);
    toast({ title: `All ${name} fields copied!` });
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-lg",
      isAvailable === false && "ring-1 ring-destructive/30"
    )}>
      <CardHeader className={cn("bg-gradient-to-r text-white py-3 relative", color)}>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <IconComponent className="h-5 w-5" />
            {name}
          </div>
          <div className="flex items-center gap-1">
            {/* Availability indicator */}
            {isAvailable !== undefined && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "h-6 gap-1 text-xs",
                  isAvailable 
                    ? "bg-green-500/20 text-green-100 border-green-400/30" 
                    : "bg-red-500/20 text-red-100 border-red-400/30"
                )}
              >
                {isAvailable ? (
                  <>
                    <Check className="h-3 w-3" />
                    Available
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3" />
                    Taken
                  </>
                )}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
              onClick={() => setViewMode(viewMode === 'form' ? 'json' : 'form')}
            >
              <Code className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
              onClick={() => setShowPasswords(!showPasswords)}
            >
              {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {/* Unavailable warning */}
        {isAvailable === false && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-destructive/10 text-destructive text-xs animate-fade-in">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Username is taken. Consider regenerating.</span>
          </div>
        )}

        {viewMode === 'form' ? (
          <>
            {fieldLabels.map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={key.toLowerCase().includes('password') && !showPasswords ? '••••••••••••' : fields[key] || ''}
                    readOnly
                    className={cn(
                      "h-8 text-sm bg-muted/50 transition-all duration-200",
                      key.toLowerCase().includes('username') && isAvailable === false && "border-destructive/50"
                    )}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0 hover:bg-primary/10 transition-colors"
                    onClick={() => copyField(key, fields[key])}
                  >
                    {copiedField === key ? (
                      <Check className="h-4 w-4 text-green-500 animate-scale-in" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-auto max-h-48 animate-fade-in">
            {JSON.stringify(
              fieldLabels.reduce((acc, { key }) => ({ ...acc, [key]: fields[key] }), {}),
              null,
              2
            )}
          </pre>
        )}
        
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button variant="outline" size="sm" className="flex-1 gap-2 hover:bg-primary/10 transition-colors" onClick={copyAll}>
            <Copy className="h-3 w-3" />
            Copy All
          </Button>
          <Button 
            variant={isAvailable === false ? "default" : "outline"} 
            size="sm" 
            className={cn(
              "flex-1 gap-2 transition-colors",
              isAvailable === false && "animate-pulse"
            )} 
            onClick={onRegenerate}
          >
            <RefreshCw className="h-3 w-3" />
            Regenerate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
