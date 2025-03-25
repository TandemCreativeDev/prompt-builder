import { NextResponse } from "next/server";
import { readPrompts, addPrompt, updatePrompt } from "@/lib/prompts-io";
import { PromptFragment } from "@/types/prompts";
import { generatePromptId } from "@/lib/id-generator";

/**
 * GET handler for suffixes API
 * Returns all suffix prompts
 */
export async function GET() {
  try {
    const data = await readPrompts("suffixes");
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error reading suffixes:", error);
    return NextResponse.json(
      { error: "Failed to read suffixes data" },
      { status: 500 }
    );
  }
}

/**
 * POST handler for suffixes API
 * Adds a new suffix prompt
 */
export async function POST(request: Request) {
  try {
    // Get the prompt data from the request
    const promptData = (await request.json()) as Omit<
      PromptFragment,
      "id" | "length" | "history_log"
    >;

    // Create a complete prompt fragment
    const suffix: PromptFragment = {
      ...promptData,
      id: generatePromptId(),
      length: promptData.text.length,
      history_log: [],
      uses: promptData.uses || 0,
      deprecated: promptData.deprecated || false,
    };

    // Add the suffix and return the updated data
    await addPrompt("suffixes", suffix);
    return NextResponse.json(suffix, { status: 201 });
  } catch (error) {
    console.error("Error adding suffix:", error);
    return NextResponse.json(
      { error: "Failed to add suffix" },
      { status: 500 }
    );
  }
}

/**
 * PUT handler for suffixes API
 * Updates an existing suffix prompt
 */
export async function PUT(request: Request) {
  try {
    // Get the updated prompt from the request
    const suffix = (await request.json()) as PromptFragment;

    // Update the suffix's length (in case text was modified)
    suffix.length = suffix.text.length;

    // Update the suffix and return the updated data
    await updatePrompt("suffixes", suffix);
    return NextResponse.json(suffix, { status: 200 });
  } catch (error) {
    console.error("Error updating suffix:", error);
    return NextResponse.json(
      { error: "Failed to update suffix" },
      { status: 500 }
    );
  }
}
