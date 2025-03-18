import React, { JSX } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  PrefixesData,
  SuffixesData,
  PhasesConfig,
  PhasePromptsData,
  PromptFragment,
  HistoryLogEntry,
} from "@/types/prompts";
import { PrefixPanel } from "./panels/PrefixPanel";
import { SuffixPanel } from "./panels/SuffixPanel";
import { PhasePromptPanel } from "./panels/PhasePromptPanel";

/**
 * Props for the PromptStore component
 */
export interface PromptStoreProps {
  /**
   * The prefixes data
   */
  prefixesData: PrefixesData;
  /**
   * The suffixes data
   */
  suffixesData: SuffixesData;
  /**
   * The phases configuration
   */
  phasesConfig: PhasesConfig;
  /**
   * Map of phase prompts by phase ID
   */
  phasePromptsMap: Record<string, PhasePromptsData>;
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
   * Event handler for updating a prefix
   */
  onUpdatePrefix?: (
    prefixId: string,
    newText: string,
    persistChange: boolean
  ) => Promise<boolean>;
  /**
   * Event handler for updating a suffix
   */
  onUpdateSuffix?: (
    suffixId: string,
    newText: string,
    persistChange: boolean
  ) => Promise<boolean>;
  /**
   * Event handler for updating a phase prompt
   */
  onUpdatePhasePrompt?: (
    phaseId: string,
    promptId: string,
    newText: string,
    persistChange: boolean
  ) => Promise<boolean>;
  /**
   * Event handler for deprecating a prompt
   */
  onDeprecatePrompt?: (
    promptId: string,
    promptType: "prefix" | "suffix" | "phase",
    phaseId?: string
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
 * Component that displays the Prompt Store with tabs for different prompt types
 * @param props - Component props
 * @returns JSX.Element
 */
export function PromptStore({
  prefixesData,
  suffixesData,
  phasesConfig,
  phasePromptsMap,
  onSelectPrefix,
  onSelectSuffix,
  onSelectPhasePrompt,
  onUpdatePrefix,
  onUpdateSuffix,
  onUpdatePhasePrompt,
  onDeprecatePrompt,
  onCreatePrefix,
  onCreateSuffix,
  onCreatePhasePrompt,
}: PromptStoreProps): JSX.Element {
  const [activeTab, setActiveTab] = React.useState("prefixes");

  // Handlers for prefix updates
  const handleUpdatePrefix = async (
    prefixId: string,
    newText: string,
    persistChange: boolean
  ) => {
    try {
      if (onUpdatePrefix) {
        const success = await onUpdatePrefix(prefixId, newText, persistChange);
        if (success) {
          toast.success(
            persistChange
              ? "Prefix updated and persisted"
              : "Prefix updated for the current session"
          );
          return;
        }
      }
      toast.error("Failed to update prefix");
    } catch (error) {
      console.error("Error updating prefix:", error);
      toast.error("Error updating prefix");
    }
  };

  // Handler for restoring a prefix version
  const handleRestorePrefixVersion = async (
    prefixId: string,
    historyEntry: HistoryLogEntry
  ) => {
    try {
      if (onUpdatePrefix) {
        const success = await onUpdatePrefix(prefixId, historyEntry.text, true);
        if (success) {
          toast.success("Restored previous version of prefix");
          return;
        }
      }
      toast.error("Failed to restore prefix version");
    } catch (error) {
      console.error("Error restoring prefix version:", error);
      toast.error("Error restoring prefix version");
    }
  };

  // Handlers for suffix updates
  const handleUpdateSuffix = async (
    suffixId: string,
    newText: string,
    persistChange: boolean
  ) => {
    try {
      if (onUpdateSuffix) {
        const success = await onUpdateSuffix(suffixId, newText, persistChange);
        if (success) {
          toast.success(
            persistChange
              ? "Suffix updated and persisted"
              : "Suffix updated for the current session"
          );
          return;
        }
      }
      toast.error("Failed to update suffix");
    } catch (error) {
      console.error("Error updating suffix:", error);
      toast.error("Error updating suffix");
    }
  };

  // Handler for restoring a suffix version
  const handleRestoreSuffixVersion = async (
    suffixId: string,
    historyEntry: HistoryLogEntry
  ) => {
    try {
      if (onUpdateSuffix) {
        const success = await onUpdateSuffix(suffixId, historyEntry.text, true);
        if (success) {
          toast.success("Restored previous version of suffix");
          return;
        }
      }
      toast.error("Failed to restore suffix version");
    } catch (error) {
      console.error("Error restoring suffix version:", error);
      toast.error("Error restoring suffix version");
    }
  };

  // Handlers for phase prompt updates
  const handleUpdatePhasePrompt = async (
    phaseId: string,
    promptId: string,
    newText: string,
    persistChange: boolean
  ) => {
    try {
      if (onUpdatePhasePrompt) {
        const success = await onUpdatePhasePrompt(
          phaseId,
          promptId,
          newText,
          persistChange
        );
        if (success) {
          toast.success(
            persistChange
              ? "Phase prompt updated and persisted"
              : "Phase prompt updated for the current session"
          );
          return;
        }
      }
      toast.error("Failed to update phase prompt");
    } catch (error) {
      console.error("Error updating phase prompt:", error);
      toast.error("Error updating phase prompt");
    }
  };

  // Handler for restoring a phase prompt version
  const handleRestorePhasePromptVersion = async (
    phaseId: string,
    promptId: string,
    historyEntry: HistoryLogEntry
  ) => {
    try {
      if (onUpdatePhasePrompt) {
        const success = await onUpdatePhasePrompt(
          phaseId,
          promptId,
          historyEntry.text,
          true
        );
        if (success) {
          toast.success("Restored previous version of phase prompt");
          return;
        }
      }
      toast.error("Failed to restore phase prompt version");
    } catch (error) {
      console.error("Error restoring phase prompt version:", error);
      toast.error("Error restoring phase prompt version");
    }
  };

  // Handler for deprecating prompts
  const handleDeprecatePrompt = async (
    promptId: string,
    promptType: "prefix" | "suffix" | "phase",
    phaseId?: string
  ) => {
    try {
      if (onDeprecatePrompt) {
        const success = await onDeprecatePrompt(promptId, promptType, phaseId);
        if (success) {
          toast.success(
            `${
              promptType.charAt(0).toUpperCase() + promptType.slice(1)
            } prompt deprecated successfully`
          );
          return true;
        }
      }
      toast.error(`Failed to deprecate ${promptType} prompt`);
      return false;
    } catch (error) {
      console.error(`Error deprecating ${promptType} prompt:`, error);
      toast.error(`Error deprecating ${promptType} prompt`);
      return false;
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full h-full"
      >
        <TabsList className="w-full mb-4">
          <TabsTrigger value="prefixes" className="flex-1">
            Prefixes
          </TabsTrigger>
          <TabsTrigger value="suffixes" className="flex-1">
            Suffixes
          </TabsTrigger>
          <TabsTrigger value="phasePrompts" className="flex-1">
            Phase Prompts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prefixes" className="h-[calc(100%-50px)]">
          <PrefixPanel
            prefixes={prefixesData}
            onSelectPrefix={onSelectPrefix}
            onUpdatePrefix={handleUpdatePrefix}
            onRestoreVersion={handleRestorePrefixVersion}
            onDeprecatePrompt={(promptId) =>
              handleDeprecatePrompt(promptId, "prefix")
            }
            onCreatePrompt={onCreatePrefix}
            className="h-full"
          />
        </TabsContent>

        <TabsContent value="suffixes" className="h-[calc(100%-50px)]">
          <SuffixPanel
            suffixes={suffixesData}
            onSelectSuffix={onSelectSuffix}
            onUpdateSuffix={handleUpdateSuffix}
            onRestoreVersion={handleRestoreSuffixVersion}
            onDeprecatePrompt={(promptId) =>
              handleDeprecatePrompt(promptId, "suffix")
            }
            onCreatePrompt={onCreateSuffix}
            className="h-full"
          />
        </TabsContent>

        <TabsContent value="phasePrompts" className="h-[calc(100%-50px)]">
          <PhasePromptPanel
            phasesConfig={phasesConfig}
            phasePromptsMap={phasePromptsMap}
            onSelectPhasePrompt={onSelectPhasePrompt}
            onUpdatePhasePrompt={handleUpdatePhasePrompt}
            onRestoreVersion={handleRestorePhasePromptVersion}
            onDeprecatePrompt={(promptId, phaseId) =>
              handleDeprecatePrompt(promptId, "phase", phaseId)
            }
            onCreatePrompt={onCreatePhasePrompt}
            className="h-full"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
