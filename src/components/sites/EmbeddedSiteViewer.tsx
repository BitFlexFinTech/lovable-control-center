import { useState } from 'react';
import { X, ExternalLink, RefreshCw, ArrowLeft, ArrowRight, Home, Maximize2, Minimize2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface EmbeddedSiteViewerProps {
  isOpen: boolean;
  onClose: () => void;
  siteUrl: string;
  siteName: string;
}

export function EmbeddedSiteViewer({ isOpen, onClose, siteUrl, siteName }: EmbeddedSiteViewerProps) {
  const [currentUrl, setCurrentUrl] = useState(siteUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [history, setHistory] = useState<string[]>([siteUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setIframeError(true);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeError(false);
    const iframe = document.getElementById('embedded-site-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = currentUrl;
    }
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
      setIframeError(false);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
      setIframeError(false);
    }
  };

  const handleHome = () => {
    if (currentUrl !== siteUrl) {
      const newHistory = [...history.slice(0, historyIndex + 1), siteUrl];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setCurrentUrl(siteUrl);
      setIframeError(false);
    }
  };

  const handleOpenExternal = () => {
    window.open(currentUrl, '_blank');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Ensure URL is properly formatted
  const formattedUrl = currentUrl.startsWith('http') ? currentUrl : `https://${currentUrl}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "p-0 gap-0 overflow-hidden",
          isFullscreen 
            ? "max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] rounded-none" 
            : "max-w-[95vw] w-[95vw] h-[90vh] max-h-[90vh]"
        )}
      >
        {/* Browser-like toolbar */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 border-b">
          {/* Navigation buttons */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={handleBack}
              disabled={historyIndex === 0}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={handleForward}
              disabled={historyIndex >= history.length - 1}
              className="h-8 w-8"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={handleRefresh}
              className="h-8 w-8"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={handleHome}
              className="h-8 w-8"
            >
              <Home className="h-4 w-4" />
            </Button>
          </div>

          {/* URL bar */}
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                value={formattedUrl}
                readOnly
                className="h-8 pr-10 bg-background text-sm font-mono"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {siteName}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={handleOpenExternal}
              className="h-8 w-8"
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={toggleFullscreen}
              className="h-8 w-8"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading && !iframeError && (
          <div className="absolute inset-0 top-14 bg-background/80 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Loading {siteName}...</p>
            </div>
          </div>
        )}

        {/* Iframe error fallback */}
        {iframeError && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 bg-background">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">Cannot embed this site</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                This site blocks iframe embedding for security reasons (X-Frame-Options). 
                You can still open it in a new tab.
              </p>
            </div>
            <Button onClick={handleOpenExternal} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </Button>
          </div>
        )}

        {/* Iframe container */}
        {!iframeError && (
          <div className="flex-1 relative">
            <iframe
              id="embedded-site-iframe"
              src={formattedUrl}
              className="w-full h-full border-0"
              onLoad={handleLoad}
              onError={handleIframeError}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              title={`Embedded view of ${siteName}`}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
