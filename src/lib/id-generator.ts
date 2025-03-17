import { v4 as uuidv4 } from "uuid";

/**
 * Generates a unique ID for a prompt fragment
 * @returns A string containing a unique ID
 */
export function generatePromptId(): string {
  return uuidv4();
}

/**
 * Generates a prefixed unique ID for a phase prompt
 * @param phase The phase number (must be a positive integer)
 * @returns A string containing a unique ID with phase prefix
 */
export function generatePhasePromptId(phase: number): string {
  if (phase < 1 || !Number.isInteger(phase)) {
    throw new Error("Phase must be a positive integer");
  }
  return `p${phase}_${uuidv4().substring(0, 8)}`;
}

/**
 * Generates a prefixed unique ID for a history entry
 * @returns A string containing a unique ID with history prefix
 */
export function generateHistoryId(): string {
  return `hist_${uuidv4().substring(0, 8)}`;
}
