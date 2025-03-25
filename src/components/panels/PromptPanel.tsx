import React, { JSX } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PromptsData, PromptFragment, HistoryLogEntry } from "@/types/prompts";
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
   * The type of prompt being displayed (used for title if not provided)
   */
  type: string;
}

/**
 * Component that displays a list of prompt fragments with filtering and editing capabilities
 * @param props - Component props
 * @returns JSX.Element
 */
export function PromptPanel({
  type,
  title,
  prompts,
  onSelectPrompt,
  onUpdatePrompt,
  onRestoreVersion,
  onDeprecatePrompt,
  onCreatePrompt,
  selectedPromptIds = [],
  className,
  selectionMode = "multiple",
}: PromptPanelProps): JSX.Element {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newPromptText, setNewPromptText] = React.useState("");
  const [newPromptTags, setNewPromptTags] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Extract all unique tags from prompts
  const allTags = React.useMemo(() => {
    const tagsSet = new Set<string>();
    if (prompts) {
      prompts.forEach((prompt) => {
        prompt.tags.forEach((tag) => tagsSet.add(tag));
      });
    }
    return Array.from(tagsSet);
  }, [prompts]);

  // Filter prompts based on search term and selected tags
  const filteredPrompts = React.useMemo(() => {
    if (!prompts) return [];

    return prompts.filter((prompt) => {
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
  }, [prompts, searchTerm, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const handleCreatePrompt = async () => {
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
  };

  const displayTitle = title || `${type} Prompts`;

  return (
    <div
      className={`flex flex-col h-full border rounded-lg p-4 ${
        className || ""
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{displayTitle}</h2>
        {onCreatePrompt && !isCreating && (
          <Button
            size="sm"
            onClick={() => setIsCreating(true)}
            variant="outline"
          >
            Add New
          </Button>
        )}
      </div>

      {isCreating && (
        <div className="mb-4 border rounded-md p-3 bg-muted/20">
          <h3 className="text-sm font-semibold mb-2">Create New Prompt</h3>
          <div className="space-y-2">
            <div>
              <label className="text-xs font-medium">Text:</label>
              <textarea
                className="w-full p-2 text-sm border rounded-md min-h-[80px]"
                value={newPromptText}
                onChange={(e) => setNewPromptText(e.target.value)}
                disabled={isSubmitting}
                placeholder={`Enter the ${type} prompt text...`}
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
          placeholder={`Search ${type} prompts...`}
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
                onSelect={onSelectPrompt}
                onUpdate={onUpdatePrompt}
                onRestoreVersion={onRestoreVersion}
                onDeprecate={onDeprecatePrompt}
                isSelected={selectedPromptIds.includes(prompt.id)}
                selectionMode={selectionMode}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
