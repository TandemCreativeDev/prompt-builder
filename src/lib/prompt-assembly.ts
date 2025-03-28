import { PromptHistoryData, PromptHistoryEntry } from "../types/history";
import { readHistory, writeHistory } from "./history-io";
import { generateHistoryId } from "./id-generator";

/**
 * Assembles a complete prompt from individual components
 *
 * @param prefix - The selected prefix text
 * @param phase - The phase prompt text (with placeholders already filled)
 * @param mainText - The user-provided main text
 * @param suffix - The selected suffix text
 * @returns The fully assembled prompt as a string
 */
export function assemblePrompt(
  prefix: string,
  phase: string,
  mainText: string,
  suffix: string
): string {
  // Concatenate all components with appropriate spacing
  // Ensure no double spacing or formatting issues between components
  const parts = [prefix, phase, mainText, suffix]
    .filter((part) => part?.trim().length > 0) // Filter out empty parts
    .map((part) => part.trim()); // Trim whitespace from all parts

  return parts.join("\n\n");
}

/**
 * Logs a generated prompt to the prompt history file
 *
 * @param userText - The original user text input
 * @param aiRefinedText - Optional refined text from AI
 * @param prefixId - Optional ID of the selected prefix
 * @param suffixId - Optional ID of the selected suffix
 * @param phasePromptId - Optional ID of the selected phase prompt
 * @param phaseNumber - Optional phase number
 * @returns Promise resolving to the created history entry
 */
export async function logGeneratedPrompt(
  userText: string,
  aiRefinedText?: string,
  prefixIds?: string[],
  suffixIds?: string[],
  phasePromptId?: string,
  phaseNumber?: string
): Promise<PromptHistoryEntry> {
  try {
    const history = await readHistory();

    const newEntry: PromptHistoryEntry = {
      id: generateHistoryId(),
      timestamp: new Date().toISOString(),
      user_text: userText,
      ...(aiRefinedText && { ai_refined_text: aiRefinedText }),
      prefix_ids: prefixIds,
      suffix_ids: suffixIds,
      phase_prompt_id: phasePromptId,
      phase_number: phaseNumber,
    };

    const updatedHistory: PromptHistoryData = [...history, newEntry];

    await writeHistory(updatedHistory);

    return newEntry;
  } catch (error) {
    console.error("Error logging generated prompt:", error);
    throw error;
  }
}
