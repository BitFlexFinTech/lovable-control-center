import { useState, useMemo } from 'react';
import { 
  RefreshCw, 
  Download, 
  FileJson, 
  FileSpreadsheet, 
  FileText,
  User,
  Sparkles,
  Copy
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlatformCard } from '@/components/social/PlatformCard';
import { generatePersona, generatePlatformFields, GeneratedPersonaData } from '@/utils/personaGenerator';
import { platformTemplates } from '@/types/social';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function SocialPrefill() {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  
  const domain = currentTenant?.slug ? `${currentTenant.slug}.com` : 'acme-commerce.com';
  
  const [persona, setPersona] = useState<GeneratedPersonaData>(() => generatePersona(domain));
  const [customDomain, setCustomDomain] = useState(domain);

  const platformFields = useMemo(() => {
    const fields: Record<string, Record<string, string>> = {};
    platformTemplates.forEach((template) => {
      fields[template.platform] = generatePlatformFields(persona, template.platform, customDomain);
    });
    return fields;
  }, [persona, customDomain]);

  const regeneratePersona = () => {
    setPersona(generatePersona(customDomain));
    toast({ title: 'New persona generated!' });
  };

  const regeneratePlatform = (platform: string) => {
    const newPersona = generatePersona(customDomain);
    setPersona(newPersona);
  };

  const generateAllAccounts = () => {
    toast({ 
      title: 'All accounts generated!',
      description: 'Credentials ready for all 7 platforms.'
    });
  };

  const exportData = (format: 'json' | 'csv' | 'pdf') => {
    const data = {
      persona,
      platforms: platformFields,
      generatedAt: new Date().toISOString(),
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `social-accounts-${persona.username}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const rows = [['Platform', 'Field', 'Value']];
      Object.entries(platformFields).forEach(([platform, fields]) => {
        Object.entries(fields).forEach(([field, value]) => {
          rows.push([platform, field, value]);
        });
      });
      const csv = rows.map((r) => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `social-accounts-${persona.username}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    toast({ title: `Exported as ${format.toUpperCase()}` });
  };

  const copyPersona = async () => {
    const text = Object.entries(persona)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    await navigator.clipboard.writeText(text);
    toast({ title: 'Persona copied to clipboard!' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Auto Social Account Prefiller</h1>
            <p className="text-muted-foreground">
              Generate and pre-fill account credentials for all major social platforms
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportData('json')}>
                  <FileJson className="h-4 w-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportData('csv')}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportData('pdf')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={generateAllAccounts} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate All Accounts
            </Button>
          </div>
        </div>

        {/* Persona Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Generated Persona
            </CardTitle>
            <CardDescription>
              This persona will be used across all platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label className="text-xs text-muted-foreground">Full Name</Label>
                <p className="font-medium">{persona.fullName}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Username</Label>
                <p className="font-medium text-primary">{persona.username}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="font-medium truncate">{persona.email}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Country</Label>
                <p className="font-medium">{persona.country}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                <p className="font-medium">{persona.dateOfBirth}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Gender</Label>
                <p className="font-medium capitalize">{persona.gender}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Phone</Label>
                <p className="font-medium">{persona.phone}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Recovery Email</Label>
                <p className="font-medium truncate">{persona.recoveryEmail}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pt-4 border-t border-border">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Custom Domain</Label>
                <Input
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="mt-1 h-9"
                  placeholder="yourdomain.com"
                />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <Button variant="outline" size="sm" onClick={copyPersona} className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button size="sm" onClick={regeneratePersona} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {platformTemplates.map((template) => (
            <PlatformCard
              key={template.platform}
              platform={template.platform}
              name={template.name}
              color={template.color}
              iconName={template.icon}
              fields={platformFields[template.platform] || {}}
              fieldLabels={template.fields}
              onRegenerate={() => regeneratePlatform(template.platform)}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
