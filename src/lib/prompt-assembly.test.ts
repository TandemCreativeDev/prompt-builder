import { assemblePrompt, logGeneratedPrompt } from "./prompt-assembly";
import * as historyIO from "./history-io";
import * as idGenerator from "./id-generator";

// Mock the dependent modules
jest.mock("./history-io");
jest.mock("./id-generator");

describe("Prompt Assembly Functions", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("assemblePrompt", () => {
    it("should concatenate all parts with proper spacing", () => {
      const result = assemblePrompt(
        "This is a prefix.",
        "This is a phase prompt.",
        "This is the main text.",
        "This is a suffix."
      );

      expect(result).toBe(
        "This is a prefix.\n\n" +
          "This is a phase prompt.\n\n" +
          "This is the main text.\n\n" +
          "This is a suffix."
      );
    });

    it("should handle empty or whitespace-only parts", () => {
      const result = assemblePrompt(
        "This is a prefix.",
        "",
        "  ",
        "This is a suffix."
      );

      expect(result).toBe("This is a prefix.\n\n" + "This is a suffix.");
    });

    it("should trim whitespace from all parts", () => {
      const result = assemblePrompt(
        "  This is a prefix.  ",
        "  This is a phase prompt.  ",
        "  This is the main text.  ",
        "  This is a suffix.  "
      );

      expect(result).toBe(
        "This is a prefix.\n\n" +
          "This is a phase prompt.\n\n" +
          "This is the main text.\n\n" +
          "This is a suffix."
      );
    });
  });

  describe("logGeneratedPrompt", () => {
    it("should create a history entry and add it to history", async () => {
      // Mock the necessary functions - return an array directly instead of an object with entries
      const mockHistoryData = [{ id: "existing-entry" }];

      (historyIO.readHistory as jest.Mock).mockResolvedValue(mockHistoryData);
      (idGenerator.generateHistoryId as jest.Mock).mockReturnValue(
        "new-history-id"
      );

      // Mock date for consistent testing
      const mockDate = new Date("2023-01-01T12:00:00Z");
      jest.spyOn(global, "Date").mockImplementation(() => mockDate);

      const result = await logGeneratedPrompt(
        "User text",
        "AI refined text",
        ["prefix-id"],
        ["suffix-id"],
        "phase-prompt-id",
        "5"
      );

      // Verify the result
      expect(result).toEqual({
        id: "new-history-id",
        timestamp: "2023-01-01T12:00:00.000Z",
        user_text: "User text",
        ai_refined_text: "AI refined text",
        prefix_ids: ["prefix-id"],
        suffix_ids: ["suffix-id"],
        phase_prompt_id: "phase-prompt-id",
        phase_number: "5",
      });

      // Verify writeHistory was called with the right data - an array, not an object with entries
      expect(historyIO.writeHistory).toHaveBeenCalledWith([
        { id: "existing-entry" },
        {
          id: "new-history-id",
          timestamp: "2023-01-01T12:00:00.000Z",
          user_text: "User text",
          ai_refined_text: "AI refined text",
          prefix_ids: ["prefix-id"],
          suffix_ids: ["suffix-id"],
          phase_prompt_id: "phase-prompt-id",
          phase_number: "5",
        },
      ]);
    });

    it("should handle optional parameters", async () => {
      // Mock the necessary functions - return an empty array
      (historyIO.readHistory as jest.Mock).mockResolvedValue([]);
      (idGenerator.generateHistoryId as jest.Mock).mockReturnValue(
        "new-history-id"
      );

      // Create a fixed date to use in testing
      const fixedISOString = "2023-01-01T12:00:00.000Z";

      // Mock the Date constructor and toISOString
      jest.spyOn(global, "Date").mockImplementation(() => {
        return {
          toISOString: () => fixedISOString,
        } as unknown as Date;
      });

      // Call with only required parameters
      const result = await logGeneratedPrompt("User text only");

      // Verify the result
      expect(result).toEqual({
        id: "new-history-id",
        timestamp: fixedISOString,
        user_text: "User text only",
      });

      // Verify writeHistory was called with the right data - an array
      expect(historyIO.writeHistory).toHaveBeenCalledWith([
        {
          id: "new-history-id",
          timestamp: fixedISOString,
          user_text: "User text only",
        },
      ]);
    });
  });
});
