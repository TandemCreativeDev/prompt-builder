import { promises as fs } from "fs";
import path from "path";
import {
  PromptFragment,
  PrefixesData,
  SuffixesData,
  PhasePromptsData,
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
const PREFIXES_FILE_PATH = path.join(DATA_DIR, "prefixes.json");
const SUFFIXES_FILE_PATH = path.join(DATA_DIR, "suffixes.json");
const PHASES_FILE_PATH = path.join(DATA_DIR, "phases.json");
const PHASES_DIR = path.join(DATA_DIR, "phases");

/**
 * Default empty data structures
 */
export const DEFAULT_PREFIXES_DATA: PrefixesData = {
  prefixes: [],
};

export const DEFAULT_SUFFIXES_DATA: SuffixesData = {
  suffixes: [],
};

export const DEFAULT_PHASE_PROMPTS_DATA: PhasePromptsData = {
  prompts: [],
};

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
  return readJsonFile<PhasesConfig>(PHASES_FILE_PATH, { phases: [] });
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
 * Reads prefix prompts from the prefixes.json file
 * Creates default data if the file doesn't exist
 *
 * @returns Promise resolving to the prefixes data
 */
export async function readPrefixes(): Promise<PrefixesData> {
  return readJsonFile<PrefixesData>(PREFIXES_FILE_PATH, DEFAULT_PREFIXES_DATA);
}

/**
 * Writes prefix prompts to the prefixes.json file
 *
 * @param data The prefixes data to write
 * @returns Promise that resolves when the write operation is complete
 */
export async function writePrefixes(data: PrefixesData): Promise<void> {
  return writeJsonFile<PrefixesData>(PREFIXES_FILE_PATH, data);
}

/**
 * Adds a new prefix prompt to the prefixes.json file
 *
 * @param prefix The prefix prompt to add
 * @returns Promise resolving to the updated prefixes data
 */
export async function addPrefix(prefix: PromptFragment): Promise<PrefixesData> {
  const prefixes = await readPrefixes();
  prefixes.prefixes.push(prefix);
  await writePrefixes(prefixes);
  return prefixes;
}

/**
 * Updates an existing prefix prompt in the prefixes.json file
 *
 * @param prefix The updated prefix prompt
 * @returns Promise resolving to the updated prefixes data
 */
export async function updatePrefix(
  prefix: Partial<PromptFragment>
): Promise<PrefixesData> {
  const prefixes = await readPrefixes();
  const index = prefixes.prefixes.findIndex((p) => p.id === prefix.id);

  if (index === -1) {
    throw new Error(`Prefix with id ${prefix.id} not found`);
  }

  prefixes.prefixes[index] = updatePromptFragment(
    prefixes.prefixes[index],
    prefix
  );

  await writePrefixes(prefixes);
  return prefixes;
}

/**
 * Reads suffix prompts from the suffixes.json file
 * Creates default data if the file doesn't exist
 *
 * @returns Promise resolving to the suffixes data
 */
export async function readSuffixes(): Promise<SuffixesData> {
  return readJsonFile<SuffixesData>(SUFFIXES_FILE_PATH, DEFAULT_SUFFIXES_DATA);
}

/**
 * Writes suffix prompts to the suffixes.json file
 *
 * @param data The suffixes data to write
 * @returns Promise that resolves when the write operation is complete
 */
export async function writeSuffixes(data: SuffixesData): Promise<void> {
  return writeJsonFile<SuffixesData>(SUFFIXES_FILE_PATH, data);
}

/**
 * Adds a new suffix prompt to the suffixes.json file
 *
 * @param suffix The suffix prompt to add
 * @returns Promise resolving to the updated suffixes data
 */
export async function addSuffix(suffix: PromptFragment): Promise<SuffixesData> {
  const suffixes = await readSuffixes();
  suffixes.suffixes.push(suffix);
  await writeSuffixes(suffixes);
  return suffixes;
}

/**
 * Updates an existing suffix prompt in the suffixes.json file
 *
 * @param suffix The updated suffix prompt
 * @returns Promise resolving to the updated suffixes data
 */
export async function updateSuffix(
  suffix: Partial<PromptFragment>
): Promise<SuffixesData> {
  const suffixes = await readSuffixes();
  const index = suffixes.suffixes.findIndex((s) => s.id === suffix.id);

  if (index === -1) throw new Error(`Suffix with id ${suffix.id} not found`);

  suffixes.suffixes[index] = updatePromptFragment(
    suffixes.suffixes[index],
    suffix
  );

  await writeSuffixes(suffixes);
  return suffixes;
}

/**
 * Reads phase prompts for a specific phase
 * Creates default data if the file doesn't exist
 *
 * @param phaseId The phase ID
 * @returns Promise resolving to the phase prompts data
 */
export async function readPhasePrompts(
  phaseId: string
): Promise<PhasePromptsData> {
  const filePath = path.join(PHASES_DIR, `${phaseId}.json`);
  return readJsonFile<PhasePromptsData>(filePath, DEFAULT_PHASE_PROMPTS_DATA);
}

/**
 * Writes phase prompts for a specific phase
 *
 * @param phaseId The phase ID
 * @param data The phase prompts data to write
 * @returns Promise that resolves when the write operation is complete
 */
export async function writePhasePrompts(
  phaseId: string,
  data: PhasePromptsData
): Promise<void> {
  const filePath = path.join(PHASES_DIR, `${phaseId}.json`);
  return writeJsonFile<PhasePromptsData>(filePath, data);
}

/**
 * Adds a new prompt to a specific phase
 *
 * @param phaseId The phase ID
 * @param prompt The prompt to add
 * @returns Promise resolving to the updated phase prompts data
 */
export async function addPhasePrompt(
  phaseId: string,
  prompt: PromptFragment
): Promise<PhasePromptsData> {
  const phasePrompts = await readPhasePrompts(phaseId);
  phasePrompts.prompts.push(prompt);
  await writePhasePrompts(phaseId, phasePrompts);
  return phasePrompts;
}

/**
 * Updates an existing prompt in a specific phase
 *
 * @param phaseId The phase ID
 * @param prompt The updated prompt
 * @returns Promise resolving to the updated phase prompts data
 */
export async function updatePhasePrompt(
  phaseId: string,
  prompt: Partial<PromptFragment>
): Promise<PhasePromptsData> {
  const phasePrompts = await readPhasePrompts(phaseId);
  const index = phasePrompts.prompts.findIndex((p) => p.id === prompt.id);

  if (index === -1) {
    throw new Error(
      `Prompt with id ${prompt.id} not found in phase ${phaseId}`
    );
  }

  phasePrompts.prompts[index] = updatePromptFragment(
    phasePrompts.prompts[index],
    prompt
  );

  await writePhasePrompts(phaseId, phasePrompts);
  return phasePrompts;
}
