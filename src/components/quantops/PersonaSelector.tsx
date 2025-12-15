import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Bot } from "lucide-react";
import { QuantOpsPersona } from "@/types/quantops";

interface PersonaSelectorProps {
  personas: QuantOpsPersona[];
  selectedPersonaId: string | null;
  onSelectPersona: (personaId: string | null) => void;
  isLoading?: boolean;
}

export function PersonaSelector({ 
  personas, 
  selectedPersonaId, 
  onSelectPersona,
  isLoading 
}: PersonaSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Select 
        value={selectedPersonaId || ""} 
        onValueChange={(value) => onSelectPersona(value || null)}
        disabled={isLoading}
      >
        <SelectTrigger className="w-64">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <SelectValue placeholder="Select a persona" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {personas.map((persona) => (
            <SelectItem key={persona.id} value={persona.id}>
              <div className="flex items-center gap-2">
                {persona.avatarUrl && (
                  <img 
                    src={persona.avatarUrl} 
                    alt={persona.name} 
                    className="h-5 w-5 rounded-full"
                  />
                )}
                <span>{persona.name}</span>
                <span className="text-xs text-muted-foreground">
                  [{persona.codename}]
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" size="icon">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
