import { useState } from 'react';
import { Copy, RefreshCw, Check, Eye, EyeOff, Code, Globe, Instagram, Music2, Twitter, Facebook, MessageCircle, Youtube, Linkedin, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
}

export function PlatformCard({
  platform,
  name,
  color,
  iconName,
  fields,
  fieldLabels,
  onRegenerate,
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
    <Card className="overflow-hidden">
      <CardHeader className={cn("bg-gradient-to-r text-white py-3", color)}>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <IconComponent className="h-5 w-5" />
            {name}
          </div>
          <div className="flex items-center gap-1">
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
        {viewMode === 'form' ? (
          <>
            {fieldLabels.map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={key.toLowerCase().includes('password') && !showPasswords ? '••••••••••••' : fields[key] || ''}
                    readOnly
                    className="h-8 text-sm bg-muted/50"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => copyField(key, fields[key])}
                  >
                    {copiedField === key ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-auto max-h-48">
            {JSON.stringify(
              fieldLabels.reduce((acc, { key }) => ({ ...acc, [key]: fields[key] }), {}),
              null,
              2
            )}
          </pre>
        )}
        
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={copyAll}>
            <Copy className="h-3 w-3" />
            Copy All
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={onRegenerate}>
            <RefreshCw className="h-3 w-3" />
            Regenerate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
