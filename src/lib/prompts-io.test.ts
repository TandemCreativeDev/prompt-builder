import { promises as fs } from "fs";
import {
  updatePrefix,
  updateSuffix,
  updatePhasePrompt,
  readPhasesConfig,
} from "./prompts-io";
import { PromptFragment } from "@/types/prompts";

// Mock the fs module
jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn().mockResolvedValue(undefined),
  },
}));

describe("Prompts I/O Utilities", () => {
  const mockPromptFragment: PromptFragment = {
    id: "123",
    text: "Always consider edge cases when coding.",
    tags: ["best practices", "coding"],
    associated_model_type: "thinking",
    rating: 4.5,
    uses: 10,
    last_used: "2025-03-16",
    created_by: "user1",
    ai_version_compatibility: ["ChatGPT-4o", "Claude 3.5"],
    length: 56,
    deprecated: false,
    history_log: [
      {
        timestamp: "2025-03-17T12:00:00Z",
        text: "Give an in-depth technical breakdown:",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Error handling", () => {
    it("should handle errors when reading phases config", async () => {
      const error = new Error("Read error");
      (fs.readFile as jest.Mock).mockRejectedValue(error);

      await expect(readPhasesConfig()).rejects.toThrow("Read error");
    });

    it("should throw an error when updating a non-existent prefix", async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ prefixes: [] })
      );

      await expect(updatePrefix(mockPromptFragment)).rejects.toThrow(
        `Prefix with id ${mockPromptFragment.id} not found`
      );
    });

    it("should throw an error when updating a non-existent suffix", async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ suffixes: [] })
      );

      await expect(updateSuffix(mockPromptFragment)).rejects.toThrow(
        `Suffix with id ${mockPromptFragment.id} not found`
      );
    });

    it("should throw an error when updating a non-existent phase prompt", async () => {
      const phaseId = "1";
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ prompts: [] })
      );

      await expect(
        updatePhasePrompt(phaseId, mockPromptFragment)
      ).rejects.toThrow(
        `Prompt with id ${mockPromptFragment.id} not found in phase ${phaseId}`
      );
    });
  });
});
