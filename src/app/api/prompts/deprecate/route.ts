import { NextResponse } from "next/server";
import { deprecatePrompt } from "@/lib/prompts-io";

/**
 * POST handler for prompt deprecation API
 * Marks a prompt as deprecated (soft delete)
 */
export async function POST(request: Request) {
  try {
    // Get the prompt data from the request
    const { promptId, filename } = await request.json();

    // Validate required parameters
    if (!promptId || !filename) {
      return NextResponse.json(
        { error: "Missing required parameters: promptId and promptType" },
        { status: 400 }
      );
    }

    // Deprecate the prompt
    await deprecatePrompt(promptId, filename);

    return NextResponse.json(
      { message: `Successfully deprecated ${filename} prompt: ${promptId}` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deprecating prompt:", error);
    return NextResponse.json(
      { error: "Failed to deprecate prompt" },
      { status: 500 }
    );
  }
}
