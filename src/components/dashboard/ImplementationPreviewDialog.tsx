import { useState } from 'react';
import { Play, X, FileCode, ChevronRight, Check, Loader2 } from 'lucide-react';
import { AISuggestion } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ImplementationPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: AISuggestion | null;
  onConfirmImplement: (suggestion: AISuggestion) => void;
}

// Mock code diff for demonstration
const generateMockDiff = (suggestion: AISuggestion) => {
  const diffs: { file: string; before: string; after: string }[] = [];

  if (suggestion.category === 'performance') {
    diffs.push({
      file: 'src/middleware/cache.ts',
      before: `// No caching implemented
export function handleRequest(req: Request) {
  return fetchData(req.url);
}`,
      after: `// Cache-first strategy with 5-minute TTL
const cache = new Map<string, { data: any; expires: number }>();

export function handleRequest(req: Request) {
  const cached = cache.get(req.url);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  
  const data = fetchData(req.url);
  cache.set(req.url, { data, expires: Date.now() + 300000 });
  return data;
}`,
    });
  } else if (suggestion.category === 'security') {
    diffs.push({
      file: 'src/auth/twoFactor.ts',
      before: `// Basic authentication only
export async function authenticate(email: string, password: string) {
  return validateCredentials(email, password);
}`,
      after: `// Enhanced authentication with TOTP 2FA
import { verifyTOTP } from './totp';

export async function authenticate(
  email: string, 
  password: string,
  totpCode?: string
) {
  const user = await validateCredentials(email, password);
  
  if (user.has2FA && totpCode) {
    const isValidTOTP = await verifyTOTP(user.secret, totpCode);
    if (!isValidTOTP) throw new Error('Invalid 2FA code');
  }
  
  return user;
}`,
    });
  } else {
    diffs.push({
      file: suggestion.technicalDetails.filesAffected[0] || 'src/components/Example.tsx',
      before: `// Original implementation
export function Component() {
  return <div>Original content</div>;
}`,
      after: `// Optimized implementation
export function Component() {
  // Added performance improvements
  const memoizedValue = useMemo(() => {
    return computeExpensiveValue();
  }, []);

  return <div>{memoizedValue}</div>;
}`,
    });
  }

  return diffs;
};

export function ImplementationPreviewDialog({
  isOpen,
  onClose,
  suggestion,
  onConfirmImplement,
}: ImplementationPreviewDialogProps) {
  const [isImplementing, setIsImplementing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  if (!suggestion) return null;

  const diffs = generateMockDiff(suggestion);

  const handleImplement = async () => {
    setIsImplementing(true);
    
    // Simulate implementation steps
    for (let i = 0; i < diffs.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setCurrentStep(diffs.length);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onConfirmImplement(suggestion);
    setIsImplementing(false);
    setCurrentStep(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            Implementation Preview
          </DialogTitle>
          <DialogDescription>
            Review the changes before implementing: {suggestion.title}
          </DialogDescription>
        </DialogHeader>

        {/* Summary */}
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium">{suggestion.title}</p>
            <p className="text-xs text-muted-foreground">{suggestion.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{suggestion.technicalDetails.estimatedTime}</Badge>
            <Badge variant="outline" className="capitalize">{suggestion.technicalDetails.complexity}</Badge>
          </div>
        </div>

        {/* File Changes */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4">
            {diffs.map((diff, index) => (
              <div key={diff.file} className="rounded-lg border border-border overflow-hidden">
                {/* File Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-muted-foreground" />
                    <code className="text-sm font-mono">{diff.file}</code>
                  </div>
                  {isImplementing && (
                    <div className="flex items-center gap-2">
                      {currentStep > index ? (
                        <Check className="h-4 w-4 text-status-active" />
                      ) : currentStep === index ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </div>

                {/* Diff View */}
                <div className="grid grid-cols-2 divide-x divide-border">
                  {/* Before */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-status-inactive">Before</span>
                    </div>
                    <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap bg-status-inactive/5 p-3 rounded-lg border border-status-inactive/20">
                      {diff.before}
                    </pre>
                  </div>

                  {/* After */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-status-active">After</span>
                    </div>
                    <pre className={cn(
                      "text-xs font-mono whitespace-pre-wrap p-3 rounded-lg border",
                      "bg-status-active/5 border-status-active/20 text-foreground"
                    )}>
                      {diff.after}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Implementation Prompt */}
        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs font-medium text-primary mb-1">Implementation Prompt</p>
          <p className="text-xs text-muted-foreground font-mono line-clamp-2">
            {suggestion.technicalDetails.prompt}
          </p>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isImplementing}>
            Cancel
          </Button>
          <Button onClick={handleImplement} disabled={isImplementing} className="gap-2">
            {isImplementing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Implementing... ({currentStep + 1}/{diffs.length + 1})
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Confirm & Implement
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}