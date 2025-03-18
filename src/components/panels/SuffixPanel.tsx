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
  className,
}: SuffixPanelProps): JSX.Element {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

  // Extract all unique tags from suffixes
  const allTags = React.useMemo(() => {
    const tagsSet = new Set<string>();
    suffixes.suffixes.forEach((suffix) => {
      suffix.tags.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }, [suffixes]);

  // Filter suffixes based on search term and selected tags
  const filteredSuffixes = React.useMemo(() => {
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

  return (
    <div
      className={`flex flex-col h-full border rounded-lg p-4 ${
        className || ""
      }`}
    >
      <h2 className="text-xl font-bold mb-4">Suffix Prompts</h2>

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
