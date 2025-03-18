"use client";

import React, { useEffect, useState } from "react";
import { PromptStore } from "@/components/PromptStore";
import {
  PrefixesData,
  SuffixesData,
  PhasesConfig,
  PhasePromptsData,
  PromptFragment,
} from "@/types/prompts";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

/**
 * Page component for the Prompt Store
 */
export default function PromptStorePage() {
  const [prefixesData, setPrefixesData] = useState<PrefixesData>({
    prefixes: [],
  });
  const [suffixesData, setSuffixesData] = useState<SuffixesData>({
    suffixes: [],
  });
  const [phasesConfig, setPhasesConfig] = useState<PhasesConfig>({
    phases: [],
  });
  const [phasePromptsMap, setPhasePromptsMap] = useState<
    Record<string, PhasePromptsData>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch prefixes
        const prefixesResponse = await fetch("/api/prompts/prefixes");
        if (!prefixesResponse.ok) {
          throw new Error("Failed to fetch prefixes");
        }
        const prefixesData = await prefixesResponse.json();
        setPrefixesData(prefixesData);

        // Fetch suffixes
        const suffixesResponse = await fetch("/api/prompts/suffixes");
        if (!suffixesResponse.ok) {
          throw new Error("Failed to fetch suffixes");
        }
        const suffixesData = await suffixesResponse.json();
        setSuffixesData(suffixesData);

        // Fetch phases configuration
        const phasesResponse = await fetch("/api/prompts/phases");
        if (!phasesResponse.ok) {
          throw new Error("Failed to fetch phases");
        }
        const phasesData = await phasesResponse.json();
        setPhasesConfig(phasesData);

        // Fetch phase prompts for each phase
        const phasePromptsMap: Record<string, PhasePromptsData> = {};
        await Promise.all(
          phasesData.phases.map(async (phase: { id: string | number }) => {
            const phasePromptResponse = await fetch(
              `/api/prompts/phases/${phase.id}`
            );
            if (phasePromptResponse.ok) {
              const phasePromptData = await phasePromptResponse.json();
              phasePromptsMap[phase.id] = phasePromptData;
            }
          })
        );
        setPhasePromptsMap(phasePromptsMap);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectPrefix = (prefix: PromptFragment) => {
    toast.info(`Selected prefix: ${prefix.id}`);
    // In a real app, you would update your main builder state here
  };

  const handleSelectSuffix = (suffix: PromptFragment) => {
    toast.info(`Selected suffix: ${suffix.id}`);
    // In a real app, you would update your main builder state here
  };

  const handleSelectPhasePrompt = (
    phasePrompt: PromptFragment,
    phaseId: string
  ) => {
    toast.info(
      `Selected phase prompt: ${phasePrompt.id} for phase: ${phaseId}`
    );
    // In a real app, you would update your main builder state here
  };

  const handleUpdatePrefix = async (
    prefixId: string,
    newText: string,
    persistChange: boolean
  ): Promise<boolean> => {
    try {
      // For session-only updates, just update the local state
      if (!persistChange) {
        setPrefixesData((prev) => ({
          prefixes: prev.prefixes.map((prefix) =>
            prefix.id === prefixId ? { ...prefix, text: newText } : prefix
          ),
        }));
        return true;
      }

      // For persisted updates, call the API
      const response = await fetch("/api/prompts/prefixes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newText, id: prefixId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update prefix");
      }

      // Update local state
      setPrefixesData((prev) => ({
        prefixes: prev.prefixes.map((prefix) =>
          prefix.id === prefixId ? { ...prefix, text: newText } : prefix
        ),
      }));

      return true;
    } catch (error) {
      console.error("Error updating prefix:", error);
      return false;
    }
  };

  const handleUpdateSuffix = async (
    suffixId: string,
    newText: string,
    persistChange: boolean
  ): Promise<boolean> => {
    try {
      // For session-only updates, just update the local state
      if (!persistChange) {
        setSuffixesData((prev) => ({
          suffixes: prev.suffixes.map((suffix) =>
            suffix.id === suffixId ? { ...suffix, text: newText } : suffix
          ),
        }));
        return true;
      }

      // For persisted updates, call the API
      const response = await fetch("/api/prompts/suffixes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newText, id: suffixId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update suffix");
      }

      // Update local state
      setSuffixesData((prev) => ({
        suffixes: prev.suffixes.map((suffix) =>
          suffix.id === suffixId ? { ...suffix, text: newText } : suffix
        ),
      }));

      return true;
    } catch (error) {
      console.error("Error updating suffix:", error);
      return false;
    }
  };

  const handleUpdatePhasePrompt = async (
    phaseId: string,
    promptId: string,
    newText: string,
    persistChange: boolean
  ): Promise<boolean> => {
    try {
      // For session-only updates, just update the local state
      if (!persistChange) {
        setPhasePromptsMap((prev) => {
          const phasePrompts = prev[phaseId];
          if (!phasePrompts) return prev;

          return {
            ...prev,
            [phaseId]: {
              prompts: phasePrompts.prompts.map((prompt) =>
                prompt.id === promptId ? { ...prompt, text: newText } : prompt
              ),
            },
          };
        });
        return true;
      }

      // For persisted updates, call the API
      const response = await fetch(`/api/prompts/phases/${phaseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newText, id: promptId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update phase prompt");
      }

      // Update local state
      setPhasePromptsMap((prev) => {
        const phasePrompts = prev[phaseId];
        if (!phasePrompts) return prev;

        return {
          ...prev,
          [phaseId]: {
            prompts: phasePrompts.prompts.map((prompt) =>
              prompt.id === promptId ? { ...prompt, text: newText } : prompt
            ),
          },
        };
      });

      return true;
    } catch (error) {
      console.error("Error updating phase prompt:", error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Prompt Store...</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Error Loading Prompt Store
          </h1>
          <p className="text-destructive">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleDeprecatePrompt = async (
    promptId: string,
    promptType: "prefix" | "suffix" | "phase",
    phaseId?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/prompts/deprecate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ promptId, promptType, phaseId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to deprecate ${promptType} prompt`);
      }

      // Update local state based on prompt type
      if (promptType === "prefix") {
        setPrefixesData((prev) => ({
          prefixes: prev.prefixes.map((prefix) =>
            prefix.id === promptId ? { ...prefix, deprecated: true } : prefix
          ),
        }));
      } else if (promptType === "suffix") {
        setSuffixesData((prev) => ({
          suffixes: prev.suffixes.map((suffix) =>
            suffix.id === promptId ? { ...suffix, deprecated: true } : suffix
          ),
        }));
      } else if (promptType === "phase" && phaseId) {
        setPhasePromptsMap((prev) => {
          const phasePrompts = prev[phaseId];
          if (!phasePrompts) return prev;

          return {
            ...prev,
            [phaseId]: {
              prompts: phasePrompts.prompts.map((prompt) =>
                prompt.id === promptId
                  ? { ...prompt, deprecated: true }
                  : prompt
              ),
            },
          };
        });
      }

      return true;
    } catch (error) {
      console.error(`Error deprecating ${promptType} prompt:`, error);
      return false;
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <Toaster />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Prompt Store</h1>
        <a
          href="/builder"
          className="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm"
        >
          Go to Prompt Builder
        </a>
      </div>
      <PromptStore
        prefixesData={prefixesData}
        suffixesData={suffixesData}
        phasesConfig={phasesConfig}
        phasePromptsMap={phasePromptsMap}
        onSelectPrefix={handleSelectPrefix}
        onSelectSuffix={handleSelectSuffix}
        onSelectPhasePrompt={handleSelectPhasePrompt}
        onUpdatePrefix={handleUpdatePrefix}
        onUpdateSuffix={handleUpdateSuffix}
        onUpdatePhasePrompt={handleUpdatePhasePrompt}
        onDeprecatePrompt={handleDeprecatePrompt}
      />
    </div>
  );
}
