"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { PromptBuilder } from "@/components/PromptBuilder";
import {
  PromptsData,
  PhasesConfig,
  PromptFragment,
  HistoryLogEntry,
} from "@/types/prompts";

/**
 * Page component for the Prompt Builder
 */
export default function PromptBuilderPage() {
  const [prefixesData, setPrefixesData] = useState<PromptsData>([]);
  const [suffixesData, setSuffixesData] = useState<PromptsData>([]);
  const [phasesConfig, setPhasesConfig] = useState<PhasesConfig>([]);
  const [phasePromptsMap, setPhasePromptsMap] = useState<
    Record<string, PromptsData>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for selected prompt fragments
  const [selectedPrefixIds, setSelectedPrefixIds] = useState<string[]>([]);
  const [selectedSuffixIds, setSelectedSuffixIds] = useState<string[]>([]);
  const [selectedPhasePromptId, setSelectedPhasePromptId] = useState<
    string | null
  >(null);

  // We still need to keep track of the actual prompt objects for generating
  const [selectedPrefixes, setSelectedPrefixes] = useState<PromptFragment[]>(
    []
  );
  const [selectedSuffixes, setSelectedSuffixes] = useState<PromptFragment[]>(
    []
  );
  const [selectedPhasePrompt, setSelectedPhasePrompt] =
    useState<PromptFragment | null>(null);
  const [mainText, setMainText] = useState<string>("");
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);

  // Function to fetch all data - reusable for initial load and refreshes
  const fetchAllData = async () => {
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
      const phasePromptsMap: Record<string, PromptsData> = {};
      await Promise.all(
        phasesData.map(async (phase: { id: string | number }) => {
          const phasePromptResponse = await fetch(
            `/api/prompts/phases/${phase.id}`
          );
          if (phasePromptResponse.ok) {
            const phasePromptData = await phasePromptResponse.json();
            phasePromptsMap[phase.id] = phasePromptData;
          }
        })
      );
      // Use spread to create a new object reference to ensure React detects the change
      setPhasePromptsMap({ ...phasePromptsMap });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Prefix handlers
  const handleSelectPrefix = (prefix: PromptFragment) => {
    // Toggle selection
    if (selectedPrefixIds.includes(prefix.id)) {
      // Remove from selection
      setSelectedPrefixIds((prev) => prev.filter((id) => id !== prefix.id));
      setSelectedPrefixes((prev) => prev.filter((p) => p.id !== prefix.id));
      toast.info(`Unselected prefix: ${prefix.id}`);
    } else {
      // Add to selection
      setSelectedPrefixIds((prev) => [...prev, prefix.id]);
      setSelectedPrefixes((prev) => [...prev, prefix]);
      toast.info(`Selected prefix: ${prefix.id}`);
    }
  };

  const handleUpdatePrefix = async (
    prefixId: string,
    newText: string,
    persistChange: boolean
  ) => {
    try {
      // If persistChange is false, we just want to update the UI temporarily
      if (!persistChange) {
        // Make a defensive copy of the data first
        if (!prefixesData) {
          toast.error("Prefix data is not available");
          return;
        }

        // Find and update the prefix in the local state
        const updatedPrefixes = prefixesData.map((prefix) =>
          prefix.id === prefixId
            ? { ...prefix, text: newText, length: newText.length }
            : prefix
        );
        setPrefixesData(updatedPrefixes);

        // Update the selected prefix if it's the one being edited
        const selectedPrefix = selectedPrefixes.find((p) => p.id === prefixId);
        if (selectedPrefix) {
          setSelectedPrefixes((prev) =>
            prev.map((p) =>
              p.id === prefixId
                ? {
                    ...p,
                    text: newText,
                    length: newText.length,
                  }
                : p
            )
          );
        }

        toast.success("Prefix updated (session only)");
        return;
      }

      const response = await fetch(`/api/prompts/prefixes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: prefixId,
          text: newText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update prefix");
      }

      // Immediately update the local state defensively
      setPrefixesData((prevData) => {
        if (!Array.isArray(prevData)) return prevData;

        return prevData.map((prefix) =>
          prefix.id === prefixId
            ? { ...prefix, text: newText, length: newText.length }
            : prefix
        );
      });

      // Update the selected prefixes if the edited one is selected
      if (selectedPrefixIds.includes(prefixId)) {
        setSelectedPrefixes((prev) =>
          prev.map((p) =>
            p.id === prefixId
              ? { ...p, text: newText, length: newText.length }
              : p
          )
        );
      }

      toast.success("Prefix updated successfully!");

      // Schedule a refresh of all data to ensure everything is in sync
      setTimeout(() => {
        fetchAllData();
      }, 300);
    } catch (error) {
      console.error("Error updating prefix:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update prefix"
      );
    }
  };

  const handleRestorePrefix = async (
    prefixId: string,
    historyEntry: HistoryLogEntry
  ) => {
    try {
      // Call the API to update the prefix with the historical text
      const response = await fetch(`/api/prompts/prefixes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: prefixId,
          text: historyEntry.text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to restore prefix version");
      }

      // Update local state with the response
      const updatedPrefixesData = await response.json();
      setPrefixesData(updatedPrefixesData);

      // Update the selected prefixes if the restored one is included
      const isSelectedPrefix = selectedPrefixes.some(
        (prefix) => prefix.id === prefixId
      );
      if (isSelectedPrefix) {
        const updatedPrefix = updatedPrefixesData.prefixes.find(
          (p: PromptFragment) => p.id === prefixId
        );
        if (updatedPrefix) {
          setSelectedPrefixes((prev) =>
            prev.map((p) => (p.id === prefixId ? updatedPrefix : p))
          );
        }
      }

      toast.success("Prefix restored to previous version!");
    } catch (error) {
      console.error("Error restoring prefix version:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to restore prefix version"
      );
    }
  };

  const handleDeprecatePrefix = async (prefixId: string) => {
    try {
      // Call the API to deprecate the prefix
      const response = await fetch(`/api/prompts/deprecate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promptId: prefixId,
          filename: "prefixes",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to deprecate prefix");
      }

      // Refresh the prefixes
      const prefixesResponse = await fetch("/api/prompts/prefixes");
      if (!prefixesResponse.ok) {
        throw new Error("Failed to refresh prefixes after deprecation");
      }
      const updatedPrefixesData = await prefixesResponse.json();
      setPrefixesData(updatedPrefixesData);

      // Clear the deprecated prefix from selection if it's selected
      if (selectedPrefixIds.includes(prefixId)) {
        setSelectedPrefixIds((prev) => prev.filter((id) => id !== prefixId));
        setSelectedPrefixes((prev) => prev.filter((p) => p.id !== prefixId));
      }

      toast.success("Prefix deprecated successfully!");
      return true;
    } catch (error) {
      console.error("Error deprecating prefix:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to deprecate prefix"
      );
      return false;
    }
  };

  // Suffix handlers
  const handleSelectSuffix = (suffix: PromptFragment) => {
    // Toggle selection
    if (selectedSuffixIds.includes(suffix.id)) {
      // Remove from selection
      setSelectedSuffixIds((prev) => prev.filter((id) => id !== suffix.id));
      setSelectedSuffixes((prev) => prev.filter((s) => s.id !== suffix.id));
      toast.info(`Unselected suffix: ${suffix.id}`);
    } else {
      // Add to selection
      setSelectedSuffixIds((prev) => [...prev, suffix.id]);
      setSelectedSuffixes((prev) => [...prev, suffix]);
      toast.info(`Selected suffix: ${suffix.id}`);
    }
  };

  const handleUpdateSuffix = async (
    suffixId: string,
    newText: string,
    persistChange: boolean
  ) => {
    try {
      // If persistChange is false, we just want to update the UI temporarily
      if (!persistChange) {
        // Make a defensive copy of the data first
        if (!suffixesData) {
          toast.error("Suffix data is not available");
          return;
        }

        // Find and update the suffix in the local state
        const updatedSuffixes = suffixesData.map((suffix) =>
          suffix.id === suffixId
            ? { ...suffix, text: newText, length: newText.length }
            : suffix
        );
        setSuffixesData(updatedSuffixes);

        // Update the selected suffix if it's the one being edited
        if (selectedSuffixes.some((suffix) => suffix.id === suffixId)) {
          setSelectedSuffixes((prevSuffixes) =>
            prevSuffixes.map((suffix) =>
              suffix.id === suffixId
                ? { ...suffix, text: newText, length: newText.length }
                : suffix
            )
          );
        }

        toast.success("Suffix updated (session only)");
        return;
      }

      const response = await fetch(`/api/prompts/suffixes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: suffixId,
          text: newText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update suffix");
      }

      // Immediately update the local state defensively
      setSuffixesData((prevData) => {
        if (!Array.isArray(prevData)) return prevData;

        return prevData.map((suffix) =>
          suffix.id === suffixId
            ? { ...suffix, text: newText, length: newText.length }
            : suffix
        );
      });

      // Update the selected suffixes if the edited one is selected
      if (selectedSuffixIds.includes(suffixId)) {
        setSelectedSuffixes((prev) =>
          prev.map((s) =>
            s.id === suffixId
              ? { ...s, text: newText, length: newText.length }
              : s
          )
        );
      }

      toast.success("Suffix updated successfully!");

      // Schedule a refresh of all data to ensure everything is in sync
      setTimeout(() => {
        fetchAllData();
      }, 300);
    } catch (error) {
      console.error("Error updating suffix:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update suffix"
      );
    }
  };

  const handleRestoreSuffix = async (
    suffixId: string,
    historyEntry: HistoryLogEntry
  ) => {
    try {
      // Call the API to update the suffix with the historical text
      const response = await fetch(`/api/prompts/suffixes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: suffixId,
          text: historyEntry.text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to restore suffix version");
      }

      // Update local state defensively
      setSuffixesData((prevData) => {
        if (!Array.isArray(prevData)) return prevData;

        return prevData.map((suffix) =>
          suffix.id === suffixId
            ? {
                ...suffix,
                text: historyEntry.text,
                length: historyEntry.text.length,
              }
            : suffix
        );
      });

      // Update the selected suffix if it's the one being restored
      if (selectedSuffixes.some((suffix) => suffix.id === suffixId)) {
        setSelectedSuffixes((prevSuffixes) =>
          prevSuffixes.map((suffix) =>
            suffix.id === suffixId
              ? {
                  ...suffix,
                  text: historyEntry.text,
                  length: historyEntry.text.length,
                }
              : suffix
          )
        );
      }

      toast.success("Suffix restored to previous version!");

      // Schedule a refresh of all data to ensure everything is in sync
      setTimeout(() => {
        fetchAllData();
      }, 300);
    } catch (error) {
      console.error("Error restoring suffix version:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to restore suffix version"
      );
    }
  };

  const handleDeprecateSuffix = async (suffixId: string) => {
    try {
      // Call the API to deprecate the suffix
      const response = await fetch(`/api/prompts/deprecate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promptId: suffixId,
          filename: "suffixes",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to deprecate suffix");
      }

      // Refresh the suffixes
      const suffixesResponse = await fetch("/api/prompts/suffixes");
      if (!suffixesResponse.ok) {
        throw new Error("Failed to refresh suffixes after deprecation");
      }
      const updatedSuffixesData = await suffixesResponse.json();
      setSuffixesData(updatedSuffixesData);

      // Clear the deprecated suffix from selection if it's selected
      if (selectedSuffixIds.includes(suffixId)) {
        setSelectedSuffixIds((prev) => prev.filter((id) => id !== suffixId));
        setSelectedSuffixes((prev) => prev.filter((s) => s.id !== suffixId));
      }

      toast.success("Suffix deprecated successfully!");
      return true;
    } catch (error) {
      console.error("Error deprecating suffix:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to deprecate suffix"
      );
      return false;
    }
  };

  // Phase prompts handlers
  const handleSelectPhasePrompt = (
    phasePrompt: PromptFragment,
    phaseId: string
  ) => {
    // For phase prompts, we use radio-button style selection (only one can be selected)
    if (selectedPhasePromptId === phasePrompt.id) {
      // Deselect if already selected
      setSelectedPhasePromptId(null);
      setSelectedPhasePrompt(null);
      toast.info(`Unselected phase prompt: ${phasePrompt.id}`);
    } else {
      // Select the new phase prompt (replacing any previously selected one)
      setSelectedPhasePromptId(phasePrompt.id);
      setSelectedPhasePrompt(phasePrompt);
      toast.info(
        `Selected phase prompt: ${phasePrompt.id} for phase: ${phaseId}`
      );
    }
  };

  const handleUpdatePhasePrompt = async (
    phaseId: string,
    promptId: string,
    newText: string,
    persistChange: boolean
  ) => {
    try {
      // If persistChange is false, we just want to update the UI temporarily
      if (!persistChange) {
        // Make a deep copy of the phase prompts map to update
        const updatedPhasePromptsMap = { ...phasePromptsMap };

        // Find the phase and update the prompt - with null checks
        if (updatedPhasePromptsMap[phaseId]) {
          const updatedPrompts = updatedPhasePromptsMap[phaseId].map((prompt) =>
            prompt.id === promptId
              ? { ...prompt, text: newText, length: newText.length }
              : prompt
          );
          updatedPhasePromptsMap[phaseId] = updatedPrompts;
        }

        setPhasePromptsMap(updatedPhasePromptsMap);

        // Update the selected phase prompt if it's the one being edited
        if (selectedPhasePrompt && selectedPhasePrompt.id === promptId) {
          setSelectedPhasePrompt({
            ...selectedPhasePrompt,
            text: newText,
            length: newText.length,
          });
        }

        toast.success("Phase prompt updated (session only)");
        return;
      }

      const response = await fetch(`/api/prompts/phases/${phaseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: promptId,
          text: newText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update phase prompt");
      }

      // Apply immediate defensive state update
      setPhasePromptsMap((prevMap) => {
        if (!prevMap || !prevMap[phaseId]) {
          return prevMap;
        }

        const updatedMap = { ...prevMap };
        updatedMap[phaseId] = updatedMap[phaseId].map((prompt) =>
          prompt.id === promptId
            ? { ...prompt, text: newText, length: newText.length }
            : prompt
        );

        return updatedMap;
      });

      // Update the selected phase prompt if it's the one being edited
      if (selectedPhasePrompt && selectedPhasePrompt.id === promptId) {
        setSelectedPhasePrompt({
          ...selectedPhasePrompt,
          text: newText,
          length: newText.length,
        });
      }

      toast.success("Phase prompt updated successfully!");

      // Schedule a refresh of all data to ensure everything is in sync
      setTimeout(() => {
        fetchAllData();
      }, 300);
    } catch (error) {
      console.error("Error updating phase prompt:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update phase prompt"
      );
    }
  };

  const handleRestorePhasePrompt = async (
    phaseId: string,
    promptId: string,
    historyEntry: HistoryLogEntry
  ) => {
    try {
      // Call the API to update the phase prompt with the historical text
      const response = await fetch(`/api/prompts/phases/${phaseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: promptId,
          text: historyEntry.text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to restore phase prompt version"
        );
      }

      // Update local state with the response
      const updatedPhasePrompts = await response.json();

      // Update the phase prompts map
      setPhasePromptsMap({
        ...phasePromptsMap,
        [phaseId]: updatedPhasePrompts,
      });

      // Update the selected phase prompt if it's the one being restored
      if (selectedPhasePrompt && selectedPhasePrompt.id === promptId) {
        const updatedPrompt = updatedPhasePrompts.prompts.find(
          (p: PromptFragment) => p.id === promptId
        );
        if (updatedPrompt) {
          setSelectedPhasePrompt(updatedPrompt);
        }
      }

      toast.success("Phase prompt restored to previous version!");
    } catch (error) {
      console.error("Error restoring phase prompt version:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to restore phase prompt version"
      );
    }
  };

  const handleDeprecatePhasePrompt = async (
    promptId: string,
    phaseId: string
  ) => {
    try {
      // Call the API to deprecate the phase prompt
      const response = await fetch(`/api/prompts/deprecate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promptId: promptId,
          filename: `phases/${phaseId}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to deprecate phase prompt");
      }

      // Refresh the phase prompts
      const phasePromptResponse = await fetch(`/api/prompts/phases/${phaseId}`);
      if (!phasePromptResponse.ok) {
        throw new Error("Failed to refresh phase prompts after deprecation");
      }
      const updatedPhasePrompts = await phasePromptResponse.json();

      // Update the phase prompts map
      setPhasePromptsMap({
        ...phasePromptsMap,
        [phaseId]: updatedPhasePrompts,
      });

      // Clear the selected phase prompt if it's the one being deprecated
      if (selectedPhasePromptId === promptId) {
        setSelectedPhasePromptId(null);
        setSelectedPhasePrompt(null);
      }

      toast.success("Phase prompt deprecated successfully!");
      return true;
    } catch (error) {
      console.error("Error deprecating phase prompt:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to deprecate phase prompt"
      );
      return false;
    }
  };

  // Add new handlers for creating prompts
  const handleCreatePrefix = async (
    newPrompt: Omit<PromptFragment, "id" | "length" | "history_log">
  ) => {
    try {
      const response = await fetch("/api/prompts/prefixes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPrompt),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create prefix");
      }

      // Refresh the prefixes
      const prefixesResponse = await fetch("/api/prompts/prefixes");
      if (!prefixesResponse.ok) {
        throw new Error("Failed to refresh prefixes after creation");
      }
      const updatedPrefixesData = await prefixesResponse.json();
      setPrefixesData(updatedPrefixesData);

      toast.success("Prefix created successfully!");
      return true;
    } catch (error) {
      console.error("Error creating prefix:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create prefix"
      );
      return false;
    }
  };

  const handleCreateSuffix = async (
    newPrompt: Omit<PromptFragment, "id" | "length" | "history_log">
  ) => {
    try {
      const response = await fetch("/api/prompts/suffixes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPrompt),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create suffix");
      }

      // Refresh the suffixes
      const suffixesResponse = await fetch("/api/prompts/suffixes");
      if (!suffixesResponse.ok) {
        throw new Error("Failed to refresh suffixes after creation");
      }
      const updatedSuffixesData = await suffixesResponse.json();
      setSuffixesData(updatedSuffixesData);

      toast.success("Suffix created successfully!");
      return true;
    } catch (error) {
      console.error("Error creating suffix:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create suffix"
      );
      return false;
    }
  };

  const handleCreatePhasePrompt = async (
    phaseId: string,
    newPrompt: Omit<PromptFragment, "id" | "length" | "history_log">
  ) => {
    try {
      const response = await fetch(`/api/prompts/phases/${phaseId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPrompt),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create phase prompt");
      }

      // Refresh the phase prompts
      const phasePromptResponse = await fetch(`/api/prompts/phases/${phaseId}`);
      if (!phasePromptResponse.ok) {
        throw new Error("Failed to refresh phase prompts after creation");
      }
      const updatedPhasePrompts = await phasePromptResponse.json();

      // Update the phase prompts map
      setPhasePromptsMap({
        ...phasePromptsMap,
        [phaseId]: updatedPhasePrompts,
      });

      toast.success("Phase prompt created successfully!");
      return true;
    } catch (error) {
      console.error("Error creating phase prompt:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create phase prompt"
      );
      return false;
    }
  };

  const handleMainTextChange = (text: string) => {
    setMainText(text);
  };

  const handleGeneratePrompt = async () => {
    // Get text values from selected components
    const prefixTexts = selectedPrefixes.map((p) => p.text).join("\n\n");
    const phaseText = selectedPhasePrompt ? selectedPhasePrompt.text : "";
    const suffixTexts = selectedSuffixes.map((s) => s.text).join("\n\n");

    try {
      // Make API call to generate prompt and log to history
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mainText: mainText,
          prefixText: prefixTexts,
          phaseText: phaseText,
          suffixText: suffixTexts,
          prefixIds: selectedPrefixIds,
          suffixIds: selectedSuffixIds,
          phasePromptId: selectedPhasePromptId,
          phaseNumber: selectedPhasePrompt?.phase_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate prompt");
      }

      const data = await response.json();

      // Use the assembled prompt from the API response
      setGeneratedPrompt(data.assembledPrompt);
      toast.success("Prompt generated and logged to history!");
    } catch (error) {
      console.error("Error generating prompt:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate prompt"
      );
    }
  };

  const handleTidyAndGenerate = async () => {
    if (!mainText || mainText.trim() === "") {
      toast.error("Please enter some text to tidy");
      return;
    }

    try {
      // Show loading toast
      toast.loading("Tidying text with AI...");

      // Get text values from selected components
      const prefixTexts = selectedPrefixes.map((p) => p.text).join("\n\n");
      const phaseText = selectedPhasePrompt ? selectedPhasePrompt.text : "";
      const suffixTexts = selectedSuffixes.map((s) => s.text).join("\n\n");

      // Call the OpenAI API via our backend with all prompt components
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mainText: mainText,
          prefixText: prefixTexts,
          phaseText: phaseText,
          suffixText: suffixTexts,
          prefixIds: selectedPrefixIds,
          suffixIds: selectedSuffixIds,
          phasePromptId: selectedPhasePromptId,
          phaseNumber: selectedPhasePrompt?.phase_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to tidy text with AI");
      }

      const data = await response.json();

      // Update the main text with the refined version
      setMainText(data.refinedText);

      // Set the generated prompt from the assembled prompt in the response
      setGeneratedPrompt(data.assembledPrompt);

      toast.success("Text tidied and prompt generated successfully!");
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
          prefixData={prefixesData}
          suffixData={suffixesData}
          phasesConfig={phasesConfig}
          phasePromptsMap={phasePromptsMap}
          onSelectPrefix={handleSelectPrefix}
          onSelectSuffix={handleSelectSuffix}
          onSelectPhasePrompt={handleSelectPhasePrompt}
          selectedPrefixIds={selectedPrefixIds}
          selectedSuffixIds={selectedSuffixIds}
          selectedPhasePromptId={selectedPhasePromptId}
          selectedPrefixes={selectedPrefixes}
          selectedSuffixes={selectedSuffixes}
          selectedPhasePrompt={selectedPhasePrompt}
          mainText={mainText}
          onMainTextChange={handleMainTextChange}
          generatedPrompt={generatedPrompt}
          onGenerate={handleGeneratePrompt}
          onTidyAndGenerate={handleTidyAndGenerate}
          // Add new handlers for updating and deprecating
          onUpdatePrefix={handleUpdatePrefix}
          onUpdateSuffix={handleUpdateSuffix}
          onUpdatePhasePrompt={handleUpdatePhasePrompt}
          onRestorePrefix={handleRestorePrefix}
          onRestoreSuffix={handleRestoreSuffix}
          onRestorePhasePrompt={handleRestorePhasePrompt}
          onDeprecatePrefix={handleDeprecatePrefix}
          onDeprecateSuffix={handleDeprecateSuffix}
          onDeprecatePhasePrompt={handleDeprecatePhasePrompt}
          onCreatePrefix={handleCreatePrefix}
          onCreateSuffix={handleCreateSuffix}
          onCreatePhasePrompt={handleCreatePhasePrompt}
        />
      </div>
    </div>
  );
}
