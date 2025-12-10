import { useState, useEffect, useCallback } from 'react';
import { Check, X, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { validateUsername, UsernameValidationResult } from '@/utils/usernameValidator';

interface UsernameValidatorProps {
  username: string;
  onUsernameChange: (username: string) => void;
  platform: string;
  platformName: string;
  onValidationComplete?: (result: UsernameValidationResult) => void;
}

export function UsernameValidator({
  username,
  onUsernameChange,
  platform,
  platformName,
  onValidationComplete,
}: UsernameValidatorProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<UsernameValidationResult | null>(null);
  const [debouncedUsername, setDebouncedUsername] = useState(username);

  // Debounce username changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(username);
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);

  // Validate when debounced username changes
  useEffect(() => {
    const checkUsername = async () => {
      if (!debouncedUsername || debouncedUsername.length < 2) {
        setResult(null);
        return;
      }

      setIsChecking(true);
      try {
        const validationResult = await validateUsername(debouncedUsername, platform);
        setResult(validationResult);
        onValidationComplete?.(validationResult);
      } catch (error) {
        console.error('Username validation error:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkUsername();
  }, [debouncedUsername, platform, onValidationComplete]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    onUsernameChange(suggestion);
  }, [onUsernameChange]);

  const getStatusIcon = () => {
    if (isChecking) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    if (!result) return null;
    if (result.isValid && result.isAvailable) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    if (!result.isAvailable) {
      return <X className="h-4 w-4 text-destructive" />;
    }
    if (!result.isValid) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
    return null;
  };

  const getStatusColor = () => {
    if (!result) return '';
    if (result.isValid && result.isAvailable) return 'border-green-500/50 focus-within:ring-green-500/20';
    if (!result.isAvailable) return 'border-destructive/50 focus-within:ring-destructive/20';
    if (!result.isValid) return 'border-yellow-500/50 focus-within:ring-yellow-500/20';
    return '';
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">
        {platformName} Username
      </Label>
      <div className={cn("relative flex items-center rounded-md border bg-muted/50 transition-all", getStatusColor())}>
        <Input
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          placeholder={`Enter ${platformName} username`}
          className="border-0 bg-transparent h-9 pr-10"
        />
        <div className="absolute right-3">
          {getStatusIcon()}
        </div>
      </div>

      {/* Validation errors */}
      {result && result.errors.length > 0 && (
        <div className="space-y-1 animate-fade-in">
          {result.errors.map((error, i) => (
            <p key={i} className="text-xs text-destructive flex items-center gap-1">
              <X className="h-3 w-3" />
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Availability status */}
      {result && !result.isAvailable && result.isValid && (
        <div className="space-y-2 animate-fade-in">
          <p className="text-xs text-destructive flex items-center gap-1">
            <X className="h-3 w-3" />
            Username is taken on {platformName}
          </p>
          
          {result.suggestions.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Try:</span>
              {result.suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs px-2 hover:bg-primary/10 hover:text-primary"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Success status */}
      {result && result.isValid && result.isAvailable && (
        <p className="text-xs text-green-500 flex items-center gap-1 animate-fade-in">
          <Check className="h-3 w-3" />
          Username available on {platformName}
        </p>
      )}
    </div>
  );
}

// Multi-platform availability checker component
interface MultiPlatformCheckerProps {
  username: string;
  platforms: { platform: string; name: string; color: string }[];
}

export function MultiPlatformChecker({ username, platforms }: MultiPlatformCheckerProps) {
  const [results, setResults] = useState<Record<string, { checking: boolean; available?: boolean }>>({});

  useEffect(() => {
    if (!username || username.length < 2) {
      setResults({});
      return;
    }

    // Set all to checking
    const initialState: Record<string, { checking: boolean }> = {};
    platforms.forEach(p => {
      initialState[p.platform] = { checking: true };
    });
    setResults(initialState);

    // Check each platform
    const checkAll = async () => {
      for (const p of platforms) {
        try {
          const result = await validateUsername(username, p.platform);
          setResults(prev => ({
            ...prev,
            [p.platform]: { checking: false, available: result.isAvailable && result.isValid }
          }));
        } catch (error) {
          setResults(prev => ({
            ...prev,
            [p.platform]: { checking: false, available: false }
          }));
        }
      }
    };

    const timer = setTimeout(checkAll, 600);
    return () => clearTimeout(timer);
  }, [username, platforms]);

  if (!username || username.length < 2) return null;

  return (
    <div className="flex flex-wrap gap-2 animate-fade-in">
      {platforms.map(p => {
        const status = results[p.platform];
        if (!status) return null;

        return (
          <Badge
            key={p.platform}
            variant="outline"
            className={cn(
              "gap-1.5 transition-all duration-300",
              status.checking && "opacity-50",
              status.available === true && "border-green-500/50 text-green-500 bg-green-500/10",
              status.available === false && "border-destructive/50 text-destructive bg-destructive/10"
            )}
          >
            {status.checking ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : status.available ? (
              <Check className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
            {p.name}
          </Badge>
        );
      })}
    </div>
  );
}
