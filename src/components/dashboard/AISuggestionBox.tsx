import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Lightbulb, Zap, MessageSquare, Play, X, Clock, FileCode } from 'lucide-react';
import { AISuggestion } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AISuggestionBoxProps {
  suggestions: AISuggestion[];
  onImplement: (suggestion: AISuggestion) => void;
  onChat: (suggestion: AISuggestion) => void;
  onDismiss: (suggestionId: string) => void;
}

const priorityConfig = {
  high: { color: 'text-status-inactive', bg: 'bg-status-inactive/10', border: 'border-status-inactive/30' },
  medium: { color: 'text-status-warning', bg: 'bg-status-warning/10', border: 'border-status-warning/30' },
  low: { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
};

const categoryIcons = {
  performance: Zap,
  security: Zap,
  ux: Lightbulb,
  seo: Lightbulb,
  integration: Zap,
};

export function AISuggestionBox({ suggestions, onImplement, onChat, onDismiss }: AISuggestionBoxProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  if (pendingSuggestions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
        <h3 className="font-semibold mb-1">All Caught Up!</h3>
        <p className="text-sm text-muted-foreground">No pending AI suggestions. Your sites are performing well.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI Suggestions</h3>
            <Badge variant="secondary" className="text-xs">{pendingSuggestions.length}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Senior Engineer Analysis</p>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
        {pendingSuggestions.map((suggestion) => {
          const isExpanded = expandedId === suggestion.id;
          const config = priorityConfig[suggestion.priority];
          const CategoryIcon = categoryIcons[suggestion.category] || Lightbulb;

          return (
            <div key={suggestion.id} className="group">
              {/* Summary Row */}
              <div 
                className="px-5 py-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : suggestion.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg", config.bg)}>
                    <CategoryIcon className={cn("h-4 w-4", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{suggestion.title}</h4>
                      <Badge variant="outline" className={cn("text-xs", config.border, config.color)}>
                        {suggestion.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{suggestion.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${suggestion.targetSiteId ? '#3B82F6' : '#06B6D4'}20` }}
                      >
                        {suggestion.targetSiteName}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {suggestion.technicalDetails.estimatedTime}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-5 pb-4 bg-muted/30 animate-accordion-down">
                  <div className="space-y-4">
                    {/* Impact */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Expected Impact</p>
                      <p className="text-sm">{suggestion.expectedImpact}</p>
                    </div>

                    {/* Technical Details */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Complexity</p>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {suggestion.technicalDetails.complexity}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Time</p>
                        <span className="text-sm">{suggestion.technicalDetails.estimatedTime}</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Files</p>
                        <span className="text-sm">{suggestion.technicalDetails.filesAffected.length} files</span>
                      </div>
                    </div>

                    {/* Files Affected */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Files Affected</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.technicalDetails.filesAffected.map((file, i) => (
                          <code key={i} className="text-xs px-2 py-1 rounded bg-card border border-border">
                            <FileCode className="h-3 w-3 inline mr-1" />
                            {file}
                          </code>
                        ))}
                      </div>
                    </div>

                    {/* Prompt Preview */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Implementation Prompt</p>
                      <div className="bg-card rounded-lg p-3 border border-border">
                        <p className="text-xs text-muted-foreground font-mono line-clamp-3">
                          {suggestion.technicalDetails.prompt}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="gap-1.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          onImplement(suggestion);
                        }}
                      >
                        <Play className="h-3.5 w-3.5" />
                        Implement
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChat(suggestion);
                        }}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Chat
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1.5 text-muted-foreground ml-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismiss(suggestion.id);
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}