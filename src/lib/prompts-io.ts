import { promises as fs } from "fs";
import path from "path";
import {
  PromptFragment,
  PrefixesData,
  SuffixesData,
  PhasePromptsData,
  PhasesConfig,
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
 * Reads the phases configuration
 *
 * @returns Promise resolving to the phases configuration
 */
export async function readPhasesConfig(): Promise<PhasesConfig> {
  try {
    const data = await fs.readFile(PHASES_FILE_PATH, "utf-8");
    return JSON.parse(data) as PhasesConfig;
  } catch (error) {
    console.error("Error reading phases config:", error);
    throw error;
  }
}

/**
 * Reads prefix prompts from the prefixes.json file
 * Creates default data if the file doesn't exist
 *
 * @returns Promise resolving to the prefixes data
 */
export async function readPrefixes(): Promise<PrefixesData> {
  try {
    const data = await fs.readFile(PREFIXES_FILE_PATH, "utf-8");
    return JSON.parse(data) as PrefixesData;
  } catch (error) {
    // If file doesn't exist, create default structure
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await writePrefixes(DEFAULT_PREFIXES_DATA);
      return DEFAULT_PREFIXES_DATA;
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Writes prefix prompts to the prefixes.json file
 *
 * @param data The prefixes data to write
 * @returns Promise that resolves when the write operation is complete
 */
export async function writePrefixes(data: PrefixesData): Promise<void> {
  try {
    await fs.writeFile(
      PREFIXES_FILE_PATH,
      JSON.stringify(data, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Error writing prefixes file:", error);
    throw error;
  }
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
  prefix: PromptFragment
): Promise<PrefixesData> {
  const prefixes = await readPrefixes();
  const index = prefixes.prefixes.findIndex((p) => p.id === prefix.id);

  if (index === -1) {
    throw new Error(`Prefix with id ${prefix.id} not found`);
  }

  prefixes.prefixes[index] = {
    ...prefixes.prefixes[index],
    ...prefix,
  };
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
  try {
    const data = await fs.readFile(SUFFIXES_FILE_PATH, "utf-8");
    return JSON.parse(data) as SuffixesData;
  } catch (error) {
    // If file doesn't exist, create default structure
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await writeSuffixes(DEFAULT_SUFFIXES_DATA);
      return DEFAULT_SUFFIXES_DATA;
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Writes suffix prompts to the suffixes.json file
 *
 * @param data The suffixes data to write
 * @returns Promise that resolves when the write operation is complete
 */
export async function writeSuffixes(data: SuffixesData): Promise<void> {
  try {
    await fs.writeFile(
      SUFFIXES_FILE_PATH,
      JSON.stringify(data, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Error writing suffixes file:", error);
    throw error;
  }
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

  suffixes.suffixes[index] = {
    ...suffixes.suffixes[index],
    ...suffix,
  };

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

  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as PhasePromptsData;
  } catch (error) {
    // If file doesn't exist, create default structure
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await writePhasePrompts(phaseId, DEFAULT_PHASE_PROMPTS_DATA);
      return DEFAULT_PHASE_PROMPTS_DATA;
    }

    // Re-throw other errors
    throw error;
  }
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

  try {
    // Ensure the phases directory exists
    await fs.mkdir(PHASES_DIR, { recursive: true });

    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error writing phase ${phaseId} prompts file:`, error);
    throw error;
  }
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
  prompt: PromptFragment
): Promise<PhasePromptsData> {
  const phasePrompts = await readPhasePrompts(phaseId);
  const index = phasePrompts.prompts.findIndex((p) => p.id === prompt.id);

  if (index === -1) {
    throw new Error(
      `Prompt with id ${prompt.id} not found in phase ${phaseId}`
    );
  }

  phasePrompts.prompts[index] = {
    ...phasePrompts.prompts[index],
    ...prompt,
  };

  await writePhasePrompts(phaseId, phasePrompts);
  return phasePrompts;
}
