import { middleware } from "./middleware";
import { readPhasesConfig } from "@/lib/prompts-io";
import { NextResponse } from "next/server";

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
    next: jest.fn().mockReturnValue({ type: "next" }),
  },
}));

describe("Phases API Middleware", () => {
  const mockPhasesConfig = {
    phases: [
      { id: "1", name: "Phase 1", description: "Description 1" },
      { id: "2", name: "Phase 2", description: "Description 2" },
    ],
  };

  const createMockRequest = (pathname: string) => {
    return {
      nextUrl: {
        pathname,
      },
    } as any;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should allow requests with valid phase IDs", async () => {
    (readPhasesConfig as jest.Mock).mockResolvedValue(mockPhasesConfig);
    const req = createMockRequest("/api/prompts/phases/1");

    const result = await middleware(req);

    expect(readPhasesConfig).toHaveBeenCalled();
    expect(NextResponse.next).toHaveBeenCalled();
    expect(result).toEqual({ type: "next" });
  });

  it("should reject requests with invalid phase IDs", async () => {
    (readPhasesConfig as jest.Mock).mockResolvedValue(mockPhasesConfig);
    const req = createMockRequest("/api/prompts/phases/999");

    const result = await middleware(req);

    expect(readPhasesConfig).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Phase 999 not found in configuration",
        validPhases: ["1", "2"],
      }),
      { status: 404 }
    );
  });

  it("should handle errors when reading phases config", async () => {
    (readPhasesConfig as jest.Mock).mockRejectedValue(new Error("Test error"));
    const req = createMockRequest("/api/prompts/phases/1");

    const result = await middleware(req);

    expect(readPhasesConfig).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Error accessing phase configuration",
      }),
      { status: 500 }
    );
  });

  it("should let non-phase-specific requests pass through", async () => {
    const req = createMockRequest("/api/prompts/phases");

    const result = await middleware(req);

    expect(readPhasesConfig).not.toHaveBeenCalled();
    expect(NextResponse.next).toHaveBeenCalled();
    expect(result).toEqual({ type: "next" });
  });
});