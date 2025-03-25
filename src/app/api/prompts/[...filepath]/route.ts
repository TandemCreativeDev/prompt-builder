import { NextResponse } from "next/server";
import { readPrompts, addPrompt, updatePrompt } from "@/lib/prompts-io";
import { PromptFragment } from "@/types/prompts";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";

/**
 * Gets a list of all available data paths by scanning the data directory
 * This allows the API to dynamically respond based on actual files in the data folder
 */
async function getAvailableDataPaths() {
  const dataDir = path.join(process.cwd(), "data");

  try {
    // Get all files and directories in the data folder
    const entries = await fs.readdir(dataDir, { withFileTypes: true });

    // Process each entry
    const paths = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        // If it's a directory, scan it for JSON files
        const subdirPath = path.join(dataDir, entry.name);
        const subdirEntries = await fs.readdir(subdirPath, {
          withFileTypes: true,
        });

        for (const subEntry of subdirEntries) {
          if (subEntry.isFile() && subEntry.name.endsWith(".json")) {
            // Add the path without .json extension
            paths.push(`${entry.name}/${subEntry.name.replace(".json", "")}`);
          }
        }
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        // If it's a JSON file, add it to the paths
        paths.push(entry.name.replace(".json", ""));
      }
    }

    return paths;
  } catch (error) {
    console.error("Error reading data directory:", error);
    return [];
  }
}

/**
 * GET handler for root API endpoint
 * Returns a list of all available data endpoints
 */
export async function GET(
  request: Request,
  context: { params: { filepath: string[] } }
) {
  // Make sure params are awaited properly
  const params = await context.params;

  // If no filepath is provided or it's empty, return the list of available endpoints
  if (!params.filepath || params.filepath.length === 0) {
    try {
      const availablePaths = await getAvailableDataPaths();
      return NextResponse.json(
        {
          message: "Available data endpoints",
          endpoints: availablePaths.map((path) => `/api/prompts/${path}`),
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error listing available endpoints:", error);
      return NextResponse.json(
        { error: "Failed to list available endpoints" },
        { status: 500 }
      );
    }
  }

  // Otherwise, handle the specific filepath request
  const filepath = params.filepath.join("/");
  try {
    const data = await readPrompts(filepath);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(`Error reading prompts at ${filepath}:`, error);
    return NextResponse.json(
      { error: `Failed to read prompts at ${filepath}` },
      { status: 500 }
    );
  }
}

/**
 * POST handler for dynamic prompt API
 * Adds a new prompt to the specified filepath
 */
export async function POST(
  request: Request,
  context: { params: { filepath: string[] } }
) {
  // Make sure params are awaited properly
  const params = await context.params;
  const filepath = params.filepath.join("/");

  try {
    // Get the prompt data from the request
    const promptData = (await request.json()) as Omit<
      PromptFragment,
      "id" | "length" | "history_log"
    >;

    // Determine the type of prompt based on the filepath
    const promptId = uuidv4();

    // Create a complete prompt fragment
    const prompt: PromptFragment = {
      ...promptData,
      id: promptId,
      length: promptData.text.length,
      history_log: [],
      uses: promptData.uses || 0,
      deprecated: promptData.deprecated || false,
    };

    // Add the prompt and return the updated data
    await addPrompt(filepath, prompt);
    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    console.error(`Error adding prompt to ${filepath}:`, error);
    return NextResponse.json(
      { error: `Failed to add prompt to ${filepath}` },
      { status: 500 }
    );
  }
}

/**
 * PUT handler for dynamic prompt API
 * Updates an existing prompt in the specified filepath
 */
export async function PUT(
  request: Request,
  context: { params: { filepath: string[] } }
) {
  // Make sure params are awaited properly
  const params = await context.params;
  const filepath = params.filepath.join("/");

  try {
    // Get the updated prompt from the request
    const prompt = (await request.json()) as PromptFragment;

    // Update the prompt's length (in case text was modified)
    prompt.length = prompt.text.length;

    // Update the prompt and return the updated data
    await updatePrompt(filepath, prompt);
    return NextResponse.json(prompt, { status: 200 });
  } catch (error) {
    console.error(`Error updating prompt in ${filepath}:`, error);
    return NextResponse.json(
      { error: `Failed to update prompt in ${filepath}` },
      { status: 500 }
    );
  }
}
