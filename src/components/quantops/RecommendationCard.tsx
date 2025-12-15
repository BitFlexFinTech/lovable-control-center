import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RecommendationCard as RecommendationCardType } from "@/types/quantops";
import { useApplyCard, useDismissCard } from "@/hooks/useQuantOps";
import { 
  AlertTriangle, 
  TrendingUp, 
  Code, 
  ChevronDown, 
  ChevronUp,
  Play,
  X,
  MessageSquare,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RecommendationCardProps {
  card: RecommendationCardType;
}

export function RecommendationCard({ card }: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const applyCard = useApplyCard();
  const dismissCard = useDismissCard();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const handleApply = () => {
    applyCard.mutate({ cardId: card.id, environment: 'demo' });
  };

  const handleDismiss = () => {
    dismissCard.mutate(card.id);
  };

  return (
    <Card className="border-l-4" style={{ 
      borderLeftColor: card.priority === 'critical' || card.priority === 'high' 
        ? 'hsl(var(--destructive))' 
        : 'hsl(var(--primary))' 
    }}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {card.cardType === 'performance' && <TrendingUp className="h-4 w-4 text-primary" />}
            {card.cardType === 'risk' && <AlertTriangle className="h-4 w-4 text-destructive" />}
            {card.cardType === 'code' && <Code className="h-4 w-4 text-muted-foreground" />}
            <CardTitle className="text-base">{card.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getPriorityColor(card.priority)}>
              {card.priority}
            </Badge>
            <Badge variant="outline" className={getRiskColor(card.riskLevel)}>
              {card.riskLevel} risk
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(card.createdAt), { addSuffix: true })}
        </p>
      </CardHeader>

      <CardContent className="pb-2">
        {card.description && (
          <p className="text-sm text-muted-foreground">{card.description}</p>
        )}

        <div className="flex items-center gap-4 mt-3">
          <div className="text-sm">
            <span className="text-muted-foreground">Impact Score:</span>
            <span className="ml-1 font-semibold">{card.impactScore}/100</span>
          </div>
          {card.estimatedImprovement && (
            <div className="text-sm text-green-500">
              {card.estimatedImprovement.description}
            </div>
          )}
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="mt-2 w-full">
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" /> Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" /> View Details
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-3">
            {card.proposedChanges && card.proposedChanges.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Proposed Changes</h4>
                <div className="space-y-2">
                  {card.proposedChanges.map((change, i) => (
                    <div key={i} className="text-sm bg-muted p-2 rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{change.type}</Badge>
                        <code className="text-xs">{change.filePath}</code>
                      </div>
                      <p className="mt-1 text-muted-foreground">{change.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {card.testRequirements && card.testRequirements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Test Requirements</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {card.testRequirements.map((test, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{test.type}</Badge>
                      {test.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {card.rollbackPlan && (
              <div>
                <h4 className="text-sm font-medium mb-2">Rollback Plan</h4>
                <p className="text-sm text-muted-foreground">
                  Strategy: {card.rollbackPlan.strategy.replace('_', ' ')}
                  {card.rollbackPlan.estimatedTime && ` (${card.rollbackPlan.estimatedTime})`}
                </p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>

      <CardFooter className="pt-2 gap-2">
        <Button 
          size="sm" 
          onClick={handleApply}
          disabled={applyCard.isPending}
        >
          <Play className="h-4 w-4 mr-1" />
          Apply to Demo
        </Button>
        <Button variant="outline" size="sm">
          <MessageSquare className="h-4 w-4 mr-1" />
          Discuss
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleDismiss}
          disabled={dismissCard.isPending}
        >
          <X className="h-4 w-4 mr-1" />
          Dismiss
        </Button>
      </CardFooter>
    </Card>
  );
}
