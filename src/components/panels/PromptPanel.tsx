import React, { JSX } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PromptsData,
  PromptFragment,
  HistoryLogEntry,
  PhasesConfig,
} from "@/types/prompts";
import { PromptItem } from "./PromptItem";

/**
 * Base props for prompt panels
 */
export interface BasePromptPanelProps {
  /**
   * The prompt data to display
   */
  prompts: PromptsData;
  /**
   * Event handler for when a prompt is selected
   */
  onSelectPrompt?: (prompt: PromptFragment) => void;
  /**
   * Event handler for when a prompt is updated
   */
  onUpdatePrompt?: (
    promptId: string,
    newText: string,
    persistChange: boolean
  ) => void;
  /**
   * Event handler for when a historical version is restored
   */
  onRestoreVersion?: (promptId: string, historyEntry: HistoryLogEntry) => void;
  /**
   * Event handler for when a prompt is deprecated (soft delete)
   */
  onDeprecatePrompt?: (promptId: string) => Promise<boolean>;
  /**
   * Event handler for creating a new prompt
   */
  onCreatePrompt?: (
    newPrompt: Omit<PromptFragment, "id" | "length" | "history_log">
  ) => Promise<boolean>;
  /**
   * Array of selected prompt IDs
   */
  selectedPromptIds?: string[];
  /**
   * Optional CSS class name for styling
   */
  className?: string;
  /**
   * Panel title
   */
  title?: string;
  /**
   * The selection mode for prompt items
   */
  selectionMode?: "single" | "multiple";
}

/**
 * Props for the PromptPanel component
 */
export interface PromptPanelProps extends BasePromptPanelProps {
  /**
   * The type of prompt being displayed (used for placeholder text and labels)
   */
  type: string;
  /**
   * Phases configuration data, required when isPhase is true
   */
  phasesConfig?: PhasesConfig;
  /**
   * Map of phase prompts data by phase ID, required when isPhase is true
   */
  phasePromptsMap?: Record<string, PromptsData>;
  /**
   * Active phase ID, required when isPhase is true
   */
  activePhase?: string;
  /**
   * Event handler for when a phase changes, required when isPhase is true
   */
  onPhaseChange?: (phaseId: string) => void;
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
   * Event handler for when a phase prompt's historical version is restored
   */
  onRestorePhaseVersion?: (
    phaseId: string,
    promptId: string,
    historyEntry: HistoryLogEntry
  ) => void;
  /**
   * Event handler for when a phase prompt is deprecated
   */
  onDeprecatePhasePrompt?: (
    promptId: string,
    phaseId: string
  ) => Promise<boolean>;
  /**
   * Event handler for creating a new phase prompt
   */
  onCreatePhasePrompt?: (
    phaseId: string,
    newPrompt: Omit<PromptFragment, "id" | "length" | "history_log">
  ) => Promise<boolean>;
}

/**
 * Component that displays a list of prompt fragments with filtering and editing capabilities.
 * Can also display phase-specific prompts with tab navigation.
 * @param props - Component props
 * @returns JSX.Element
 */
export function PromptPanel({
  type,
  prompts,
  onSelectPrompt,
  onUpdatePrompt,
  onRestoreVersion,
  onDeprecatePrompt,
  onCreatePrompt,
  selectedPromptIds = [],
  className,
  selectionMode = "multiple",
  phasesConfig = [],
  phasePromptsMap = {},
  activePhase = "",
  onPhaseChange,
  onSelectPhasePrompt,
  onUpdatePhasePrompt,
  onRestorePhaseVersion,
  onDeprecatePhasePrompt,
  onCreatePhasePrompt,
}: PromptPanelProps): JSX.Element {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newPromptText, setNewPromptText] = React.useState("");
  const [newPromptTags, setNewPromptTags] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isPhase = type === "Phase";

  // Get the actual prompts to display based on whether this is a phase panel
  const currentPrompts = React.useMemo(() => {
    if (isPhase && activePhase && phasePromptsMap[activePhase]) {
      return phasePromptsMap[activePhase];
    }
    return prompts;
  }, [isPhase, activePhase, phasePromptsMap, prompts]);

  // Get current phase info if in phase mode
  const currentPhase =
    isPhase && activePhase
      ? phasesConfig.find((phase) => phase.id === activePhase)
      : null;

  // Extract all unique tags from prompts
  const allTags = React.useMemo(() => {
    const tagsSet = new Set<string>();
    if (currentPrompts) {
      currentPrompts.forEach((prompt) => {
        prompt.tags.forEach((tag) => tagsSet.add(tag));
      });
    }
    return Array.from(tagsSet);
  }, [currentPrompts]);

  // Filter prompts based on search term and selected tags
  const filteredPrompts = React.useMemo(() => {
    if (!currentPrompts) return [];

    return currentPrompts.filter((prompt) => {
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
  }, [currentPrompts, searchTerm, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  // Handle phase tab change
  const handlePhaseChange = (value: string) => {
    if (onPhaseChange) {
      onPhaseChange(value);

      // Reset state when changing phase
      setSearchTerm("");
      setSelectedTags([]);
      if (isCreating) {
        setIsCreating(false);
        setNewPromptText("");
        setNewPromptTags("");
      }
    }
  };

  // Handle regular vs phase prompt creation
  const handleCreatePrompt = async () => {
    if (isPhase) {
      // Phase prompt creation
      if (!onCreatePhasePrompt || !newPromptText.trim() || !activePhase) return;

      setIsSubmitting(true);

      try {
        // Process tags from comma-separated string to array
        const tags = newPromptTags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "");

        const success = await onCreatePhasePrompt(activePhase, {
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
    } else {
      // Regular prompt creation
      if (!onCreatePrompt || !newPromptText.trim()) return;

      setIsSubmitting(true);

      try {
        // Process tags from comma-separated string to array
        const tags = newPromptTags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "");

        const success = await onCreatePrompt({
          text: newPromptText,
          tags: tags,
          uses: 0,
          created_by: "user", // Default value
          ai_version_compatibility: ["gpt-4"], // Default value
          deprecated: false,
        });

        if (success) {
          setNewPromptText("");
          setNewPromptTags("");
          setIsCreating(false);
        }
      } catch (error) {
        console.error("Error creating prompt:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Create adapter functions to handle phase vs regular prompt operations
  const handleSelect = (prompt: PromptFragment) => {
    if (isPhase && onSelectPhasePrompt && activePhase) {
      onSelectPhasePrompt(prompt, activePhase);
    } else if (onSelectPrompt) {
      onSelectPrompt(prompt);
    }
  };

  const handleUpdate = (
    promptId: string,
    newText: string,
    persistChange: boolean
  ) => {
    if (isPhase && onUpdatePhasePrompt && activePhase) {
      onUpdatePhasePrompt(activePhase, promptId, newText, persistChange);
    } else if (onUpdatePrompt) {
      onUpdatePrompt(promptId, newText, persistChange);
    }
  };

  const handleRestore = (promptId: string, historyEntry: HistoryLogEntry) => {
    if (isPhase && onRestorePhaseVersion && activePhase) {
      onRestorePhaseVersion(activePhase, promptId, historyEntry);
    } else if (onRestoreVersion) {
      onRestoreVersion(promptId, historyEntry);
    }
  };

  const handleDeprecate = async (promptId: string) => {
    if (isPhase && onDeprecatePhasePrompt && activePhase) {
      return await onDeprecatePhasePrompt(promptId, activePhase);
    } else if (onDeprecatePrompt) {
      return await onDeprecatePrompt(promptId);
    }
    return false;
  };

  // Determine if we have create functionality
  const hasCreateFunctionality = isPhase
    ? !!onCreatePhasePrompt
    : !!onCreatePrompt;

  // Determine the placeholder text for the prompt creation
  const promptPlaceholder =
    isPhase && currentPhase
      ? `Enter the ${currentPhase.name} prompt text...`
      : `Enter the ${type} prompt text...`;

  // Determine the search placeholder
  const searchPlaceholder =
    isPhase && currentPhase
      ? `Search ${currentPhase.name} prompts...`
      : `Search ${type} prompts...`;

  return (
    <div
      className={`flex flex-col h-full border rounded-lg p-4 ${
        className || ""
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{type} Prompts</h2>
        {hasCreateFunctionality && !isCreating && (!isPhase || activePhase) && (
          <Button
            size="sm"
            onClick={() => setIsCreating(true)}
            variant="outline"
          >
            Add New
          </Button>
        )}
      </div>

      {isPhase && (
        <Tabs
          value={activePhase}
          onValueChange={handlePhaseChange}
          className="w-full mb-4"
        >
          <TabsList className="w-full">
            {phasesConfig.map((phase) => (
              <TabsTrigger key={phase.id} value={phase.id} className="flex-1">
                {phase.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {isCreating && (!isPhase || activePhase) && (
        <div className="mb-4 border rounded-md p-3 bg-muted/20">
          <h3 className="text-sm font-semibold mb-2">
            Create New {isPhase && currentPhase ? currentPhase.name : type}{" "}
            Prompt
          </h3>
          <div className="space-y-2">
            <div>
              <label className="text-xs font-medium">Text:</label>
              <textarea
                className="w-full p-2 text-sm border rounded-md min-h-[80px]"
                value={newPromptText}
                onChange={(e) => setNewPromptText(e.target.value)}
                disabled={isSubmitting}
                placeholder={promptPlaceholder}
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

      {(!isPhase || activePhase) && (
        <>
          <div className="mb-4">
            <Input
              placeholder={searchPlaceholder}
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
              {filteredPrompts.length === 0 ? (
                <p className="text-center text-muted-foreground p-4">
                  No prompts found
                </p>
              ) : (
                filteredPrompts.map((prompt) => (
                  <PromptItem
                    key={prompt.id}
                    prompt={prompt}
                    onSelect={handleSelect}
                    onUpdate={handleUpdate}
                    onRestoreVersion={handleRestore}
                    onDeprecate={handleDeprecate}
                    isSelected={selectedPromptIds.includes(prompt.id)}
                    selectionMode={selectionMode}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}
