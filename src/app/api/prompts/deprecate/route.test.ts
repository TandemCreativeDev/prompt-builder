import { POST } from "./route";
import { deprecatePrompt } from "@/lib/prompts-io";

// Mock the prompts-io module
jest.mock("@/lib/prompts-io", () => ({
  deprecatePrompt: jest.fn(),
}));

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      json: async () => data,
    })),
  },
}));

describe("/api/prompts/deprecated", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("should deprecate a prompt and return status 200 on success", async () => {
      const requestBody = {
        promptId: "123",
        promptType: "prefix",
      };

      const request = {
        json: jest.fn().mockResolvedValue(requestBody),
      } as unknown as Request;

      const response = await POST(request);
      const data = await response.json();

      expect(request.json).toHaveBeenCalled();
      expect(deprecatePrompt).toHaveBeenCalledWith("123", "prefix", undefined);
      expect(response.status).toBe(200);
      expect(data).toHaveProperty(
        "message",
        "Successfully deprecated prefix prompt: 123"
      );
    });

    it("should return error with status 400 if required parameters are missing", async () => {
      const request = {
        json: jest.fn().mockResolvedValue({}),
      } as unknown as Request;

      const response = await POST(request);
      const data = await response.json();

      expect(request.json).toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(data).toHaveProperty(
        "error",
        "Missing required parameters: promptId and promptType"
      );
    });

    it("should return error with status 400 if promptType is invalid", async () => {
      const request = {
        json: jest
          .fn()
          .mockResolvedValue({ promptId: "123", promptType: "invalid" }),
      } as unknown as Request;

      const response = await POST(request);
      const data = await response.json();

      expect(request.json).toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(data).toHaveProperty(
        "error",
        "Invalid promptType. Must be one of: prefix, suffix, phase"
      );
    });

    it("should return error with status 400 if phaseId is missing for phase prompts", async () => {
      const request = {
        json: jest
          .fn()
          .mockResolvedValue({ promptId: "123", promptType: "phase" }),
      } as unknown as Request;

      const response = await POST(request);
      const data = await response.json();

      expect(request.json).toHaveBeenCalled();
      expect(response.status).toBe(400);
      expect(data).toHaveProperty(
        "error",
        "Missing required parameter: phaseId (required for phase prompts)"
      );
    });

    it("should return error with status 500 on failure", async () => {
      (deprecatePrompt as jest.Mock).mockRejectedValue(new Error("Test error"));

      const request = {
        json: jest
          .fn()
          .mockResolvedValue({ promptId: "123", promptType: "prefix" }),
      } as unknown as Request;

      const response = await POST(request);
      const data = await response.json();

      expect(request.json).toHaveBeenCalled();
      expect(deprecatePrompt).toHaveBeenCalled();
      expect(response.status).toBe(500);
      expect(data).toHaveProperty("error", "Failed to deprecate prompt");
    });
  });
});
