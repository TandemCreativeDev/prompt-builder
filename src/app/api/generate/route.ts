import { NextRequest, NextResponse } from "next/server";

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
function validateInput(data: any): GenerateRequest {
  if (!data) {
    throw new Error("Request body is required");
  }
  
  if (!data.mainText || typeof data.mainText !== "string") {
    throw new Error("mainText is required and must be a string");
  }
  
  if (data.mainText.trim().length === 0) {
    throw new Error("mainText cannot be empty");
  }
  
  // Optional parameters validation
  if (data.model !== undefined && typeof data.model !== "string") {
    throw new Error("model must be a string");
  }
  
  if (data.temperature !== undefined) {
    const temp = Number(data.temperature);
    if (isNaN(temp) || temp < 0 || temp > 2) {
      throw new Error("temperature must be a number between 0 and 2");
    }
  }
  
  if (data.maxTokens !== undefined) {
    const tokens = Number(data.maxTokens);
    if (isNaN(tokens) || tokens < 1 || tokens > 4096) {
      throw new Error("maxTokens must be a number between 1 and 4096");
    }
  }
  
  return {
    mainText: data.mainText,
    model: data.model,
    temperature: data.temperature,
    maxTokens: data.maxTokens,
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
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that refines and improves text while maintaining its original meaning and intent. Make the text more concise, clear, and well-structured.",
          },
          {
            role: "user",
            content: `Please refine and tidy the following text:\n\n${request.mainText}`,
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
    
    return {
      refinedText: data.choices[0].message.content,
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
export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    // Parse request body
    const data = await request.json();
    
    // Validate input
    const validatedData = validateInput(data);
    
    // Call OpenAI API
    const result = await callOpenAI(validatedData);
    
    // Return successful response
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    // Handle validation errors
    if (error instanceof Error && !(error instanceof OpenAIError)) {
      console.error("Validation error:", error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
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