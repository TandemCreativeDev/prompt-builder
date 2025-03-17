import { promises as fs } from "fs";
import { readHistory, writeHistory, DEFAULT_HISTORY_DATA } from "./history-io";
import { PromptHistoryData } from "../types/history";

// Mock the fs module
jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock the path module
jest.mock("path", () => ({
  join: jest.fn().mockReturnValue("/mock/path/to/prompt_history.json"),
  dirname: jest.fn().mockReturnValue("/mock/path/to"),
}));

describe("History I/O Utilities", () => {
  const mockHistoryData: PromptHistoryData = {
    entries: [
      {
        id: "456",
        timestamp: "2025-03-17T14:30:00Z",
        user_text: "Explain how React hooks work",
        ai_refined_text:
          "Please provide a detailed explanation of how React hooks work, including useState and useEffect",
        prefix_id: "123",
        suffix_id: "789",
        phase_prompt_id: "234",
        phase_number: "2",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("readHistory", () => {
    it("should read and parse history from the file system", async () => {
      // Mock successful file read
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify(mockHistoryData)
      );

      const result = await readHistory();

      expect(fs.readFile).toHaveBeenCalledWith(
        "/mock/path/to/prompt_history.json",
        "utf-8"
      );
      expect(result).toEqual(mockHistoryData);
    });

    it("should create default history data if file does not exist", async () => {
      // Mock file not found error
      const error = new Error("File not found") as NodeJS.ErrnoException;
      error.code = "ENOENT";
      (fs.readFile as jest.Mock).mockRejectedValue(error);

      const result = await readHistory();

      expect(fs.writeFile).toHaveBeenCalled();
      expect(result).toEqual(DEFAULT_HISTORY_DATA);
    });

    it("should throw error for other file system errors", async () => {
      // Mock permission denied error
      const error = new Error("Permission denied") as NodeJS.ErrnoException;
      error.code = "EACCES";
      (fs.readFile as jest.Mock).mockRejectedValue(error);

      await expect(readHistory()).rejects.toThrow("Permission denied");
    });
  });

  describe("writeHistory", () => {
    it("should write history data to the file system", async () => {
      await writeHistory(mockHistoryData);

      expect(fs.mkdir).toHaveBeenCalledWith("/mock/path/to", {
        recursive: true,
      });
      expect(fs.writeFile).toHaveBeenCalledWith(
        "/mock/path/to/prompt_history.json",
        JSON.stringify(mockHistoryData, null, 2),
        "utf-8"
      );
    });

    it("should handle file system errors", async () => {
      // Mock permission denied error
      const error = new Error("Permission denied");
      (fs.writeFile as jest.Mock).mockRejectedValue(error);

      await expect(writeHistory(mockHistoryData)).rejects.toThrow(
        "Permission denied"
      );
    });
  });
});
