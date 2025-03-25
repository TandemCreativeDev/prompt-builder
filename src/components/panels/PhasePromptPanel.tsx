import React, { JSX } from "react";
import {
  PhasesConfig,
  PromptsData,
  PromptFragment,
  HistoryLogEntry,
} from "@/types/prompts";
import { PromptPanel } from "./PromptPanel";

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
  selectedPhasePromptId,
  className,
}: PhasePromptPanelProps): JSX.Element {
  const [activePhase, setActivePhase] = React.useState<string>(
    phasesConfig.length > 0 ? phasesConfig[0].id : ""
  );

  return (
    <PromptPanel
      type="Phase"
      prompts={[]} // Not used in phase mode
      selectedPromptIds={selectedPhasePromptId ? [selectedPhasePromptId] : []}
      selectionMode="single"
      className={className}
      phasesConfig={phasesConfig}
      phasePromptsMap={phasePromptsMap}
      activePhase={activePhase}
      onPhaseChange={setActivePhase}
      onSelectPhasePrompt={onSelectPhasePrompt}
      onUpdatePhasePrompt={onUpdatePhasePrompt}
      onRestorePhaseVersion={onRestoreVersion}
      onDeprecatePhasePrompt={onDeprecatePrompt}
      onCreatePhasePrompt={onCreatePrompt}
    />
  );
}
