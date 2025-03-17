import { GET, POST, PUT } from "./route";
import { readPrefixes, addPrefix, updatePrefix } from "@/lib/prompts-io";
import { generatePromptId } from "@/lib/id-generator";
import { PromptFragment } from "@/types/prompts";

// Mock the prompts-io module
jest.mock("@/lib/prompts-io", () => ({
  readPrefixes: jest.fn(),
  addPrefix: jest.fn(),
  updatePrefix: jest.fn(),
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

describe("/api/prompts/prefixes", () => {
  const mockPrefixesData = {
    prefixes: [
      {
        id: "123",
        text: "Test prefix",
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
    it("should return prefixes data with status 200 on success", async () => {
      (readPrefixes as jest.Mock).mockResolvedValue(mockPrefixesData);

      const response = await GET();
      const data = await response.json();

      expect(readPrefixes).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(data).toEqual(mockPrefixesData);
    });

    it("should return error with status 500 on failure", async () => {
      (readPrefixes as jest.Mock).mockRejectedValue(new Error("Test error"));

      const response = await GET();
      const data = await response.json();

      expect(readPrefixes).toHaveBeenCalled();
      expect(response.status).toBe(500);
      expect(data).toHaveProperty("error", "Failed to read prefixes data");
    });
  });

  describe("POST", () => {
    it("should add a new prefix and return status 201 on success", async () => {
      const newPrefixData = {
        text: "New prefix",
        tags: ["new", "test"],
        created_by: "user1",
        ai_version_compatibility: ["Claude 3.5"],
        uses: 0,
        deprecated: false,
      };

      const expectedPrefix = {
        ...newPrefixData,
        id: "new-id",
        length: 10,
        history_log: [],
      };

      (generatePromptId as jest.Mock).mockReturnValue("new-id");
      (addPrefix as jest.Mock).mockResolvedValue({
        prefixes: [...mockPrefixesData.prefixes, expectedPrefix],
      });

      const request = {
        json: jest.fn().mockResolvedValue(newPrefixData),
      } as unknown as Request;

      const response = await POST(request);
      const data = await response.json();

      expect(request.json).toHaveBeenCalled();
      expect(generatePromptId).toHaveBeenCalled();
      expect(addPrefix).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "new-id",
          text: "New prefix",
        })
      );
      expect(response.status).toBe(201);
      expect(data).toHaveProperty("id", "new-id");
      expect(data).toHaveProperty("text", "New prefix");
    });

    it("should return error with status 500 on failure", async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error("Test error")),
      } as unknown as Request;

      const response = await POST(request);
      const data = await response.json();

      expect(request.json).toHaveBeenCalled();
      expect(response.status).toBe(500);
      expect(data).toHaveProperty("error", "Failed to add prefix");
    });
  });

  describe("PUT", () => {
    it("should update an existing prefix and return status 200 on success", async () => {
      const updatedPrefix: PromptFragment = {
        id: "123",
        text: "Updated prefix",
        tags: ["updated", "test"],
        uses: 6,
        created_by: "user1",
        ai_version_compatibility: ["Claude 3.5"],
        length: 14,
        deprecated: false,
        history_log: [],
      };

      (updatePrefix as jest.Mock).mockResolvedValue({
        prefixes: [updatedPrefix],
      });

      const request = {
        json: jest.fn().mockResolvedValue(updatedPrefix),
      } as unknown as Request;

      const response = await PUT(request);
      const data = await response.json();

      expect(request.json).toHaveBeenCalled();
      expect(updatePrefix).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "123",
          text: "Updated prefix",
          length: 14,
        })
      );
      expect(response.status).toBe(200);
      expect(data).toEqual(updatedPrefix);
    });

    it("should return error with status 500 on failure", async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error("Test error")),
      } as unknown as Request;

      const response = await PUT(request);
      const data = await response.json();

      expect(request.json).toHaveBeenCalled();
      expect(response.status).toBe(500);
      expect(data).toHaveProperty("error", "Failed to update prefix");
    });
  });
});
