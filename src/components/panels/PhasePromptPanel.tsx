import React, { JSX } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PhasesConfig,
  PhasePromptsData,
  PromptFragment,
  HistoryLogEntry,
} from "@/types/prompts";
import { PromptItem } from "./PromptItem";

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
  onUpdatePhasePrompt?: (
    phaseId: string,
    promptId: string,
    newText: string,
    persistChange: boolean
  ) => void;
  /**
   * Event handler for when a historical version is restored
   */
  onRestoreVersion?: (
    phaseId: string,
    promptId: string,
    historyEntry: HistoryLogEntry
  ) => void;
  /**
   * Event handler for when a phase prompt is deprecated (soft delete)
   */
  onDeprecatePrompt?: (promptId: string, phaseId: string) => Promise<boolean>;
  /**
   * Event handler for creating a new phase prompt
   */
  onCreatePrompt?: (
    phaseId: string,
    newPrompt: Omit<PromptFragment, "id" | "length" | "history_log">
  ) => Promise<boolean>;
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
  onDeprecatePrompt,
  onCreatePrompt,
  className,
}: PhasePromptPanelProps): JSX.Element {
  const [activePhase, setActivePhase] = React.useState<string>(
    phasesConfig.phases.length > 0 ? phasesConfig.phases[0].id : ""
  );
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newPromptText, setNewPromptText] = React.useState("");
  const [newPromptTags, setNewPromptTags] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Get current phase prompts data
  const currentPhasePrompts = React.useMemo(() => {
    // Check if the active phase exists in the map
    if (phasePromptsMap && activePhase && phasePromptsMap[activePhase]) {
      return phasePromptsMap[activePhase];
    }
    return { prompts: [] };
  }, [phasePromptsMap, activePhase]);

  // Extract all unique tags from current phase prompts
  const allTags = React.useMemo(() => {
    const tagsSet = new Set<string>();
    if (currentPhasePrompts && currentPhasePrompts.prompts) {
      currentPhasePrompts.prompts.forEach((prompt) => {
        prompt.tags.forEach((tag) => tagsSet.add(tag));
      });
    }
    return Array.from(tagsSet);
  }, [currentPhasePrompts]);

  // Filter phase prompts based on search term and selected tags
  const filteredPrompts = React.useMemo(() => {
    if (!currentPhasePrompts || !currentPhasePrompts.prompts) {
      return [];
    }

    return currentPhasePrompts.prompts.filter((prompt) => {
      // Filter out deprecated prompts
      if (prompt.deprecated) return false;

      // Filter by search term
      const matchesSearchTerm =
        searchTerm === "" ||
        prompt.text.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by selected tags
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => prompt.tags.includes(tag));

      return matchesSearchTerm && matchesTags;
    });
  }, [currentPhasePrompts, searchTerm, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const handleCreatePrompt = async () => {
    if (!onCreatePrompt || !newPromptText.trim() || !activePhase) return;

    setIsSubmitting(true);

    try {
      // Process tags from comma-separated string to array
      const tags = newPromptTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");

      const success = await onCreatePrompt(activePhase, {
        text: newPromptText,
        tags: tags,
        uses: 0,
        created_by: "user", // Default value
        ai_version_compatibility: ["gpt-4"], // Default value
        deprecated: false,
        phase_id: activePhase, // Set the phase id
      });

      if (success) {
        setNewPromptText("");
        setNewPromptTags("");
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Error creating phase prompt:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActivePhase(value);
    setSearchTerm("");
    setSelectedTags([]);

    // Reset create form if it's open
    if (isCreating) {
      setIsCreating(false);
      setNewPromptText("");
      setNewPromptTags("");
    }
  };

  // Find current phase name
  const currentPhaseName =
    phasesConfig.phases.find((phase) => phase.id === activePhase)?.name ||
    "Phase";

  return (
    <div
      className={`flex flex-col h-full border rounded-lg p-4 ${
        className || ""
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Phase Prompts</h2>
        {onCreatePrompt && !isCreating && activePhase && (
          <Button
            size="sm"
            onClick={() => setIsCreating(true)}
            variant="outline"
          >
            Add New
          </Button>
        )}
      </div>

      <Tabs
        value={activePhase}
        onValueChange={handleTabChange}
        className="w-full mb-4"
      >
        <TabsList className="w-full">
          {phasesConfig.phases.map((phase) => (
            <TabsTrigger key={phase.id} value={phase.id} className="flex-1">
              {phase.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {phasesConfig.phases.map((phase) => (
          <TabsContent key={phase.id} value={phase.id} className="mt-2">
            <p className="text-sm text-muted-foreground mb-2">
              {phase.description}
            </p>
          </TabsContent>
        ))}
      </Tabs>

      {isCreating && activePhase && (
        <div className="mb-4 border rounded-md p-3 bg-muted/20">
          <h3 className="text-sm font-semibold mb-2">
            Create New {currentPhaseName} Prompt
          </h3>
          <div className="space-y-2">
            <div>
              <label className="text-xs font-medium">Text:</label>
              <textarea
                className="w-full p-2 text-sm border rounded-md min-h-[80px]"
                value={newPromptText}
                onChange={(e) => setNewPromptText(e.target.value)}
                disabled={isSubmitting}
                placeholder={`Enter the ${currentPhaseName} prompt text...`}
              />
            </div>
            <div>
              <label className="text-xs font-medium">
                Tags (comma-separated):
              </label>
              <Input
                value={newPromptTags}
                onChange={(e) => setNewPromptTags(e.target.value)}
                disabled={isSubmitting}
                placeholder="e.g. custom, important, project1"
                className="text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreating(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreatePrompt}
                disabled={!newPromptText.trim() || isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <Input
          placeholder={`Search ${currentPhaseName} prompts...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-2"
        />

        <div className="flex flex-wrap gap-1 mb-2">
          {allTags.map((tag) => (
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

      <ScrollArea className="flex-grow overflow-auto">
        <div className="pr-4 space-y-2">
          {!activePhase ? (
            <p className="text-center text-muted-foreground p-4">
              No phase selected
            </p>
          ) : filteredPrompts.length === 0 ? (
            <p className="text-center text-muted-foreground p-4">
              No prompts found for this phase
            </p>
          ) : (
            filteredPrompts.map((prompt) => (
              <PromptItem
                key={prompt.id}
                prompt={prompt}
                onSelect={(p) => onSelectPhasePrompt?.(p, activePhase)}
                onUpdate={(promptId, newText, persistChange) =>
                  onUpdatePhasePrompt?.(
                    activePhase,
                    promptId,
                    newText,
                    persistChange
                  )
                }
                onRestoreVersion={(promptId, historyEntry) =>
                  onRestoreVersion?.(activePhase, promptId, historyEntry)
                }
                onDeprecate={(promptId) =>
                  onDeprecatePrompt?.(promptId, activePhase)
                }
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
