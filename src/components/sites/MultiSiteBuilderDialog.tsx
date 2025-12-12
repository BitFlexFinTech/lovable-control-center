import { useState } from 'react';
import { Layers, MessageSquare, Palette, FileDown, Check, Loader2, Send, Sparkles, Globe } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { exportMultiSiteToPDF } from '@/utils/pdfExport';

interface MultiSiteBuilderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBuild: (sites: GeneratedSite[]) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface GeneratedSite {
  id: string;
  name: string;
  domain: string;
  description: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    style: string;
  };
  features: string[];
  seoTitle: string;
  seoDescription: string;
}

const SITE_COUNT_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10];

const THEME_STYLES = [
  { id: 'modern', name: 'Modern Minimal', colors: ['#0F172A', '#3B82F6'] },
  { id: 'vibrant', name: 'Vibrant Bold', colors: ['#7C3AED', '#F59E0B'] },
  { id: 'elegant', name: 'Elegant Classic', colors: ['#1F2937', '#D4AF37'] },
  { id: 'playful', name: 'Playful Fun', colors: ['#EC4899', '#06B6D4'] },
  { id: 'nature', name: 'Nature Organic', colors: ['#166534', '#84CC16'] },
  { id: 'tech', name: 'Tech Futuristic', colors: ['#0EA5E9', '#8B5CF6'] },
];

export function MultiSiteBuilderDialog({ isOpen, onClose, onBuild }: MultiSiteBuilderDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'count' | 'chat' | 'preview' | 'building'>('count');
  const [siteCount, setSiteCount] = useState(3);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: "As a senior prompt engineer, I'll help you create multiple sites at once. Tell me about your project:\n\n• What industry or niche?\n• Target audience?\n• Key features needed?\n• Any branding preferences?" 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSites, setGeneratedSites] = useState<GeneratedSite[]>([]);
  const [buildProgress, setBuildProgress] = useState(0);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user' as const, content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsGenerating(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantResponse = generateAIResponse(inputMessage, siteCount);
      setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
      setIsGenerating(false);

      // If enough context, generate sites
      if (messages.length >= 2) {
        generateSites(inputMessage, siteCount);
      }
    }, 1500);
  };

  const generateAIResponse = (userInput: string, count: number): string => {
    const responses = [
      `Great context! I'm now designing ${count} unique sites based on your requirements. Each will have:\n\n✓ Custom theme & color palette\n✓ SEO-optimized metadata\n✓ Tailored feature set\n\nGenerating your sites now...`,
      `Perfect! I understand you need ${count} sites. Let me create diverse variations with different themes while maintaining brand consistency across all properties.`,
      `Excellent details! Creating ${count} sites with optimized themes. Each site will be production-ready with proper SEO, responsive design, and core features.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateSites = (context: string, count: number) => {
    const sites: GeneratedSite[] = [];
    const industries = ['E-commerce', 'Portfolio', 'SaaS', 'Blog', 'Agency', 'Restaurant', 'Fitness', 'Real Estate', 'Education', 'Healthcare'];
    
    for (let i = 0; i < count; i++) {
      const theme = THEME_STYLES[i % THEME_STYLES.length];
      const industry = industries[i % industries.length];
      sites.push({
        id: `site-${Date.now()}-${i}`,
        name: `${industry} Site ${i + 1}`,
        domain: `${industry.toLowerCase().replace(/\s/g, '')}-${i + 1}.com`,
        description: `A beautiful ${theme.name.toLowerCase()} ${industry.toLowerCase()} website`,
        theme: {
          primaryColor: theme.colors[0],
          secondaryColor: theme.colors[1],
          fontFamily: ['Inter', 'Playfair Display', 'Space Grotesk', 'DM Sans'][i % 4],
          style: theme.id,
        },
        features: ['Responsive Design', 'SEO Optimized', 'Contact Form', 'Analytics'],
        seoTitle: `${industry} - Professional Solutions`,
        seoDescription: `Discover top-quality ${industry.toLowerCase()} services. Built with modern technology for the best user experience.`,
      });
    }
    
    setGeneratedSites(sites);
    setTimeout(() => setStep('preview'), 500);
  };

  const handleBuild = async () => {
    setStep('building');
    
    for (let i = 0; i <= generatedSites.length; i++) {
      setBuildProgress((i / generatedSites.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    onBuild(generatedSites);
    toast({
      title: 'Sites Created Successfully',
      description: `${generatedSites.length} sites are now in demo mode.`,
    });
    handleClose();
  };

  const handleExportPDF = () => {
    exportMultiSiteToPDF(generatedSites);
    toast({
      title: 'PDF Generated',
      description: 'Your presentation will open in a new tab for printing/saving.',
    });
  };

  const handleClose = () => {
    onClose();
    setStep('count');
    setSiteCount(3);
    setMessages([{ 
      role: 'assistant', 
      content: "As a senior prompt engineer, I'll help you create multiple sites at once. Tell me about your project:\n\n• What industry or niche?\n• Target audience?\n• Key features needed?\n• Any branding preferences?" 
    }]);
    setGeneratedSites([]);
    setBuildProgress(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Multi-Site Builder
            {step !== 'count' && (
              <Badge variant="outline" className="ml-2">
                {siteCount} Sites
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === 'count' && 'Select how many sites you want to create'}
            {step === 'chat' && 'Describe your requirements to the AI assistant'}
            {step === 'preview' && 'Review and customize your generated sites'}
            {step === 'building' && 'Building your sites in demo mode...'}
          </DialogDescription>
        </DialogHeader>

        {/* Step: Count Selection */}
        {step === 'count' && (
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>Number of Sites</Label>
              <Select value={siteCount.toString()} onValueChange={(v) => setSiteCount(parseInt(v))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SITE_COUNT_OPTIONS.map(n => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} Sites
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[2, 5, 10].map(n => (
                <button
                  key={n}
                  onClick={() => setSiteCount(n)}
                  className={cn(
                    "p-4 rounded-lg border transition-all text-center",
                    siteCount === n 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="text-2xl font-bold">{n}</div>
                  <div className="text-xs text-muted-foreground">sites</div>
                </button>
              ))}
            </div>

            <Button className="w-full" onClick={() => setStep('chat')}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Continue with AI Chat
            </Button>
          </div>
        )}

        {/* Step: AI Chat */}
        {step === 'chat' && (
          <div className="flex flex-col h-[400px]">
            <ScrollArea className="flex-1 p-4 -mx-6">
              <div className="space-y-4 px-6">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-3",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-lg px-4 py-2.5 max-w-[80%] whitespace-pre-line",
                        msg.role === 'user'
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-2.5">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2 pt-4 border-t">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Describe your project requirements..."
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isGenerating}
              />
              <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isGenerating}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && (
          <div className="space-y-4">
            <ScrollArea className="h-[350px] -mx-6 px-6">
              <div className="grid gap-4">
                {generatedSites.map((site, i) => (
                  <div
                    key={site.id}
                    className="p-4 rounded-lg border border-border hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-10 w-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: site.theme.primaryColor }}
                        >
                          <Globe className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium">{site.name}</h4>
                          <p className="text-sm text-muted-foreground">{site.domain}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{site.theme.style}</Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{site.description}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-muted-foreground">Theme:</span>
                      <div 
                        className="h-4 w-4 rounded-full border"
                        style={{ backgroundColor: site.theme.primaryColor }}
                      />
                      <div 
                        className="h-4 w-4 rounded-full border"
                        style={{ backgroundColor: site.theme.secondaryColor }}
                      />
                      <span className="text-xs font-mono">{site.theme.fontFamily}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {site.features.map(f => (
                        <Badge key={f} variant="secondary" className="text-xs">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={handleExportPDF}>
                <FileDown className="h-4 w-4" />
                Export PDF
              </Button>
              <Button className="flex-1 gap-2" onClick={handleBuild}>
                <Layers className="h-4 w-4" />
                Build All Sites
              </Button>
            </div>
          </div>
        )}

        {/* Step: Building */}
        {step === 'building' && (
          <div className="py-8 space-y-6">
            <div className="text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <h3 className="text-lg font-medium">Building {generatedSites.length} Sites</h3>
              <p className="text-sm text-muted-foreground">Creating demo environments...</p>
            </div>

            <div className="space-y-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${buildProgress}%` }}
                />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                {Math.round(buildProgress)}% Complete
              </p>
            </div>

            <div className="space-y-2">
              {generatedSites.map((site, i) => {
                const isComplete = (i + 1) / generatedSites.length * 100 <= buildProgress;
                return (
                  <div 
                    key={site.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg transition-all",
                      isComplete ? "bg-status-active/10" : "bg-muted/50"
                    )}
                  >
                    {isComplete ? (
                      <Check className="h-4 w-4 text-status-active" />
                    ) : (
                      <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                    )}
                    <span className={cn(
                      "text-sm",
                      isComplete ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {site.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
