import { promises as fs } from "fs";
import path from "path";
import {
  PromptFragment,
  PromptsData,
  PhasesConfig,
  HistoryLogEntry,
} from "../types/prompts";

/**
 * Base path for data files
 */
const DATA_DIR = path.join(process.cwd(), "data");

/**
 * Paths to the various JSON files
 */
const PHASES_FILE_PATH = path.join(DATA_DIR, "phases.json");

/**
 * Default empty data structures
 */
export const DEFAULT_PROMPTS_DATA: PromptsData = [];

/**
 * Generic function to read JSON data from a file
 * Creates default data if the file doesn't exist
 *
 * @param filePath The path to the JSON file
 * @param defaultData The default data to use if the file doesn't exist
 * @returns Promise resolving to the JSON data
 */
async function readJsonFile<T>(filePath: string, defaultData: T): Promise<T> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch (error) {
    // If file doesn't exist, create default structure
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await writeJsonFile(filePath, defaultData);
      return defaultData;
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Generic function to write JSON data to a file
 *
 * @param filePath The path to the JSON file
 * @param data The data to write
 * @returns Promise that resolves when the write operation is complete
 */
async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  try {
    // Ensure the directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Creates a history log entry for a prompt update
 *
 * @param text The updated text of the prompt
 * @returns A history log entry with the current timestamp
 */
function createHistoryLogEntry(text: string): HistoryLogEntry {
  return {
    timestamp: new Date().toISOString(),
    text: text,
  };
}

/**
 * Generic function to update a prompt fragment
 * Updates the prompt's properties and adds a history log entry
 *
 * @param original The original prompt fragment
 * @param updates The updates to apply to the prompt
 * @returns The updated prompt fragment
 */
function updatePromptFragment(
  original: PromptFragment,
  updates: Partial<PromptFragment>
): PromptFragment {
  const updated = {
    ...original,
    ...updates,
  };

  // Add to history_log if text was changed
  if (updates.text && updates.text !== original.text) {
    if (!updated.history_log) {
      updated.history_log = [];
    }
    updated.history_log.push(createHistoryLogEntry(original.text));

    // Update length if text changed
    updated.length = updates.text.length;
  }

  return updated;
}

/**
 * Reads the phases configuration
 *
 * @returns Promise resolving to the phases configuration
 */
export async function readPhasesConfig(): Promise<PhasesConfig> {
  return readJsonFile<PhasesConfig>(PHASES_FILE_PATH, []);
}

/**
 * Writes phases configuration
 *
 * @param data The phases configuration to write
 * @returns Promise that resolves when the write operation is complete
 */
export async function writePhasesConfig(data: PhasesConfig): Promise<void> {
  return writeJsonFile<PhasesConfig>(PHASES_FILE_PATH, data);
}

/**
 * Reads prompts from the corresponding type json file
 * Creates default data if the file doesn't exist
 *
 * @param filename The prompt filename
 * @returns Promise resolving to the prompts data
 */
export async function readPrompts(filename: string): Promise<PromptsData> {
  return readJsonFile<PromptsData>(
    path.join(DATA_DIR, `${filename}.json`),
    DEFAULT_PROMPTS_DATA
  );
}

/**
 * Writes prompts to the corresponding type json file
 *
 * @param filename The prompt filename
 * @param data The prompts data to write
 * @returns Promise that resolves when the write operation is complete
 */
export async function writePrompts(
  filename: string,
  data: PromptsData
): Promise<void> {
  return writeJsonFile<PromptsData>(
    path.join(DATA_DIR, `${filename}.json`),
    data
  );
}

/**
 * Adds a new prompt to the corresponding type json file
 *
 * @param filename The prompt filename
 * @param prompt The prompt to add
 * @returns Promise resolving to the updated prompt data
 */
export async function addPrompt(
  filename: string,
  prompt: PromptFragment
): Promise<PromptsData> {
  const prompts = await readPrompts(filename);
  prompts.push(prompt);
  await writePrompts(filename, prompts);
  return prompts;
}

/**
 * Updates an existing prompt in the corresponding type json file
 *
 * @param filename The prompt filename
 * @param prompt The updated prompt
 * @returns Promise resolving to the updated prompt data
 */
export async function updatePrompt(
  filename: string,
  prompt: Partial<PromptFragment>
): Promise<PromptsData> {
  const prompts = await readPrompts(filename);
  const index = prompts.findIndex((p) => p.id === prompt.id);

  if (index === -1) {
    throw new Error(`${filename} prompt with id ${prompt.id} not found`);
  }

  prompts[index] = updatePromptFragment(prompts[index], prompt);

  await writePrompts(filename, prompts);
  return prompts;
}

/**
 * Marks a prompt as deprecated (soft delete)
 * Works with prefixes, suffixes, and phase prompts
 *
 * @param promptId The ID of the prompt to deprecate
 * @param filename The prompt filename
 * @returns Promise resolving to true if successful
 */
export async function deprecatePrompt(
  promptId: string,
  filename: string
): Promise<boolean> {
  try {
    await updatePrompt(filename, { id: promptId, deprecated: true });
    return true;
  } catch (error) {
    console.error(`Error deprecating ${filename} prompt:`, error);
    throw error;
  }
}
