import { GET, POST, PUT } from "./route";
import {
  readPhasePrompts,
  addPhasePrompt,
  updatePhasePrompt,
} from "@/lib/prompts-io";
import { generatePhasePromptId } from "@/lib/id-generator";
import { PromptFragment } from "@/types/prompts";

// Mock the prompts-io module
jest.mock("@/lib/prompts-io", () => ({
  readPhasePrompts: jest.fn(),
  addPhasePrompt: jest.fn(),
  updatePhasePrompt: jest.fn(),
}));

// Mock the id-generator module
jest.mock("@/lib/id-generator", () => ({
  generatePhasePromptId: jest.fn(),
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

describe("/api/prompts/phases/[phaseId]", () => {
  const phaseId = "1";
  const params = { phaseId };

  const mockPhasePromptsData = {
    prompts: [
      {
        id: "p1_123",
        text: "Test phase prompt",
        tags: ["test"],
        uses: 5,
        created_by: "user1",
        ai_version_compatibility: ["Claude 3.5"],
        length: 17,
        deprecated: false,
        history_log: [],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should return phase prompts data with status 200 on success", async () => {
      (readPhasePrompts as jest.Mock).mockResolvedValue(mockPhasePromptsData);

      const response = await GET({} as Request, { params });
      const data = await response.json();

      expect(readPhasePrompts).toHaveBeenCalledWith(phaseId);
      expect(response.status).toBe(200);
      expect(data).toEqual(mockPhasePromptsData);
    });

    it("should return error with status 500 on failure", async () => {
      (readPhasePrompts as jest.Mock).mockRejectedValue(
        new Error("Test error")
      );

      const response = await GET({} as Request, { params });
      const data = await response.json();

      expect(readPhasePrompts).toHaveBeenCalledWith(phaseId);
      expect(response.status).toBe(500);
      expect(data).toHaveProperty("error", "Failed to read phase 1 prompts");
    });
  });

  describe("POST", () => {
    it("should add a new phase prompt and return status 201 on success", async () => {
      const newPromptData = {
        text: "New phase prompt",
        tags: ["new", "test"],
        created_by: "user1",
        ai_version_compatibility: ["Claude 3.5"],
        uses: 0,
        deprecated: false,
      };

      const expectedPrompt = {
        ...newPromptData,
        id: "p1_new-id",
        length: 16,
        history_log: [],
      };

      (generatePhasePromptId as jest.Mock).mockReturnValue("p1_new-id");
      (addPhasePrompt as jest.Mock).mockResolvedValue({
        prompts: [...mockPhasePromptsData.prompts, expectedPrompt],
      });

      const request = {
        json: jest.fn().mockResolvedValue(newPromptData),
      } as unknown as Request;

      const response = await POST(request, { params });
      const data = await response.json();

      expect(request.json).toHaveBeenCalled();
      expect(generatePhasePromptId).toHaveBeenCalledWith(1);
      expect(addPhasePrompt).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({
          id: "p1_new-id",
          text: "New phase prompt",
        })
      );
      expect(response.status).toBe(201);
      expect(data).toHaveProperty("id", "p1_new-id");
      expect(data).toHaveProperty("text", "New phase prompt");
    });

    it("should return error with status 400 for an invalid phase ID", async () => {
      const request = {
        json: jest.fn(),
      } as unknown as Request;

      const invalidParams = { phaseId: "invalid" };

      const response = await POST(request, { params: invalidParams });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty(
        "error",
        "Invalid phase ID - must be a positive integer"
      );
    });

    it("should return error with status 500 on failure", async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error("Test error")),
      } as unknown as Request;

      const response = await POST(request, { params });
      const data = await response.json();

      expect(request.json).toHaveBeenCalled();
      expect(response.status).toBe(500);
      expect(data).toHaveProperty("error", "Failed to add prompt to phase 1");
    });
  });

  describe("PUT", () => {
    it("should update an existing phase prompt and return status 200 on success", async () => {
      const updatedPrompt: PromptFragment = {
        id: "p1_123",
        text: "Updated phase prompt",
        tags: ["updated", "test"],
        uses: 6,
        created_by: "user1",
        ai_version_compatibility: ["Claude 3.5"],
        length: 20,
        deprecated: false,
        history_log: [],
      };

      (updatePhasePrompt as jest.Mock).mockResolvedValue({
        prompts: [updatedPrompt],
      });

      const request = {
        json: jest.fn().mockResolvedValue(updatedPrompt),
      } as unknown as Request;

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(request.json).toHaveBeenCalled();
      expect(updatePhasePrompt).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({
          id: "p1_123",
          text: "Updated phase prompt",
          length: 20,
        })
      );
      expect(response.status).toBe(200);
      expect(data).toEqual(updatedPrompt);
    });

    it("should return error with status 500 on failure", async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error("Test error")),
      } as unknown as Request;

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(request.json).toHaveBeenCalled();
      expect(response.status).toBe(500);
      expect(data).toHaveProperty(
        "error",
        "Failed to update prompt in phase 1"
      );
    });
  });
});
