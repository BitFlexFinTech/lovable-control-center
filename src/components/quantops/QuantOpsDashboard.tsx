import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuantOpsPersonas, useRecommendationCards, useApplyEvents } from '@/hooks/useQuantOps';
import { RecommendationCard } from './RecommendationCard';
import { ApplyTimeline } from './ApplyTimeline';
import { KPIStatusPanel } from './KPIStatusPanel';
import { Bot, Activity, GitBranch, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface QuantOpsDashboardProps {
  siteId?: string;
}

export function QuantOpsDashboard({ siteId }: QuantOpsDashboardProps) {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  
  const { data: personas, isLoading: personasLoading } = useQuantOpsPersonas(siteId);
  const { data: cards, isLoading: cardsLoading } = useRecommendationCards(
    selectedPersonaId || undefined,
    selectedPersonaId ? undefined : undefined
  );
  const { data: events, isLoading: eventsLoading } = useApplyEvents(
    selectedPersonaId || undefined
  );

  const pendingCards = cards?.filter(c => c.status === 'pending') || [];
  const appliedCards = cards?.filter(c => c.status === 'applied') || [];
  const failedCards = cards?.filter(c => c.status === 'failed' || c.status === 'rolled_back') || [];

  if (personasLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Persona Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            QuantOps Personas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {personas?.map(persona => (
              <Button
                key={persona.id}
                variant={selectedPersonaId === persona.id ? 'default' : 'outline'}
                onClick={() => setSelectedPersonaId(persona.id)}
                className="flex items-center gap-2"
              >
                <span className={`h-2 w-2 rounded-full ${
                  persona.status === 'active' ? 'bg-green-500' : 'bg-muted'
                }`} />
                <span>{persona.codename}</span>
                <Badge variant="secondary" className="text-xs">
                  {persona.role}
                </Badge>
              </Button>
            ))}
            {(!personas || personas.length === 0) && (
              <p className="text-muted-foreground text-sm">
                No QuantOps personas configured. Create one to enable AI-driven trading optimizations.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedPersonaId && (
        <Tabs defaultValue="recommendations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recommendations
              {pendingCards.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {pendingCards.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="kpis" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              KPI Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-muted-foreground">Pending</span>
                  </div>
                  <p className="text-2xl font-bold">{pendingCards.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Applied</span>
                  </div>
                  <p className="text-2xl font-bold">{appliedCards.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-muted-foreground">Failed</span>
                  </div>
                  <p className="text-2xl font-bold">{failedCards.length}</p>
                </CardContent>
              </Card>
            </div>

            {/* Recommendation Cards */}
            {cardsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : pendingCards.length > 0 ? (
              <div className="space-y-4">
                {pendingCards.map(card => (
                  <RecommendationCard key={card.id} card={card} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No pending recommendations. The system is monitoring for optimization opportunities.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timeline">
            <ApplyTimeline 
              events={events || []} 
              isLoading={eventsLoading} 
            />
          </TabsContent>

          <TabsContent value="kpis">
            <KPIStatusPanel personaId={selectedPersonaId} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
