import { GET, POST, PUT } from "./route";
import { readSuffixes, addSuffix, updateSuffix } from "@/lib/prompts-io";
import { generatePromptId } from "@/lib/id-generator";
import { PromptFragment } from "@/types/prompts";

// Mock the prompts-io module
jest.mock("@/lib/prompts-io", () => ({
  readSuffixes: jest.fn(),
  addSuffix: jest.fn(),
  updateSuffix: jest.fn(),
}));

// Mock the id-generator module
jest.mock("@/lib/id-generator", () => ({
  generatePromptId: jest.fn(),
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

describe("/api/prompts/suffixes", () => {
  const mockSuffixesData = {
    suffixes: [
      {
        id: "456",
        text: "Test suffix",
        tags: ["test"],
        uses: 5,
        created_by: "user1",
        ai_version_compatibility: ["Claude 3.5"],
        length: 11,
        deprecated: false,
        history_log: [],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should return suffixes data with status 200 on success", async () => {
      (readSuffixes as jest.Mock).mockResolvedValue(mockSuffixesData);

      const response = await GET();
      const data = await response.json();

      expect(readSuffixes).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(data).toEqual(mockSuffixesData);
    });

    it("should return error with status 500 on failure", async () => {
      (readSuffixes as jest.Mock).mockRejectedValue(new Error("Test error"));

      const response = await GET();
      const data = await response.json();

      expect(readSuffixes).toHaveBeenCalled();
      expect(response.status).toBe(500);
      expect(data).toHaveProperty("error", "Failed to read suffixes data");
    });
  });

  describe("POST", () => {
    it("should add a new suffix and return status 201 on success", async () => {
      const newSuffixData = {
        text: "New suffix",
        tags: ["new", "test"],
        created_by: "user1",
        ai_version_compatibility: ["Claude 3.5"],
        uses: 0,
        deprecated: false,
      };

      const expectedSuffix = {
        ...newSuffixData,
        id: "new-id",
        length: 10,
        history_log: [],
      };

      (generatePromptId as jest.Mock).mockReturnValue("new-id");
      (addSuffix as jest.Mock).mockResolvedValue({
        suffixes: [...mockSuffixesData.suffixes, expectedSuffix],
      });

      const request = {
        json: jest.fn().mockResolvedValue(newSuffixData),
      } as unknown as Request;

      const response = await POST(request);
      const data = await response.json();

      expect(request.json).toHaveBeenCalled();
      expect(generatePromptId).toHaveBeenCalled();
      expect(addSuffix).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "new-id",
          text: "New suffix",
        })
      );
      expect(response.status).toBe(201);
      expect(data).toHaveProperty("id", "new-id");
      expect(data).toHaveProperty("text", "New suffix");
    });

    it("should return error with status 500 on failure", async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error("Test error")),
      } as unknown as Request;

      const response = await POST(request);
      const data = await response.json();

      expect(request.json).toHaveBeenCalled();
      expect(response.status).toBe(500);
      expect(data).toHaveProperty("error", "Failed to add suffix");
    });
  });

  describe("PUT", () => {
    it("should update an existing suffix and return status 200 on success", async () => {
      const updatedSuffix: PromptFragment = {
        id: "456",
        text: "Updated suffix",
        tags: ["updated", "test"],
        uses: 6,
        created_by: "user1",
        ai_version_compatibility: ["Claude 3.5"],
        length: 14,
        deprecated: false,
        history_log: [],
      };

      (updateSuffix as jest.Mock).mockResolvedValue({
        suffixes: [updatedSuffix],
      });

      const request = {
        json: jest.fn().mockResolvedValue(updatedSuffix),
      } as unknown as Request;

      const response = await PUT(request);
      const data = await response.json();

      expect(request.json).toHaveBeenCalled();
      expect(updateSuffix).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "456",
          text: "Updated suffix",
          length: 14,
        })
      );
      expect(response.status).toBe(200);
      expect(data).toEqual(updatedSuffix);
    });

    it("should return error with status 500 on failure", async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error("Test error")),
      } as unknown as Request;

      const response = await PUT(request);
      const data = await response.json();

      expect(request.json).toHaveBeenCalled();
      expect(response.status).toBe(500);
      expect(data).toHaveProperty("error", "Failed to update suffix");
    });
  });
});