import { NextResponse } from "next/server";
import {
  readPhasePrompts,
  addPhasePrompt,
  updatePhasePrompt,
} from "@/lib/prompts-io";
import { PromptFragment } from "@/types/prompts";
import { generatePhasePromptId } from "@/lib/id-generator";

/**
 * GET handler for phase prompts API
 * Returns all prompts for a specific phase
 */
export async function GET(
  request: Request,
  { params }: { params: { phaseId: string } }
) {
  try {
    const { phaseId } = params;
    const data = await readPhasePrompts(phaseId);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(`Error reading phase ${params.phaseId} prompts:`, error);
    return NextResponse.json(
      { error: `Failed to read phase ${params.phaseId} prompts` },
      { status: 500 }
    );
  }
}

/**
 * POST handler for phase prompts API
 * Adds a new prompt to a specific phase
 */
export async function POST(
  request: Request,
  { params }: { params: { phaseId: string } }
) {
  try {
    const { phaseId } = params;
    const phaseNum = parseInt(phaseId);

    if (isNaN(phaseNum) || phaseNum < 1 || !Number.isInteger(phaseNum)) {
      return NextResponse.json(
        { error: "Invalid phase ID - must be a positive integer" },
        { status: 400 }
      );
    }

    // Get the prompt data from the request
    const promptData = (await request.json()) as Omit<
      PromptFragment,
      "id" | "length" | "history_log"
    >;

    // Create a complete prompt fragment
    const prompt: PromptFragment = {
      ...promptData,
      id: generatePhasePromptId(phaseNum),
      length: promptData.text.length,
      history_log: [],
      uses: promptData.uses || 0,
      deprecated: promptData.deprecated || false,
    };

    // Add the prompt and return the updated data
    await addPhasePrompt(phaseId, prompt);
    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    console.error(`Error adding prompt to phase ${params.phaseId}:`, error);
    return NextResponse.json(
      { error: `Failed to add prompt to phase ${params.phaseId}` },
      { status: 500 }
    );
  }
}

/**
 * PUT handler for phase prompts API
 * Updates an existing prompt in a specific phase
 */
export async function PUT(
  request: Request,
  { params }: { params: { phaseId: string } }
) {
  try {
    const { phaseId } = params;

    // Get the updated prompt from the request
    const prompt = (await request.json()) as PromptFragment;

    // Update the prompt's length (in case text was modified)
    prompt.length = prompt.text.length;

    // Update the prompt and return the updated data
    await updatePhasePrompt(phaseId, prompt);
    return NextResponse.json(prompt, { status: 200 });
  } catch (error) {
    console.error(`Error updating prompt in phase ${params.phaseId}:`, error);
    return NextResponse.json(
      { error: `Failed to update prompt in phase ${params.phaseId}` },
      { status: 500 }
    );
  }
}
