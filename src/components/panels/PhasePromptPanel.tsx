import React, { JSX } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PhasesConfig,
  PromptsData,
  PromptFragment,
  HistoryLogEntry,
} from "@/types/prompts";
import { BasePromptPanelProps, PromptPanel } from "./PromptPanel";

/**
 * Props for the PhasePromptPanel component
 */
export interface PhasePromptPanelProps
  extends Omit<
    BasePromptPanelProps,
    | "prompts"
    | "onSelectPrompt"
    | "onUpdatePrompt"
    | "onRestoreVersion"
    | "onDeprecatePrompt"
    | "onCreatePrompt"
    | "selectedPromptIds"
  > {
  /**
   * The phases configuration data
   */
  phasesConfig: PhasesConfig;
  /**
   * Map of phase prompts data by phase ID
   */
  phasePromptsMap: Record<string, PromptsData>;
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
   * Selected phase prompt ID for the current active phase
   */
  selectedPhasePromptId?: string;
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
  selectedPhasePromptId,
  className,
}: PhasePromptPanelProps): JSX.Element {
  const [activePhase, setActivePhase] = React.useState<string>(
    phasesConfig.length > 0 ? phasesConfig[0].id : ""
  );

  // Get current phase prompts data
  const currentPhasePrompts = React.useMemo(() => {
    // Check if the active phase exists in the map
    if (phasePromptsMap && activePhase && phasePromptsMap[activePhase]) {
      return phasePromptsMap[activePhase];
    }
    return [];
  }, [phasePromptsMap, activePhase]);

  // Find current phase info
  const currentPhase = phasesConfig.find((phase) => phase.id === activePhase);
  const currentPhaseName = currentPhase?.name || "Phase";

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActivePhase(value);
  };

  // Map handlers to work with the base PromptPanel
  const handleSelectPrompt = (prompt: PromptFragment) => {
    onSelectPhasePrompt?.(prompt, activePhase);
  };

  const handleUpdatePrompt = (
    promptId: string,
    newText: string,
    persistChange: boolean
  ) => {
    onUpdatePhasePrompt?.(activePhase, promptId, newText, persistChange);
  };

  const handleRestoreVersion = (
    promptId: string,
    historyEntry: HistoryLogEntry
  ) => {
    onRestoreVersion?.(activePhase, promptId, historyEntry);
  };

  const handleDeprecatePrompt = async (promptId: string) => {
    if (onDeprecatePrompt) {
      return await onDeprecatePrompt(promptId, activePhase);
    }
    return false;
  };

  const handleCreatePrompt = async (
    newPrompt: Omit<PromptFragment, "id" | "length" | "history_log">
  ) => {
    if (onCreatePrompt && activePhase) {
      return await onCreatePrompt(activePhase, {
        ...newPrompt,
        phase_id: activePhase, // Ensure the phase ID is set
      });
    }
    return false;
  };

  return (
    <div
      className={`flex flex-col h-full border rounded-lg p-4 ${
        className || ""
      }`}
    >
      <div className="flex flex-col h-full">
        <h2 className="text-xl font-bold mb-4">Phase Prompts</h2>

        <Tabs
          value={activePhase}
          onValueChange={handleTabChange}
          className="w-full mb-4"
        >
          <TabsList className="w-full">
            {phasesConfig.map((phase) => (
              <TabsTrigger key={phase.id} value={phase.id} className="flex-1">
                {phase.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {phasesConfig.map((phase) => (
            <TabsContent key={phase.id} value={phase.id} className="mt-2">
              <p className="text-sm text-muted-foreground mb-2">
                {phase.description}
              </p>
            </TabsContent>
          ))}
        </Tabs>

        {/* Use the base PromptPanel component with phase-specific props */}
        {activePhase && (
          <PromptPanel
            type="Phase"
            title={`${currentPhaseName} Prompts`}
            prompts={currentPhasePrompts}
            onSelectPrompt={handleSelectPrompt}
            onUpdatePrompt={handleUpdatePrompt}
            onRestoreVersion={handleRestoreVersion}
            onDeprecatePrompt={handleDeprecatePrompt}
            onCreatePrompt={handleCreatePrompt}
            selectedPromptIds={
              selectedPhasePromptId ? [selectedPhasePromptId] : []
            }
            selectionMode="single"
            className="flex-grow border-none p-0"
          />
        )}
      </div>
    </div>
  );
}
