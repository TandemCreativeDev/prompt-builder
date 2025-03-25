import React, { useState, useEffect, KeyboardEvent, useRef, JSX } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PromptPanel } from "./panels/PromptPanel";
import { PhasePromptPanel } from "./panels/PhasePromptPanel";
import {
  PromptsData,
  PhasesConfig,
  PromptFragment,
  HistoryLogEntry,
} from "@/types/prompts";

/**
 * Props for the PromptBuilder component
 */
export interface PromptBuilderProps {
  /**
   * The prefixes data
   */
  prefixData: PromptsData;
  /**
   * The suffixes data
   */
  suffixData: PromptsData;
  /**
   * The phases configuration
   */
  phasesConfig: PhasesConfig;
  /**
   * Map of phase prompts by phase ID
   */
  phasePromptsMap: Record<string, PromptsData>;
  /**
   * Event handler for generating a prompt
   * @param tidy - Whether to tidy with AI before generating
   */
  onGenerate?: (tidy?: boolean) => void;
  /**
   * Event handler for when a prefix is selected
   */
  onSelectPrefix?: (prefix: PromptFragment) => void;
  /**
   * Event handler for when a suffix is selected
   */
  onSelectSuffix?: (suffix: PromptFragment) => void;
  /**
   * Event handler for when a phase prompt is selected
   */
  onSelectPhasePrompt?: (phasePrompt: PromptFragment, phaseId: string) => void;
  /**
   * Array of selected prefix IDs
   */
  selectedPrefixIds: string[];
  /**
   * Array of selected suffix IDs
   */
  selectedSuffixIds: string[];
  /**
   * The selected phase prompt ID
   */
  selectedPhasePromptId: string | null;
  /**
   * Array of selected prefix objects (for generating)
   */
  selectedPrefixes: PromptFragment[];
  /**
   * Array of selected suffix objects (for generating)
   */
  selectedSuffixes: PromptFragment[];
  /**
   * The selected phase prompt object (for generating)
   */
  selectedPhasePrompt: PromptFragment | null;
  /**
   * The main text input value
   */
  mainText: string;
  /**
   * Event handler for when the main text changes
   */
  onMainTextChange: (text: string) => void;
  /**
   * The generated prompt
   */
  generatedPrompt: string | null;
  /**
   * Event handler for updating a prefix
   */
  onUpdatePrefix?: (
    prefixId: string,
    newText: string,
    persistChange: boolean
  ) => void;
  /**
   * Event handler for updating a suffix
   */
  onUpdateSuffix?: (
    suffixId: string,
    newText: string,
    persistChange: boolean
  ) => void;
  /**
   * Event handler for updating a phase prompt
   */
  onUpdatePhasePrompt?: (
    phaseId: string,
    promptId: string,
    newText: string,
    persistChange: boolean
  ) => void;
  /**
   * Event handler for restoring a prefix to a previous version
   */
  onRestorePrefix?: (prefixId: string, historyEntry: HistoryLogEntry) => void;
  /**
   * Event handler for restoring a suffix to a previous version
   */
  onRestoreSuffix?: (suffixId: string, historyEntry: HistoryLogEntry) => void;
  /**
   * Event handler for restoring a phase prompt to a previous version
   */
  onRestorePhasePrompt?: (
    phaseId: string,
    promptId: string,
    historyEntry: HistoryLogEntry
  ) => void;
  /**
   * Event handler for deprecating a prefix
   */
  onDeprecatePrefix?: (prefixId: string) => Promise<boolean>;
  /**
   * Event handler for deprecating a suffix
   */
  onDeprecateSuffix?: (suffixId: string) => Promise<boolean>;
  /**
   * Event handler for deprecating a phase prompt
   */
  onDeprecatePhasePrompt?: (
    promptId: string,
    phaseId: string
  ) => Promise<boolean>;
  /**
   * Event handler for creating a new prefix
   */
  onCreatePrefix?: (
    newPrompt: Omit<PromptFragment, "id" | "length" | "history_log">
  ) => Promise<boolean>;
  /**
   * Event handler for creating a new suffix
   */
  onCreateSuffix?: (
    newPrompt: Omit<PromptFragment, "id" | "length" | "history_log">
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
 * Component that displays the Prompt Builder UI
 * @param props - Component props
 * @returns JSX.Element
 */
export function PromptBuilder({
  prefixData,
  suffixData,
  phasesConfig,
  phasePromptsMap,
  onGenerate,
  onSelectPrefix,
  onSelectSuffix,
  onSelectPhasePrompt,
  selectedPrefixIds,
  selectedSuffixIds,
  selectedPhasePromptId,
  selectedPrefixes,
  selectedSuffixes,
  mainText,
  onMainTextChange,
  generatedPrompt,
  onUpdatePrefix,
  onUpdateSuffix,
  onUpdatePhasePrompt,
  onRestorePrefix,
  onRestoreSuffix,
  onRestorePhasePrompt,
  onDeprecatePrefix,
  onDeprecateSuffix,
  onDeprecatePhasePrompt,
  onCreatePrefix,
  onCreateSuffix,
  onCreatePhasePrompt,
}: PromptBuilderProps): JSX.Element {
  // Track if generated prompt is visible
  const [showGenerated, setShowGenerated] = useState<boolean>(false);

  // Update the showGenerated state when generatedPrompt changes
  useEffect(() => {
    setShowGenerated(generatedPrompt !== null);
  }, [generatedPrompt]);

  // Reference to the textarea
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Dropdown state
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownType, setDropdownType] = useState<
    "all" | "phase" | "prefix" | "suffix"
  >("all");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Handle keyboard shortcuts
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Generate prompt shortcuts
    if (event.ctrlKey && event.key === "Enter") {
      event.preventDefault();
      onGenerate?.(false); // Regular generate without tidying
    } else if (event.ctrlKey && event.key === "t") {
      event.preventDefault();
      onGenerate?.(true); // Generate with AI tidying
    }

    // Handle dropdown triggers at the start of a line
    else if (
      event.currentTarget.selectionStart === 0 ||
      event.currentTarget.value.charAt(
        event.currentTarget.selectionStart - 1
      ) === "\n"
    ) {
      const handleDropdownTrigger = (
        type: "all" | "phase" | "prefix" | "suffix"
      ) => {
        event.preventDefault();

        // Calculate position for the dropdown based on cursor position
        if (textareaRef.current) {
          // Get cursor position
          const cursorPosition = textareaRef.current.selectionStart;
          const text = textareaRef.current.value.substring(0, cursorPosition);
          const lines = text.split("\n");
          const currentLineIndex = lines.length - 1;

          // Approximate the position based on line and character counts
          // This is simplified and might need adjustment based on font size, etc.
          const lineHeight = 24; // approximate line height in pixels
          const charWidth = 8; // approximate character width in pixels

          setDropdownPosition({
            top: currentLineIndex * lineHeight + 30, // Add some offset
            left: lines[currentLineIndex].length * charWidth + 10, // Add some offset
          });
        }

        setDropdownType(type);
        setShowDropdown(true);
      };

      if (event.key === "/") {
        handleDropdownTrigger("all");
      } else if (event.key === "#") {
        handleDropdownTrigger("phase");
      } else if (event.key === "$") {
        handleDropdownTrigger("prefix");
      } else if (event.key === "@") {
        handleDropdownTrigger("suffix");
      }
    }
  };

  // Handle selecting an item from the dropdown
  const handleDropdownSelect = (
    item: PromptFragment,
    type: "phase" | "prefix" | "suffix",
    phaseId?: string
  ) => {
    setShowDropdown(false);

    if (type === "prefix" && onSelectPrefix) {
      onSelectPrefix(item);
    } else if (type === "suffix" && onSelectSuffix) {
      onSelectSuffix(item);
    } else if (type === "phase" && onSelectPhasePrompt && phaseId) {
      onSelectPhasePrompt(item, phaseId);
    }
  };

  // Helper function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col w-full h-full gap-4">
      {/* Top half - Phase Prompt Panel */}
      <div
        className={`grid ${
          showGenerated ? "grid-cols-2 gap-4" : "grid-cols-1"
        }`}
      >
        <div className="h-[40vh] w-full overflow-hidden">
          <PhasePromptPanel
            phasesConfig={phasesConfig}
            phasePromptsMap={phasePromptsMap}
            onSelectPhasePrompt={onSelectPhasePrompt}
            onUpdatePhasePrompt={onUpdatePhasePrompt}
            onRestoreVersion={onRestorePhasePrompt}
            onDeprecatePrompt={onDeprecatePhasePrompt}
            onCreatePrompt={onCreatePhasePrompt}
            selectedPhasePromptId={selectedPhasePromptId ?? undefined}
            className="h-full overflow-auto"
          />
        </div>

        {showGenerated && (
          <Card className="h-full row-span-1">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Generated Prompt</h3>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(generatedPrompt || "")}
                  size="sm"
                >
                  Copy
                </Button>
              </div>
              <ScrollArea className="h-[calc(100%-40px)]">
                <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm">
                  {generatedPrompt}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons - Centered */}
      <div className="flex justify-center gap-4 py-4">
        <Button
          variant="default"
          className="px-6"
          onClick={() => onGenerate?.(false)}
        >
          Generate (Ctrl+Enter)
        </Button>
        <Button
          variant="secondary"
          className="px-6"
          onClick={() => onGenerate?.(true)}
        >
          Tidy with AI and Generate (Ctrl+T+Enter)
        </Button>
      </div>

      {/* Bottom Panels - Three Columns */}
      <div className="grid grid-cols-3 gap-4 h-[40vh] ">
        {/* Left Panel - Prefix */}
        <Card className="h-full">
          <CardContent className="p-4 h-full">
            <div className="mb-2">
              {selectedPrefixes.length > 0 && (
                <div className="bg-muted p-2 rounded-md text-sm mb-2">
                  <p className="font-medium">
                    Selected Prefixes ({selectedPrefixes.length}):
                  </p>
                  {selectedPrefixes.map((prefix) => (
                    <p key={prefix.id} className="truncate">
                      {prefix.text.substring(0, 50)}...
                    </p>
                  ))}
                </div>
              )}
            </div>
            <div className="h-[35vh] w-full overflow-hidden">
              <PromptPanel
                type="Prefix"
                prompts={prefixData}
                onSelectPrompt={onSelectPrefix}
                onUpdatePrompt={onUpdatePrefix}
                onRestoreVersion={onRestorePrefix}
                onDeprecatePrompt={onDeprecatePrefix}
                onCreatePrompt={onCreatePrefix}
                selectedPromptIds={selectedPrefixIds}
                className="h-full overflow-auto"
              />
            </div>
          </CardContent>
        </Card>

        {/* Center Panel - Main Text */}
        <Card className="h-full overflow-hidden">
          <CardContent className="p-4 h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Main Text</h2>
            <div className="flex-grow relative">
              <textarea
                ref={textareaRef}
                className="w-full h-full min-h-[200px] p-2 border rounded-md resize-none"
                placeholder="Type your prompt here... Use keyboard shortcuts: / for general options, # for phase prompts, $ for prefixes, @ for suffixes"
                value={mainText}
                onChange={(e) => onMainTextChange(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              {/* Shortcut Dropdown */}
              {showDropdown && (
                <div
                  className="absolute z-10 bg-white dark:bg-gray-800 border shadow-lg rounded-md p-2 w-64"
                  style={{
                    top: `${dropdownPosition.top}px`,
                    left: `${dropdownPosition.left}px`,
                  }}
                >
                  <div className="mb-2 px-2 py-1 bg-muted rounded-sm text-sm font-medium">
                    {dropdownType === "all" && "All Prompts"}
                    {dropdownType === "prefix" && "Prefixes"}
                    {dropdownType === "suffix" && "Suffixes"}
                    {dropdownType === "phase" && "Phase Prompts"}
                  </div>

                  <ScrollArea className="h-[200px]">
                    {dropdownType === "prefix" &&
                      prefixData
                        .filter((prefix) => !prefix.deprecated)
                        .map((prefix) => (
                          <button
                            key={prefix.id}
                            className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded-sm mb-1 truncate"
                            onClick={() =>
                              handleDropdownSelect(prefix, "prefix")
                            }
                          >
                            {prefix.text.substring(0, 40)}...
                          </button>
                        ))}

                    {dropdownType === "suffix" &&
                      suffixData
                        .filter((suffix) => !suffix.deprecated)
                        .map((suffix) => (
                          <button
                            key={suffix.id}
                            className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded-sm mb-1 truncate"
                            onClick={() =>
                              handleDropdownSelect(suffix, "suffix")
                            }
                          >
                            {suffix.text.substring(0, 40)}...
                          </button>
                        ))}

                    {(dropdownType === "phase" || dropdownType === "all") &&
                      phasesConfig.map((phase) => (
                        <div key={phase.id} className="mb-2">
                          <div className="px-2 py-1 bg-secondary/20 text-xs font-medium">
                            {phase.name}
                          </div>
                          {phasePromptsMap[phase.id]
                            .filter((prompt) => !prompt.deprecated)
                            .map((prompt) => (
                              <button
                                key={prompt.id}
                                className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded-sm mb-1 truncate"
                                onClick={() =>
                                  handleDropdownSelect(
                                    prompt,
                                    "phase",
                                    phase.id
                                  )
                                }
                              >
                                {prompt.text.substring(0, 40)}...
                              </button>
                            ))}
                        </div>
                      ))}

                    {dropdownType === "all" && (
                      <>
                        <div className="px-2 py-1 bg-secondary/20 text-xs font-medium mt-2">
                          Prefixes
                        </div>
                        {prefixData
                          .filter((prefix) => !prefix.deprecated)
                          .slice(0, 3) // Limit shown items
                          .map((prefix) => (
                            <button
                              key={prefix.id}
                              className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded-sm mb-1 truncate"
                              onClick={() =>
                                handleDropdownSelect(prefix, "prefix")
                              }
                            >
                              {prefix.text.substring(0, 40)}...
                            </button>
                          ))}

                        <div className="px-2 py-1 bg-secondary/20 text-xs font-medium mt-2">
                          Suffixes
                        </div>
                        {suffixData
                          .filter((suffix) => !suffix.deprecated)
                          .slice(0, 3) // Limit shown items
                          .map((suffix) => (
                            <button
                              key={suffix.id}
                              className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded-sm mb-1 truncate"
                              onClick={() =>
                                handleDropdownSelect(suffix, "suffix")
                              }
                            >
                              {suffix.text.substring(0, 40)}...
                            </button>
                          ))}
                      </>
                    )}

                    {/* No results message */}
                    {((dropdownType === "prefix" &&
                      prefixData.filter((p) => !p.deprecated).length === 0) ||
                      (dropdownType === "suffix" &&
                        suffixData.filter((s) => !s.deprecated).length === 0) ||
                      (dropdownType === "phase" &&
                        Object.values(phasePromptsMap).every(
                          (p) =>
                            p.filter((prompt) => !prompt.deprecated).length ===
                            0
                        ))) && (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        No prompts available
                      </div>
                    )}
                  </ScrollArea>

                  <div className="mt-2 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDropdown(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Suffix */}
        <Card className="h-full">
          <CardContent className="p-4 h-full">
            <div className="mb-2">
              {selectedSuffixes.length > 0 && (
                <div className="bg-muted p-2 rounded-md text-sm mb-2">
                  <p className="font-medium">
                    Selected Suffixes ({selectedSuffixes.length}):
                  </p>
                  {selectedSuffixes.map((suffix) => (
                    <p key={suffix.id} className="truncate">
                      {suffix.text.substring(0, 50)}...
                    </p>
                  ))}
                </div>
              )}
            </div>
            <div className="h-[35vh] w-full overflow-hidden">
              <PromptPanel
                type="Suffix"
                prompts={suffixData}
                onSelectPrompt={onSelectSuffix}
                onUpdatePrompt={onUpdateSuffix}
                onRestoreVersion={onRestoreSuffix}
                onDeprecatePrompt={onDeprecateSuffix}
                onCreatePrompt={onCreateSuffix}
                selectedPromptIds={selectedSuffixIds}
                className="h-full overflow-auto"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
