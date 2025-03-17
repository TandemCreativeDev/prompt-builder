/**
 * Interface for a prompt history entry
 */
export interface PromptHistoryEntry {
  id: string;
  timestamp: string;
  user_text: string;
  ai_refined_text?: string;
  prefix_id?: string;
  suffix_id?: string;
  phase_prompt_id?: string;
  phase_number?: string;
}

/**
 * Main data structure for storing prompt history
 */
export interface PromptHistoryData {
  entries: PromptHistoryEntry[];
}
