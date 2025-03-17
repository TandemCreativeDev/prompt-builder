import { GET } from "./route";
import { readPhasesConfig } from "@/lib/prompts-io";

// Mock the prompts-io module
jest.mock("@/lib/prompts-io", () => ({
  readPhasesConfig: jest.fn(),
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

describe("/api/prompts/phases", () => {
  const mockPhasesConfig = {
    phases: [
      {
        id: "1",
        name: "Conception",
        description: "Conceive and workshop idea with AI to produce a spec",
      },
      {
        id: "2",
        name: "Design & Architecture",
        description: "Design high-level architecture and component interactions",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should return phases configuration with status 200 on success", async () => {
      (readPhasesConfig as jest.Mock).mockResolvedValue(mockPhasesConfig);

      const response = await GET();
      const data = await response.json();

      expect(readPhasesConfig).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(data).toEqual(mockPhasesConfig);
    });

    it("should return error with status 500 on failure", async () => {
      (readPhasesConfig as jest.Mock).mockRejectedValue(new Error("Test error"));

      const response = await GET();
      const data = await response.json();

      expect(readPhasesConfig).toHaveBeenCalled();
      expect(response.status).toBe(500);
      expect(data).toHaveProperty("error", "Failed to read phases configuration");
    });
  });
});