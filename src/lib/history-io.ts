import { promises as fs } from "fs";
import path from "path";
import { PromptHistoryData } from "../types/history";

/**
 * Path to the prompt_history.json file
 */
const HISTORY_FILE_PATH = path.join(
  process.cwd(),
  "data",
  "prompt_history.json"
);

/**
 * Default empty history data structure
 */
export const DEFAULT_HISTORY_DATA: PromptHistoryData = [];

/**
 * Reads prompt history data from the prompt_history.json file
 * Creates default data if the file doesn't exist
 *
 * @returns Promise resolving to the history data
 */
export async function readHistory(): Promise<PromptHistoryData> {
  try {
    // Ensure the data directory exists
    const dataDir = path.dirname(HISTORY_FILE_PATH);
    await fs.mkdir(dataDir, { recursive: true });

    // Try to read the file
    const data = await fs.readFile(HISTORY_FILE_PATH, "utf-8");
    return JSON.parse(data) as PromptHistoryData;
  } catch (error) {
    // If file doesn't exist, create default structure
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await writeHistory(DEFAULT_HISTORY_DATA);
      return DEFAULT_HISTORY_DATA;
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Writes prompt history data to the prompt_history.json file
 *
 * @param data The history data to write
 * @returns Promise that resolves when the write operation is complete
 */
export async function writeHistory(data: PromptHistoryData): Promise<void> {
  try {
    // Ensure the data directory exists
    const dataDir = path.dirname(HISTORY_FILE_PATH);
    await fs.mkdir(dataDir, { recursive: true });

    // Write the file with pretty formatting
    await fs.writeFile(
      HISTORY_FILE_PATH,
      JSON.stringify(data, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Error writing history file:", error);
    throw error;
  }
}
