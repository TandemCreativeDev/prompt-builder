import { NextResponse } from "next/server";
import { deprecatePrompt } from "@/lib/prompts-io";

/**
 * POST handler for prompt deprecation API
 * Marks a prompt as deprecated (soft delete)
 */
export async function POST(request: Request) {
  try {
    // Get the prompt data from the request
    const { promptId, promptType, phaseId } = await request.json();

    // Validate required parameters
    if (!promptId || !promptType) {
      return NextResponse.json(
        { error: "Missing required parameters: promptId and promptType" },
        { status: 400 }
      );
    }

    // Validate promptType
    if (!['prefix', 'suffix', 'phase'].includes(promptType)) {
      return NextResponse.json(
        { error: "Invalid promptType. Must be one of: prefix, suffix, phase" },
        { status: 400 }
      );
    }

    // Validate phaseId for phase prompts
    if (promptType === 'phase' && !phaseId) {
      return NextResponse.json(
        { error: "Missing required parameter: phaseId (required for phase prompts)" },
        { status: 400 }
      );
    }

    // Deprecate the prompt
    await deprecatePrompt(
      promptId,
      promptType as 'prefix' | 'suffix' | 'phase',
      phaseId
    );

    return NextResponse.json(
      { message: `Successfully deprecated ${promptType} prompt: ${promptId}` },
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