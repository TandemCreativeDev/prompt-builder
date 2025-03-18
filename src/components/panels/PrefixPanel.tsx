import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PrefixesData, PromptFragment, HistoryLogEntry } from "@/types/prompts";
import { PromptItem } from './PromptItem';

/**
 * Props for the PrefixPanel component
 */
export interface PrefixPanelProps {
  /**
   * The prefixes data to display
   */
  prefixes: PrefixesData;
  /**
   * Event handler for when a prefix is selected
   */
  onSelectPrefix?: (prefix: PromptFragment) => void;
  /**
   * Event handler for when a prefix is updated
   */
  onUpdatePrefix?: (prefixId: string, newText: string, persistChange: boolean) => void;
  /**
   * Event handler for when a historical version is restored
   */
  onRestoreVersion?: (prefixId: string, historyEntry: HistoryLogEntry) => void;
  /**
   * Optional CSS class name for styling
   */
  className?: string;
}

/**
 * Component that displays a list of prefix prompts with filtering and editing capabilities
 * @param props - Component props
 * @returns JSX.Element
 */
export function PrefixPanel({ 
  prefixes, 
  onSelectPrefix, 
  onUpdatePrefix, 
  onRestoreVersion, 
  className 
}: PrefixPanelProps): JSX.Element {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  
  // Extract all unique tags from prefixes
  const allTags = React.useMemo(() => {
    const tagsSet = new Set<string>();
    prefixes.prefixes.forEach(prefix => {
      prefix.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }, [prefixes]);

  // Filter prefixes based on search term and selected tags
  const filteredPrefixes = React.useMemo(() => {
    return prefixes.prefixes.filter(prefix => {
      // Filter by search term
      const matchesSearchTerm = searchTerm === '' || 
        prefix.text.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by selected tags
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => prefix.tags.includes(tag));
      
      return matchesSearchTerm && matchesTags;
    });
  }, [prefixes, searchTerm, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prevTags => 
      prevTags.includes(tag) 
        ? prevTags.filter(t => t !== tag) 
        : [...prevTags, tag]
    );
  };

  return (
    <div className={`flex flex-col h-full border rounded-lg p-4 ${className || ''}`}>
      <h2 className="text-xl font-bold mb-4">Prefix Prompts</h2>
      
      <div className="mb-4">
        <Input
          placeholder="Search prefixes..."
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
          {filteredPrefixes.length === 0 ? (
            <p className="text-center text-muted-foreground p-4">No prefixes found</p>
          ) : (
            filteredPrefixes.map(prefix => (
              <PromptItem
                key={prefix.id}
                prompt={prefix}
                onSelect={onSelectPrefix}
                onUpdate={onUpdatePrefix}
                onRestoreVersion={onRestoreVersion}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}