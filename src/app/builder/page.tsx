"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { PromptBuilder } from "@/components/PromptBuilder";
import {
  PrefixesData,
  SuffixesData,
  PhasesConfig,
  PhasePromptsData,
  PromptFragment,
} from "@/types/prompts";

/**
 * Page component for the Prompt Builder
 */
export default function PromptBuilderPage() {
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

  // State for selected prompt fragments
  const [selectedPrefix, setSelectedPrefix] = useState<PromptFragment | null>(
    null
  );
  const [selectedSuffix, setSelectedSuffix] = useState<PromptFragment | null>(
    null
  );
  const [selectedPhasePrompt, setSelectedPhasePrompt] =
    useState<PromptFragment | null>(null);
  const [mainText, setMainText] = useState<string>("");
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);

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
    setSelectedPrefix(prefix);
    toast.info(`Selected prefix: ${prefix.id}`);
  };

  const handleSelectSuffix = (suffix: PromptFragment) => {
    setSelectedSuffix(suffix);
    toast.info(`Selected suffix: ${suffix.id}`);
  };

  const handleSelectPhasePrompt = (
    phasePrompt: PromptFragment,
    phaseId: string
  ) => {
    setSelectedPhasePrompt(phasePrompt);
    toast.info(
      `Selected phase prompt: ${phasePrompt.id} for phase: ${phaseId}`
    );
  };

  const handleMainTextChange = (text: string) => {
    setMainText(text);
  };

  const handleGeneratePrompt = () => {
    // Very basic prompt assembly - will be expanded later
    const prefixText = selectedPrefix ? selectedPrefix.text : "";
    const phaseText = selectedPhasePrompt ? selectedPhasePrompt.text : "";
    const suffixText = selectedSuffix ? selectedSuffix.text : "";

    const assembled = [prefixText, phaseText, mainText, suffixText]
      .filter(Boolean)
      .join("\n\n");

    setGeneratedPrompt(assembled);
    toast.success("Prompt generated!");
  };

  const handleTidyAndGenerate = async () => {
    if (!mainText || mainText.trim() === "") {
      toast.error("Please enter some text to tidy");
      return;
    }

    try {
      // Show loading toast
      toast.loading("Tidying text with AI...");

      // Call the OpenAI API via our backend
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mainText: mainText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to tidy text with AI");
      }

      const data = await response.json();

      // Update the main text with the refined version
      setMainText(data.refinedText);
      toast.success("Text tidied successfully!");

      // Generate the prompt with the refined text
      const prefixText = selectedPrefix ? selectedPrefix.text : "";
      const phaseText = selectedPhasePrompt ? selectedPhasePrompt.text : "";
      const suffixText = selectedSuffix ? selectedSuffix.text : "";

      const assembled = [prefixText, phaseText, data.refinedText, suffixText]
        .filter(Boolean)
        .join("\n\n");

      setGeneratedPrompt(assembled);
    } catch (error) {
      console.error("Error tidying text:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to tidy text with AI"
      );
    } finally {
      toast.dismiss();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Prompt Builder...</h1>
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
            Error Loading Prompt Builder
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

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <Toaster />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Prompt Builder</h1>
        <a
          href="/store"
          className="px-3 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 text-sm"
        >
          Go to Prompt Store
        </a>
      </div>

      <div className="h-[calc(100vh-150px)]">
        <PromptBuilder
          prefixesData={prefixesData}
          suffixesData={suffixesData}
          phasesConfig={phasesConfig}
          phasePromptsMap={phasePromptsMap}
          onSelectPrefix={handleSelectPrefix}
          onSelectSuffix={handleSelectSuffix}
          onSelectPhasePrompt={handleSelectPhasePrompt}
          selectedPrefix={selectedPrefix}
          selectedSuffix={selectedSuffix}
          selectedPhasePrompt={selectedPhasePrompt}
          mainText={mainText}
          onMainTextChange={handleMainTextChange}
          generatedPrompt={generatedPrompt}
          onGenerate={handleGeneratePrompt}
          onTidyAndGenerate={handleTidyAndGenerate}
        />
      </div>
    </div>
  );
}
