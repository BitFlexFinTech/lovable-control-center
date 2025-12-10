import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Rocket, 
  Globe, 
  Check, 
  AlertTriangle, 
  Loader2,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { StoredCredential } from '@/types/credentials';
import { cn } from '@/lib/utils';

type Step = 'review' | 'confirm' | 'processing' | 'complete';

interface GoLiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  siteName: string;
  siteDomain: string;
  domainPrice: number;
  credentials: StoredCredential[];
  onGoLive: () => Promise<void>;
}

export function GoLiveDialog({
  isOpen,
  onClose,
  siteName,
  siteDomain,
  domainPrice,
  credentials,
  onGoLive,
}: GoLiveDialogProps) {
  const [step, setStep] = useState<Step>('review');
  const [confirmed, setConfirmed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const handleGoLive = async () => {
    setStep('processing');
    
    // Simulate processing steps
    const tasks = [
      { label: 'Purchasing domain...', key: 'domain' },
      ...credentials.slice(0, 5).map(c => ({
        label: `Creating ${c.integrationName} account...`,
        key: c.integrationId,
      })),
      { label: 'Finalizing configuration...', key: 'config' },
    ];

    for (let i = 0; i < tasks.length; i++) {
      setCurrentTask(tasks[i].label);
      setProgress(((i + 1) / tasks.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 800));
      setCompletedTasks(prev => [...prev, tasks[i].key]);
    }

    await onGoLive();
    setStep('complete');
  };

  const handleClose = () => {
    setStep('review');
    setConfirmed(false);
    setProgress(0);
    setCurrentTask('');
    setCompletedTasks([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Go Live - {siteName}
          </DialogTitle>
          <DialogDescription>
            {step === 'review' && 'Review your site configuration before going live.'}
            {step === 'confirm' && 'Confirm your purchase and account creation.'}
            {step === 'processing' && 'Creating your accounts...'}
            {step === 'complete' && 'Your site is now live!'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 'review' && (
            <div className="space-y-4">
              {/* Domain */}
              <div className="p-4 rounded-xl border border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{siteDomain}</p>
                      <p className="text-sm text-muted-foreground">Custom domain</p>
                    </div>
                  </div>
                  <Badge variant="outline">${domainPrice}/yr</Badge>
                </div>
              </div>

              {/* Credentials Summary */}
              <div className="p-4 rounded-xl border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Integration Accounts</h4>
                  <Badge variant="secondary">{credentials.length} accounts</Badge>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {credentials.map(cred => (
                    <div key={cred.id} className="flex items-center gap-2 text-sm">
                      <span>{cred.integrationIcon}</span>
                      <span className="flex-1">{cred.integrationName}</span>
                      <span className="text-muted-foreground truncate">{cred.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4">
              {/* Cost Summary */}
              <div className="p-4 rounded-xl border border-border bg-muted/30">
                <h4 className="font-medium mb-3">Cost Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Domain ({siteDomain})</span>
                    <span>${domainPrice}/yr</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Integration accounts</span>
                    <span>Free tier</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border font-medium">
                    <span>Total</span>
                    <span>${domainPrice}/yr</span>
                  </div>
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-status-warning/10 border border-status-warning/30">
                <Checkbox
                  id="confirm"
                  checked={confirmed}
                  onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                  className="mt-0.5"
                />
                <label htmlFor="confirm" className="text-sm">
                  <span className="font-medium">I understand</span> that clicking "Go Live" will 
                  purchase the domain and create real accounts for all integrations. 
                  This action cannot be undone.
                </label>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="space-y-4">
              <Progress value={progress} className="h-2" />
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>{currentTask}</span>
              </div>
              <div className="space-y-2">
                {completedTasks.map(task => (
                  <div key={task} className="flex items-center gap-2 text-sm text-status-active">
                    <Check className="h-4 w-4" />
                    <span className="capitalize">{task} created</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center py-6">
              <div className="h-16 w-16 rounded-full bg-status-active/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-status-active" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Site is Live!</h3>
              <p className="text-muted-foreground mb-4">
                Your domain has been purchased and all integration accounts have been created.
              </p>
              <div className="p-3 rounded-lg bg-muted/50 inline-block">
                <p className="text-sm font-medium">{siteDomain}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === 'review' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={() => setStep('confirm')}>
                Continue to Checkout
              </Button>
            </>
          )}
          {step === 'confirm' && (
            <>
              <Button variant="outline" onClick={() => setStep('review')}>
                Back
              </Button>
              <Button 
                onClick={handleGoLive}
                disabled={!confirmed}
                className="gap-2 bg-status-active hover:bg-status-active/90"
              >
                <CreditCard className="h-4 w-4" />
                Go Live (${domainPrice})
              </Button>
            </>
          )}
          {step === 'complete' && (
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
