import { useState } from 'react';
import { Search, Globe, Facebook, Twitter, RefreshCw, Copy, Check, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Site } from '@/types';

interface SEOManagerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  site: Site | null;
  onSave: (seoData: SEOData) => void;
}

interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  canonicalUrl: string;
  robots: string;
}

interface SEOIssue {
  type: 'error' | 'warning' | 'success';
  message: string;
  field: string;
}

const AI_SEO_PROMPT = `As a senior-level prompt engineer specializing in SEO, analyze this website and generate optimized metadata:

Website: {siteName}
Domain: {domain}
Industry: {industry}

Generate:
1. SEO Title (max 60 chars, include primary keyword)
2. Meta Description (max 160 chars, compelling with CTA)
3. Keywords (5-10 relevant terms)
4. Open Graph metadata for Facebook
5. Twitter Card metadata`;

export function SEOManagerDialog({ isOpen, onClose, site, onSave }: SEOManagerDialogProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [seoData, setSeoData] = useState<SEOData>({
    title: site?.name ? `${site.name} - Professional Solutions` : '',
    description: site?.name ? `Discover ${site.name}. High-quality services and products designed for modern businesses.` : '',
    keywords: ['professional', 'quality', 'modern', 'solutions'],
    ogTitle: site?.name || '',
    ogDescription: '',
    ogImage: '/og-image.jpg',
    twitterTitle: site?.name || '',
    twitterDescription: '',
    twitterImage: '/twitter-image.jpg',
    canonicalUrl: site?.url || '',
    robots: 'index, follow',
  });

  const seoScore = calculateSEOScore(seoData);
  const issues = analyzeSEO(seoData);

  function calculateSEOScore(data: SEOData): number {
    let score = 0;
    if (data.title.length >= 30 && data.title.length <= 60) score += 20;
    else if (data.title.length > 0) score += 10;
    if (data.description.length >= 120 && data.description.length <= 160) score += 20;
    else if (data.description.length > 0) score += 10;
    if (data.keywords.length >= 3) score += 15;
    if (data.ogTitle && data.ogDescription) score += 15;
    if (data.twitterTitle && data.twitterDescription) score += 15;
    if (data.canonicalUrl) score += 15;
    return Math.min(score, 100);
  }

  function analyzeSEO(data: SEOData): SEOIssue[] {
    const issues: SEOIssue[] = [];
    
    if (data.title.length < 30) {
      issues.push({ type: 'warning', message: 'Title is too short (aim for 50-60 characters)', field: 'title' });
    } else if (data.title.length > 60) {
      issues.push({ type: 'error', message: 'Title exceeds 60 characters', field: 'title' });
    } else {
      issues.push({ type: 'success', message: 'Title length is optimal', field: 'title' });
    }

    if (data.description.length < 120) {
      issues.push({ type: 'warning', message: 'Description is too short (aim for 150-160 characters)', field: 'description' });
    } else if (data.description.length > 160) {
      issues.push({ type: 'error', message: 'Description exceeds 160 characters', field: 'description' });
    } else {
      issues.push({ type: 'success', message: 'Description length is optimal', field: 'description' });
    }

    if (data.keywords.length < 3) {
      issues.push({ type: 'warning', message: 'Add more keywords (3-10 recommended)', field: 'keywords' });
    }

    if (!data.ogTitle || !data.ogDescription) {
      issues.push({ type: 'warning', message: 'Complete Open Graph metadata for better social sharing', field: 'og' });
    }

    return issues;
  }

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const generatedData: SEOData = {
      title: `${site?.name || 'Website'} - Premium Digital Solutions`,
      description: `Transform your business with ${site?.name || 'our platform'}. Discover innovative solutions, expert services, and cutting-edge technology. Get started today!`,
      keywords: ['digital solutions', 'business growth', 'innovation', 'technology', 'professional services', 'modern platform'],
      ogTitle: `${site?.name || 'Website'} | Your Partner in Digital Excellence`,
      ogDescription: `Join thousands of satisfied customers. ${site?.name || 'Our platform'} delivers results that matter.`,
      ogImage: '/og-image.jpg',
      twitterTitle: `${site?.name || 'Website'} - Innovation Meets Excellence`,
      twitterDescription: `Discover why businesses choose ${site?.name || 'us'} for their digital transformation journey.`,
      twitterImage: '/twitter-image.jpg',
      canonicalUrl: site?.url || '',
      robots: 'index, follow',
    };
    
    setSeoData(generatedData);
    setIsGenerating(false);
    toast({ title: 'SEO Generated', description: 'AI has optimized your metadata' });
  };

  const handleCopy = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSave = () => {
    onSave(seoData);
    toast({ title: 'SEO Saved', description: 'Your SEO settings have been updated' });
    onClose();
  };

  const updateField = (field: keyof SEOData, value: string | string[]) => {
    setSeoData(prev => ({ ...prev, [field]: value }));
  };

  if (!site) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            SEO Manager - {site.name}
          </DialogTitle>
          <DialogDescription>
            Optimize your site for search engines and social media
          </DialogDescription>
        </DialogHeader>

        {/* SEO Score */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 mb-4">
          <div className="relative h-16 w-16">
            <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${seoScore}, 100`}
                className={cn(
                  seoScore >= 80 ? "text-status-active" :
                  seoScore >= 50 ? "text-amber-500" : "text-destructive"
                )}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
              {seoScore}
            </span>
          </div>
          <div className="flex-1">
            <h4 className="font-medium">SEO Score</h4>
            <p className="text-sm text-muted-foreground">
              {seoScore >= 80 ? 'Excellent! Your SEO is well optimized.' :
               seoScore >= 50 ? 'Good, but there\'s room for improvement.' :
               'Needs attention. Review the issues below.'}
            </p>
          </div>
          <Button onClick={handleGenerateAI} disabled={isGenerating} className="gap-2">
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            AI Generate
          </Button>
        </div>

        <Tabs defaultValue="basic" className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic SEO</TabsTrigger>
            <TabsTrigger value="google">Google Preview</TabsTrigger>
            <TabsTrigger value="facebook">Facebook</TabsTrigger>
            <TabsTrigger value="twitter">Twitter</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Title Tag</Label>
                <span className={cn(
                  "text-xs",
                  seoData.title.length > 60 ? "text-destructive" : "text-muted-foreground"
                )}>
                  {seoData.title.length}/60
                </span>
              </div>
              <Input
                value={seoData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Enter SEO title"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Meta Description</Label>
                <span className={cn(
                  "text-xs",
                  seoData.description.length > 160 ? "text-destructive" : "text-muted-foreground"
                )}>
                  {seoData.description.length}/160
                </span>
              </div>
              <Textarea
                value={seoData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Enter meta description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Keywords</Label>
              <Input
                value={seoData.keywords.join(', ')}
                onChange={(e) => updateField('keywords', e.target.value.split(',').map(k => k.trim()))}
                placeholder="keyword1, keyword2, keyword3"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {seoData.keywords.map((keyword, i) => (
                  <Badge key={i} variant="secondary">{keyword}</Badge>
                ))}
              </div>
            </div>

            {/* Issues List */}
            <div className="space-y-2 pt-4 border-t">
              <Label>SEO Analysis</Label>
              {issues.map((issue, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-2 text-sm p-2 rounded-md",
                    issue.type === 'error' && "bg-destructive/10 text-destructive",
                    issue.type === 'warning' && "bg-amber-500/10 text-amber-600",
                    issue.type === 'success' && "bg-status-active/10 text-status-active"
                  )}
                >
                  {issue.type === 'error' && <AlertTriangle className="h-4 w-4" />}
                  {issue.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                  {issue.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                  {issue.message}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="google" className="mt-4">
            {/* Google Search Preview */}
            <div className="p-4 rounded-lg border bg-white dark:bg-card">
              <p className="text-xs text-muted-foreground mb-2">Search Preview</p>
              <div className="space-y-1">
                <p className="text-[#1a0dab] text-lg hover:underline cursor-pointer">
                  {seoData.title || 'Page Title'}
                </p>
                <p className="text-[#006621] text-sm">
                  {site.url}
                </p>
                <p className="text-sm text-[#545454]">
                  {seoData.description || 'Meta description will appear here...'}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="facebook" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>OG Title</Label>
                <Input
                  value={seoData.ogTitle}
                  onChange={(e) => updateField('ogTitle', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>OG Description</Label>
                <Textarea
                  value={seoData.ogDescription}
                  onChange={(e) => updateField('ogDescription', e.target.value)}
                  rows={2}
                />
              </div>

              {/* Facebook Preview */}
              <div className="border rounded-lg overflow-hidden">
                <div className="aspect-[1.91/1] bg-muted flex items-center justify-center">
                  <Facebook className="h-12 w-12 text-muted-foreground/30" />
                </div>
                <div className="p-3 bg-[#f2f3f5] dark:bg-muted">
                  <p className="text-xs text-[#606770] uppercase">{site.domain}</p>
                  <p className="font-semibold text-[#1d2129]">
                    {seoData.ogTitle || seoData.title || 'Page Title'}
                  </p>
                  <p className="text-sm text-[#606770] line-clamp-2">
                    {seoData.ogDescription || seoData.description || 'Description...'}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="twitter" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Twitter Title</Label>
                <Input
                  value={seoData.twitterTitle}
                  onChange={(e) => updateField('twitterTitle', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Twitter Description</Label>
                <Textarea
                  value={seoData.twitterDescription}
                  onChange={(e) => updateField('twitterDescription', e.target.value)}
                  rows={2}
                />
              </div>

              {/* Twitter Preview */}
              <div className="border rounded-2xl overflow-hidden">
                <div className="aspect-[2/1] bg-muted flex items-center justify-center">
                  <Twitter className="h-12 w-12 text-muted-foreground/30" />
                </div>
                <div className="p-3">
                  <p className="font-semibold">
                    {seoData.twitterTitle || seoData.title || 'Page Title'}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {seoData.twitterDescription || seoData.description || 'Description...'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {site.domain}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save SEO Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
