import { RecommendationCard as RecommendationCardType } from "@/types/quantops";
import { RecommendationCard } from "./RecommendationCard";

interface RecommendationCardsListProps {
  cards: RecommendationCardType[];
}

export function RecommendationCardsList({ cards }: RecommendationCardsListProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No pending recommendations</p>
        <p className="text-sm mt-1">AI is monitoring your trading systems for optimization opportunities</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <RecommendationCard key={card.id} card={card} />
      ))}
    </div>
  );
}
