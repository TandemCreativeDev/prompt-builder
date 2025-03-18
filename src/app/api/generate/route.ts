import { NextRequest, NextResponse } from "next/server";
import { assemblePrompt, logGeneratedPrompt } from "@/lib/prompt-assembly";

/**
 * Interface for the request body sent to the generate API
 */
export interface GenerateRequest {
  /**
   * Main text to be tidied or refined
   */
  mainText: string;
  /**
   * Optional model to use (defaults to gpt-4o)
   */
  model?: string;
  /**
   * Optional temperature setting (0-2, defaults to 0.7)
   */
  temperature?: number;
  /**
   * Optional max tokens setting (defaults to 1000)
   */
  maxTokens?: number;
  /**
   * Optional prefix text to include in the prompt
   */
  prefixText?: string;
  /**
   * Optional suffix text to include in the prompt
   */
  suffixText?: string;
  /**
   * Optional phase prompt text to include in the prompt
   */
  phaseText?: string;
  /**
   * Optional ID of the selected prefix for history logging
   */
  prefixId?: string;
  /**
   * Optional ID of the selected suffix for history logging
   */
  suffixId?: string;
  /**
   * Optional ID of the selected phase prompt for history logging
   */
  phasePromptId?: string;
  /**
   * Optional phase number for history logging
   */
  phaseNumber?: string;
}

/**
 * Interface for the response from the generate API
 */
export interface GenerateResponse {
  /**
   * The refined/tidied text from the OpenAI API
   */
  refinedText: string;
  /**
   * The fully assembled prompt with all components
   */
  assembledPrompt?: string;
  /**
   * The ID of the history entry created
   */
  historyId?: string;
  /**
   * The model used for generation
   */
  model: string;
  /**
   * Optional metadata about the generation
   */
  metadata?: {
    /**
     * Completion tokens used
     */
    completionTokens?: number;
    /**
     * Prompt tokens used
     */
    promptTokens?: number;
    /**
     * Total tokens used
     */
    totalTokens?: number;
  };
}

/**
 * Error class for OpenAI API errors
 */
class OpenAIError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = "OpenAIError";
    this.statusCode = statusCode;
  }
}

/**
 * Validate the input for the generate endpoint
 * @param data - The data to validate
 * @throws {Error} - If validation fails
 */
function validateInput(data: unknown): GenerateRequest {
  if (!data) {
    throw new Error("Request body is required");
  }

  const input = data as Partial<GenerateRequest>;

  if (!input.mainText || typeof input.mainText !== "string") {
    throw new Error("mainText is required and must be a string");
  }

  if (input.mainText.trim().length === 0) {
    throw new Error("mainText cannot be empty");
  }

  // Optional parameters validation
  if (input.model !== undefined && typeof input.model !== "string") {
    throw new Error("model must be a string");
  }

  if (input.temperature !== undefined) {
    const temp = Number(input.temperature);
    if (isNaN(temp) || temp < 0 || temp > 2) {
      throw new Error("temperature must be a number between 0 and 2");
    }
  }

  if (input.maxTokens !== undefined) {
    const tokens = Number(input.maxTokens);
    if (isNaN(tokens) || tokens < 1 || tokens > 4096) {
      throw new Error("maxTokens must be a number between 1 and 4096");
    }
  }

  // Validate optional text components
  if (input.prefixText !== undefined && typeof input.prefixText !== "string") {
    throw new Error("prefixText must be a string");
  }

  if (input.suffixText !== undefined && typeof input.suffixText !== "string") {
    throw new Error("suffixText must be a string");
  }

  if (input.phaseText !== undefined && typeof input.phaseText !== "string") {
    throw new Error("phaseText must be a string");
  }

  // Validate optional ID fields for history
  if (input.prefixId !== undefined && typeof input.prefixId !== "string") {
    throw new Error("prefixId must be a string");
  }

  if (input.suffixId !== undefined && typeof input.suffixId !== "string") {
    throw new Error("suffixId must be a string");
  }

  if (
    input.phasePromptId !== undefined &&
    typeof input.phasePromptId !== "string"
  ) {
    throw new Error("phasePromptId must be a string");
  }

  if (
    input.phaseNumber !== undefined &&
    typeof input.phaseNumber !== "string"
  ) {
    throw new Error("phaseNumber must be a string");
  }

  return {
    mainText: input.mainText,
    model: input.model,
    temperature: input.temperature,
    maxTokens: input.maxTokens,
    prefixText: input.prefixText,
    suffixText: input.suffixText,
    phaseText: input.phaseText,
    prefixId: input.prefixId,
    suffixId: input.suffixId,
    phasePromptId: input.phasePromptId,
    phaseNumber: input.phaseNumber,
  };
}

/**
 * Check if the OpenAI API key is configured
 * @throws {OpenAIError} - If the API key is not configured
 */
function checkApiKey(): void {
  if (!process.env.OPENAI_API_KEY) {
    throw new OpenAIError(
      "OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.",
      500
    );
  }
}

/**
 * Call the OpenAI API to refine the main text
 * @param request - The request data
 * @returns Promise<GenerateResponse> - The response from the OpenAI API
 * @throws {OpenAIError} - If the API call fails
 */
async function callOpenAI(request: GenerateRequest): Promise<GenerateResponse> {
  try {
    // Check API key before making the request
    checkApiKey();

    const model = request.model || "gpt-4o";
    const temperature = request.temperature || 0.7;
    const maxTokens = request.maxTokens || 1000;

    // Use proper prompt text for the API call
    const textToRefine = request.mainText;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that refines and improves text while maintaining its original meaning and intent. Make the text more concise, clear, and well-structured.",
          },
          {
            role: "user",
            content: `Please refine and tidy the following text:\n\n${textToRefine}`,
          },
        ],
        temperature: temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new OpenAIError(
        `OpenAI API error: ${error.error?.message || "Unknown error"}`,
        response.status
      );
    }

    const data = await response.json();
    const refinedText = data.choices[0].message.content;

    // Assemble the full prompt
    const assembledPrompt = assemblePrompt(
      request.prefixText || "",
      request.phaseText || "",
      refinedText,
      request.suffixText || ""
    );

    return {
      refinedText: refinedText,
      assembledPrompt: assembledPrompt,
      model: data.model,
      metadata: {
        completionTokens: data.usage?.completion_tokens,
        promptTokens: data.usage?.prompt_tokens,
        totalTokens: data.usage?.total_tokens,
      },
    };
  } catch (error) {
    if (error instanceof OpenAIError) {
      throw error;
    }

    console.error("Error calling OpenAI API:", error);
    throw new OpenAIError(
      `Failed to call OpenAI API: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      500
    );
  }
}

/**
 * POST handler for the generate API endpoint
 * @param request - The request object
 * @returns Promise<NextResponse> - The response object
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const data = await request.json();

    // Validate input
    const validatedData = validateInput(data);

    // Call OpenAI API
    const result = await callOpenAI(validatedData);

    // Log the generated prompt to history
    try {
      const historyEntry = await logGeneratedPrompt(
        validatedData.mainText,
        result.refinedText,
        validatedData.prefixId,
        validatedData.suffixId,
        validatedData.phasePromptId,
        validatedData.phaseNumber
      );

      // Add history ID to the result
      result.historyId = historyEntry.id;
    } catch (historyError) {
      console.error("Error logging prompt to history:", historyError);
      // We don't want to fail the whole request if history logging fails
    }

    // Return successful response
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    // Handle validation errors
    if (error instanceof Error && !(error instanceof OpenAIError)) {
      console.error("Validation error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Handle OpenAI API errors
    if (error instanceof OpenAIError) {
      console.error("OpenAI API error:", error.message);
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    // Handle unexpected errors
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
