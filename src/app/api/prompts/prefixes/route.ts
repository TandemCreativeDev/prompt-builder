import { NextResponse } from "next/server";
import { readPrompts, addPrompt, updatePrompt } from "@/lib/prompts-io";
import { PromptFragment } from "@/types/prompts";
import { generatePromptId } from "@/lib/id-generator";

/**
 * GET handler for prefixes API
 * Returns all prefix prompts
 */
export async function GET() {
  try {
    const data = await readPrompts("prefixes");
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error reading prefixes:", error);
    return NextResponse.json(
      { error: "Failed to read prefixes data" },
      { status: 500 }
    );
  }
}

/**
 * POST handler for prefixes API
 * Adds a new prefix prompt
 */
export async function POST(request: Request) {
  try {
    // Get the prompt data from the request
    const promptData = (await request.json()) as Omit<
      PromptFragment,
      "id" | "length" | "history_log"
    >;
    const length = promptData.text.length;
    // Create a complete prompt fragment
    const prefix: PromptFragment = {
      ...promptData,
      id: generatePromptId(),
      length: length,
      history_log: [],
      uses: promptData.uses || 0,
      deprecated: promptData.deprecated || false,
    };

    // Add the prefix and return the updated data
    await addPrompt("prefixes", prefix);
    return NextResponse.json(prefix, { status: 201 });
  } catch (error) {
    console.error("Error adding prefix:", error);
    return NextResponse.json(
      { error: "Failed to add prefix" },
      { status: 500 }
    );
  }
}

/**
 * PUT handler for prefixes API
 * Updates an existing prefix prompt
 */
export async function PUT(request: Request) {
  try {
    // Get the updated prompt from the request
    const prefix = (await request.json()) as PromptFragment;

    // Update the prefix's length (in case text was modified)
    prefix.length = prefix.text.length;

    // Update the prefix and return the updated data
    await updatePrompt("prefixes", prefix);
    return NextResponse.json(prefix, { status: 200 });
  } catch (error) {
    console.error("Error updating prefix:", error);
    return NextResponse.json(
      { error: "Failed to update prefix" },
      { status: 500 }
    );
  }
}
