/**
 * Interface for history log entries of prompt fragments
 */
export interface HistoryLogEntry {
  timestamp: string;
  text: string;
}

/**
 * Interface for a prompt fragment (prefix, suffix, or phase prompt)
 */
export interface PromptFragment {
  id: string;
  text: string;
  tags: string[];
  associated_model_type?: string;
  rating?: number;
  uses: number;
  last_used?: string;
  created_by: string;
  ai_version_compatibility: string[];
  length: number;
  deprecated: boolean;
  history_log: HistoryLogEntry[];
}

/**
 * Interface for prefix prompts collection
 */
export interface PrefixesData {
  prefixes: PromptFragment[];
}

/**
 * Interface for suffix prompts collection
 */
export interface SuffixesData {
  suffixes: PromptFragment[];
}

/**
 * Interface for phase prompts collection for a specific phase
 */
export interface PhasePromptsData {
  prompts: PromptFragment[];
}

/**
 * Interface for phase metadata
 */
export interface Phase {
  id: string;
  name: string;
  description: string;
}

/**
 * Interface for phases configuration
 */
export interface PhasesConfig {
  phases: Phase[];
}
