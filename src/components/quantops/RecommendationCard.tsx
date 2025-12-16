import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useApplyCard, useDismissCard } from '@/hooks/useQuantOps';
import { 
  ChevronDown, 
  ChevronUp, 
  Play, 
  X, 
  AlertTriangle, 
  TrendingUp,
  Code,
  TestTube,
  Undo2
} from 'lucide-react';
import type { RecommendationCard as RecommendationCardType } from '@/types/quantops';

interface RecommendationCardProps {
  card: RecommendationCardType;
}

const priorityColors: Record<string, string> = {
  low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
};

const riskColors: Record<string, string> = {
  low: 'text-green-500',
  medium: 'text-amber-500',
  high: 'text-destructive',
};

export function RecommendationCard({ card }: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const applyCard = useApplyCard();
  const dismissCard = useDismissCard();

  const handleApply = (environment: string) => {
    applyCard.mutate({
      cardId: card.id,
      environment,
    });
  };

  const handleDismiss = () => {
    dismissCard.mutate(card.id);
  };

  return (
    <Card className={`border-l-4 ${
      card.priority === 'critical' ? 'border-l-destructive' :
      card.priority === 'high' ? 'border-l-orange-500' :
      card.priority === 'medium' ? 'border-l-amber-500' :
      'border-l-blue-500'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{card.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={priorityColors[card.priority] || priorityColors.medium}>
                {card.priority}
              </Badge>
              <Badge variant="outline">{card.cardType}</Badge>
              <span className={`text-sm ${riskColors[card.riskLevel] || riskColors.low}`}>
                Risk: {card.riskLevel}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Impact Score</p>
              <p className="text-2xl font-bold">{card.impactScore}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {card.description && (
          <p className="text-sm text-muted-foreground">{card.description}</p>
        )}

        {/* Trigger Metrics */}
        {Object.keys(card.triggerMetrics).length > 0 && (
          <div className="flex flex-wrap gap-4">
            {Object.entries(card.triggerMetrics).map(([key, value]) => (
              value !== undefined && (
                <div key={key} className="text-sm">
                  <span className="text-muted-foreground">{key}:</span>{' '}
                  <span className="font-medium">{value}</span>
                </div>
              )
            ))}
          </div>
        )}

        {/* Estimated Improvement */}
        {card.estimatedImprovement && (
          <div className="bg-green-500/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="font-medium text-green-500">Expected Improvement</span>
            </div>
            <p className="text-sm">{card.estimatedImprovement.description}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-sm">
              {card.estimatedImprovement.rejectRateReduction && (
                <span>Reject Rate: -{card.estimatedImprovement.rejectRateReduction}%</span>
              )}
              {card.estimatedImprovement.latencyReduction && (
                <span>Latency: -{card.estimatedImprovement.latencyReduction}ms</span>
              )}
              {card.estimatedImprovement.profitIncrease && (
                <span>Profit: +{card.estimatedImprovement.profitIncrease}%</span>
              )}
            </div>
          </div>
        )}

        {/* Expandable Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full">
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show Details
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Proposed Changes */}
            {card.proposedChanges.length > 0 && (
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Code className="h-4 w-4" />
                  Proposed Changes
                </h4>
                <div className="space-y-2">
                  {card.proposedChanges.map(change => (
                    <div key={change.id} className="bg-muted rounded-lg p-3 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{change.type}</Badge>
                        <span className="font-mono text-xs">{change.filePath}</span>
                      </div>
                      <p>{change.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Test Requirements */}
            {card.testRequirements.length > 0 && (
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <TestTube className="h-4 w-4" />
                  Test Requirements
                </h4>
                <div className="space-y-2">
                  {card.testRequirements.map(test => (
                    <div key={test.id} className="flex items-start gap-2 text-sm">
                      <Badge variant={test.required ? 'default' : 'secondary'}>
                        {test.type}
                      </Badge>
                      <span>{test.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rollback Plan */}
            {card.rollbackPlan && (
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Undo2 className="h-4 w-4" />
                  Rollback Plan
                </h4>
                <div className="bg-muted rounded-lg p-3 text-sm">
                  <p>Strategy: {card.rollbackPlan.strategy}</p>
                  <p>Estimated time: {card.rollbackPlan.estimatedTime}</p>
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <Button 
          variant="ghost" 
          onClick={handleDismiss}
          disabled={dismissCard.isPending}
        >
          <X className="h-4 w-4 mr-2" />
          Dismiss
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleApply('demo')}
            disabled={applyCard.isPending}
          >
            <Play className="h-4 w-4 mr-2" />
            Demo
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleApply('paper')}
            disabled={applyCard.isPending}
          >
            Paper
          </Button>
          <Button 
            onClick={() => handleApply('canary')}
            disabled={applyCard.isPending}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Canary
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
