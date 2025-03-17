import {
  generatePromptId,
  generatePhasePromptId,
  generateHistoryId,
} from "./id-generator";

// Mock uuid to return predictable values
jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue("00000000-0000-0000-0000-000000000000"),
}));

describe("ID Generator", () => {
  describe("generatePromptId", () => {
    it("should generate a unique ID", () => {
      expect(generatePromptId()).toBe("00000000-0000-0000-0000-000000000000");
    });
  });

  describe("generatePhasePromptId", () => {
    it("should generate a phase-specific ID with prefix", () => {
      expect(generatePhasePromptId(1)).toBe("p1_00000000");
      expect(generatePhasePromptId(3)).toBe("p3_00000000");
      expect(generatePhasePromptId(7)).toBe("p7_00000000");
    });

    it("should throw an error for invalid phase numbers", () => {
      expect(() => generatePhasePromptId(0)).toThrow(
        "Phase must be a positive integer"
      );
      expect(() => generatePhasePromptId(-1)).toThrow(
        "Phase must be a positive integer"
      );
      expect(() => generatePhasePromptId(1.5)).toThrow(
        "Phase must be a positive integer"
      );
    });
  });

  describe("generateHistoryId", () => {
    it("should generate a history ID with prefix", () => {
      expect(generateHistoryId()).toBe("hist_00000000");
    });
  });
});
