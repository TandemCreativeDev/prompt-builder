import { NextRequest } from "next/server";
import { POST } from "./route";

// Mock fetch globally
global.fetch = jest.fn();

// Helper to reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
  // Reset environment variables
  process.env.OPENAI_API_KEY = "test-api-key";
});

// Helper to create a NextRequest with a JSON body
function createRequest(body: any): NextRequest {
  return new NextRequest("http://localhost:3000/api/generate", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("POST /api/generate", () => {
  it("should return 400 if mainText is missing", async () => {
    const req = createRequest({});
    const res = await POST(req);
    
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("mainText is required");
  });
  
  it("should return 400 if mainText is empty", async () => {
    const req = createRequest({ mainText: "" });
    const res = await POST(req);
    
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("mainText cannot be empty");
  });
  
  it("should return 400 if temperature is invalid", async () => {
    const req = createRequest({ mainText: "Test text", temperature: 3 });
    const res = await POST(req);
    
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("temperature must be a number between 0 and 2");
  });
  
  it("should return 400 if maxTokens is invalid", async () => {
    const req = createRequest({ mainText: "Test text", maxTokens: -1 });
    const res = await POST(req);
    
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("maxTokens must be a number between 1 and 4096");
  });
  
  it("should return 500 if OpenAI API key is missing", async () => {
    // Remove API key for this test
    process.env.OPENAI_API_KEY = "";
    
    const req = createRequest({ mainText: "Test text" });
    const res = await POST(req);
    
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("OpenAI API key is not configured");
  });
  
  it("should return 500 if OpenAI API call fails", async () => {
    // Mock fetch to reject
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
    
    const req = createRequest({ mainText: "Test text" });
    const res = await POST(req);
    
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("Failed to call OpenAI API");
  });
  
  it("should return 400 if OpenAI API returns a validation error", async () => {
    // Mock fetch to return a validation error
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({
        error: {
          message: "Invalid model specified",
        },
      }),
    });
    
    const req = createRequest({ 
      mainText: "Test text",
      model: "invalid-model" 
    });
    const res = await POST(req);
    
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("OpenAI API error: Invalid model specified");
  });
  
  it("should return 200 with refined text if OpenAI API call is successful", async () => {
    // Mock successful OpenAI API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [
          {
            message: {
              content: "Refined test text",
            },
          },
        ],
        model: "gpt-4o",
        usage: {
          completion_tokens: 10,
          prompt_tokens: 20,
          total_tokens: 30,
        },
      }),
    });
    
    const req = createRequest({ mainText: "Test text" });
    const res = await POST(req);
    
    expect(res.status).toBe(200);
    const data = await res.json();
    
    expect(data.refinedText).toBe("Refined test text");
    expect(data.model).toBe("gpt-4o");
    expect(data.metadata).toEqual({
      completionTokens: 10,
      promptTokens: 20,
      totalTokens: 30,
    });
    
    // Verify the call to OpenAI API
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Authorization": "Bearer test-api-key",
          "Content-Type": "application/json",
        }),
        body: expect.stringContaining("Test text"),
      })
    );
  });
  
  it("should use custom parameters if provided", async () => {
    // Mock successful OpenAI API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [
          {
            message: {
              content: "Custom refined text",
            },
          },
        ],
        model: "gpt-3.5-turbo",
        usage: {
          completion_tokens: 5,
          prompt_tokens: 10,
          total_tokens: 15,
        },
      }),
    });
    
    const req = createRequest({
      mainText: "Custom text",
      model: "gpt-3.5-turbo",
      temperature: 0.3,
      maxTokens: 500,
    });
    const res = await POST(req);
    
    expect(res.status).toBe(200);
    
    // Verify the call to OpenAI API with custom parameters
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0][1];
    const body = JSON.parse(fetchCall.body);
    
    expect(body.model).toBe("gpt-3.5-turbo");
    expect(body.temperature).toBe(0.3);
    expect(body.max_tokens).toBe(500);
  });
});