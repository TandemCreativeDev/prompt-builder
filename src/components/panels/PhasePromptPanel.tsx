import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhasesConfig, PhasePromptsData, PromptFragment, HistoryLogEntry } from "@/types/prompts";
import { PromptItem } from './PromptItem';

/**
 * Props for the PhasePromptPanel component
 */
export interface PhasePromptPanelProps {
  /**
   * The phases configuration data
   */
  phasesConfig: PhasesConfig;
  /**
   * Map of phase prompts data by phase ID
   */
  phasePromptsMap: Record<string, PhasePromptsData>;
  /**
   * Event handler for when a phase prompt is selected
   */
  onSelectPhasePrompt?: (phasePrompt: PromptFragment, phaseId: string) => void;
  /**
   * Event handler for when a phase prompt is updated
   */
  onUpdatePhasePrompt?: (phaseId: string, promptId: string, newText: string, persistChange: boolean) => void;
  /**
   * Event handler for when a historical version is restored
   */
  onRestoreVersion?: (phaseId: string, promptId: string, historyEntry: HistoryLogEntry) => void;
  /**
   * Optional CSS class name for styling
   */
  className?: string;
}

/**
 * Component that displays phase prompts with tabs for each phase
 * @param props - Component props
 * @returns JSX.Element
 */
export function PhasePromptPanel({ 
  phasesConfig, 
  phasePromptsMap, 
  onSelectPhasePrompt, 
  onUpdatePhasePrompt, 
  onRestoreVersion, 
  className 
}: PhasePromptPanelProps): JSX.Element {
  const [activePhase, setActivePhase] = React.useState<string>(
    phasesConfig.phases.length > 0 ? phasesConfig.phases[0].id : ''
  );
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

  // Get current phase prompts data
  const currentPhasePrompts = phasePromptsMap[activePhase] || { prompts: [] };

  // Extract all unique tags from current phase prompts
  const allTags = React.useMemo(() => {
    const tagsSet = new Set<string>();
    currentPhasePrompts.prompts.forEach(prompt => {
      prompt.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }, [currentPhasePrompts]);

  // Filter phase prompts based on search term and selected tags
  const filteredPrompts = React.useMemo(() => {
    return currentPhasePrompts.prompts.filter(prompt => {
      // Filter by search term
      const matchesSearchTerm = searchTerm === '' || 
        prompt.text.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by selected tags
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => prompt.tags.includes(tag));
      
      return matchesSearchTerm && matchesTags;
    });
  }, [currentPhasePrompts, searchTerm, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prevTags => 
      prevTags.includes(tag) 
        ? prevTags.filter(t => t !== tag) 
        : [...prevTags, tag]
    );
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActivePhase(value);
    setSearchTerm('');
    setSelectedTags([]);
  };

  // Find current phase name
  const currentPhaseName = phasesConfig.phases.find(
    phase => phase.id === activePhase
  )?.name || 'Phase';

  return (
    <div className={`flex flex-col h-full border rounded-lg p-4 ${className || ''}`}>
      <h2 className="text-xl font-bold mb-4">Phase Prompts</h2>
      
      <Tabs 
        value={activePhase} 
        onValueChange={handleTabChange}
        className="w-full mb-4"
      >
        <TabsList className="w-full">
          {phasesConfig.phases.map(phase => (
            <TabsTrigger 
              key={phase.id} 
              value={phase.id}
              className="flex-1"
            >
              {phase.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {phasesConfig.phases.map(phase => (
          <TabsContent key={phase.id} value={phase.id} className="mt-2">
            <p className="text-sm text-muted-foreground mb-2">{phase.description}</p>
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="mb-4">
        <Input
          placeholder={`Search ${currentPhaseName} prompts...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-2"
        />
        
        <div className="flex flex-wrap gap-1 mb-2">
          {allTags.map(tag => (
            <Button
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleTag(tag)}
              className="text-xs"
            >
              {tag}
            </Button>
          ))}
        </div>
        
        <Separator className="my-2" />
      </div>
      
      <ScrollArea className="flex-grow">
        <div className="pr-4 space-y-2">
          {!activePhase ? (
            <p className="text-center text-muted-foreground p-4">No phase selected</p>
          ) : filteredPrompts.length === 0 ? (
            <p className="text-center text-muted-foreground p-4">No prompts found for this phase</p>
          ) : (
            filteredPrompts.map(prompt => (
              <PromptItem
                key={prompt.id}
                prompt={prompt}
                onSelect={(p) => onSelectPhasePrompt?.(p, activePhase)}
                onUpdate={(promptId, newText, persistChange) => 
                  onUpdatePhasePrompt?.(activePhase, promptId, newText, persistChange)
                }
                onRestoreVersion={(promptId, historyEntry) => 
                  onRestoreVersion?.(activePhase, promptId, historyEntry)
                }
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}