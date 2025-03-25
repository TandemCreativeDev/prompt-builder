/**
 * Interface for a prompt history entry
 */
export interface PromptHistoryEntry {
  id: string;
  timestamp: string;
  user_text: string;
  ai_refined_text?: string;
  prefix_ids?: string[];
  suffix_ids?: string[];
  phase_prompt_id?: string;
  phase_number?: string;
}

/**
 * Main data structure for storing prompt history
 */
export type PromptHistoryData = PromptHistoryEntry[];
