import { GET, POST } from "./route";
import { readHistory, writeHistory } from "@/lib/history-io";
import { generateHistoryId } from "@/lib/id-generator";
import { PromptHistoryData } from "@/types/history";

// Mock the history-io module
jest.mock("@/lib/history-io", () => ({
  readHistory: jest.fn(),
  writeHistory: jest.fn(),
}));

// Mock the id-generator module
jest.mock("@/lib/id-generator", () => ({
  generateHistoryId: jest.fn(),
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

describe("/api/history", () => {
  const mockHistoryData: PromptHistoryData = {
    entries: [
      {
        id: "hist_001",
        timestamp: "2025-03-17T14:30:00Z",
        user_text: "Test user text",
        prefix_id: "123",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the Date.toISOString to return a fixed value
    jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2025-03-17T15:00:00Z");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("GET", () => {
    it("should return history data with status 200 on success", async () => {
      (readHistory as jest.Mock).mockResolvedValue(mockHistoryData);

      const response = await GET();
      const data = await response.json();

      expect(readHistory).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(data).toEqual(mockHistoryData);
    });

    it("should return error with status 500 on failure", async () => {
      (readHistory as jest.Mock).mockRejectedValue(new Error("Test error"));

      const response = await GET();
      const data = await response.json();

      expect(readHistory).toHaveBeenCalled();
      expect(response.status).toBe(500);
      expect(data).toHaveProperty("error", "Failed to read history data");
    });
  });

  describe("POST", () => {
    it("should add a new history entry and return status 201 on success", async () => {
      const newEntryData = {
        user_text: "New test entry",
        prefix_id: "456",
      };

      const newHistoryData = {
        entries: [
          ...mockHistoryData.entries,
          {
            id: "hist_002",
            timestamp: "2025-03-17T15:00:00Z",
            ...newEntryData,
          },
        ],
      };

      (readHistory as jest.Mock).mockResolvedValue(mockHistoryData);
      (writeHistory as jest.Mock).mockResolvedValue(undefined);
      (generateHistoryId as jest.Mock).mockReturnValue("hist_002");

      const request = {
        json: jest.fn().mockResolvedValue(newEntryData),
      } as unknown as Request;

      const response = await POST(request);
      const data = await response.json();

      expect(request.json).toHaveBeenCalled();
      expect(readHistory).toHaveBeenCalled();
      expect(writeHistory).toHaveBeenCalledWith(newHistoryData);
      expect(response.status).toBe(201);
      expect(data).toEqual({
        id: "hist_002",
        timestamp: "2025-03-17T15:00:00Z",
        ...newEntryData,
      });
    });

    it("should return error with status 500 on failure", async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error("Test error")),
      } as unknown as Request;

      const response = await POST(request);
      const data = await response.json();

      expect(request.json).toHaveBeenCalled();
      expect(response.status).toBe(500);
      expect(data).toHaveProperty("error", "Failed to add history entry");
    });
  });
});
