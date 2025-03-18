import React, { JSX } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SuffixesData, PromptFragment, HistoryLogEntry } from "@/types/prompts";
import { PromptItem } from "./PromptItem";

/**
 * Props for the SuffixPanel component
 */
export interface SuffixPanelProps {
  /**
   * The suffixes data to display
   */
  suffixes: SuffixesData;
  /**
   * Event handler for when a suffix is selected
   */
  onSelectSuffix?: (suffix: PromptFragment) => void;
  /**
   * Event handler for when a suffix is updated
   */
  onUpdateSuffix?: (
    suffixId: string,
    newText: string,
    persistChange: boolean
  ) => void;
  /**
   * Event handler for when a historical version is restored
   */
  onRestoreVersion?: (suffixId: string, historyEntry: HistoryLogEntry) => void;
  /**
   * Event handler for when a suffix is deprecated (soft delete)
   */
  onDeprecatePrompt?: (suffixId: string) => Promise<boolean>;
  /**
   * Event handler for creating a new suffix
   */
  onCreatePrompt?: (newPrompt: Omit<PromptFragment, "id" | "length" | "history_log">) => Promise<boolean>;
  /**
   * Optional CSS class name for styling
   */
  className?: string;
}

/**
 * Component that displays a list of suffix prompts with filtering and editing capabilities
 * @param props - Component props
 * @returns JSX.Element
 */
export function SuffixPanel({
  suffixes,
  onSelectSuffix,
  onUpdateSuffix,
  onRestoreVersion,
  onDeprecatePrompt,
  onCreatePrompt,
  className,
}: SuffixPanelProps): JSX.Element {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newPromptText, setNewPromptText] = React.useState("");
  const [newPromptTags, setNewPromptTags] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Extract all unique tags from suffixes
  const allTags = React.useMemo(() => {
    const tagsSet = new Set<string>();
    if (suffixes?.suffixes) {
      suffixes.suffixes.forEach((suffix) => {
        suffix.tags.forEach((tag) => tagsSet.add(tag));
      });
    }
    return Array.from(tagsSet);
  }, [suffixes]);

  // Filter suffixes based on search term and selected tags
  const filteredSuffixes = React.useMemo(() => {
    if (!suffixes?.suffixes) return [];
    
    return suffixes.suffixes.filter((suffix) => {
      // Filter out deprecated prompts
      if (suffix.deprecated) return false;

      // Filter by search term
      const matchesSearchTerm =
        searchTerm === "" ||
        suffix.text.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by selected tags
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => suffix.tags.includes(tag));

      return matchesSearchTerm && matchesTags;
    });
  }, [suffixes, searchTerm, selectedTags]);

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
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
      
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
      console.error("Error creating suffix:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`flex flex-col h-full border rounded-lg p-4 ${
        className || ""
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Suffix Prompts</h2>
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
          <h3 className="text-sm font-semibold mb-2">Create New Suffix</h3>
          <div className="space-y-2">
            <div>
              <label className="text-xs font-medium">Text:</label>
              <textarea
                className="w-full p-2 text-sm border rounded-md min-h-[80px]"
                value={newPromptText}
                onChange={(e) => setNewPromptText(e.target.value)}
                disabled={isSubmitting}
                placeholder="Enter the suffix prompt text..."
              />
            </div>
            <div>
              <label className="text-xs font-medium">Tags (comma-separated):</label>
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
          placeholder="Search suffixes..."
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

      <ScrollArea className="flex-grow">
        <div className="pr-4 space-y-2">
          {filteredSuffixes.length === 0 ? (
            <p className="text-center text-muted-foreground p-4">
              No suffixes found
            </p>
          ) : (
            filteredSuffixes.map((suffix) => (
              <PromptItem
                key={suffix.id}
                prompt={suffix}
                onSelect={onSelectSuffix}
                onUpdate={onUpdateSuffix}
                onRestoreVersion={onRestoreVersion}
                onDeprecate={onDeprecatePrompt}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
