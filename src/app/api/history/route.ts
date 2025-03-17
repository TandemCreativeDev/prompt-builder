import { NextResponse } from "next/server";
import { readHistory, writeHistory } from "@/lib/history-io";
import { PromptHistoryEntry } from "@/types/history";
import { generateHistoryId } from "@/lib/id-generator";

/**
 * GET handler for history API
 * Returns all history entries from the prompt_history.json file
 */
export async function GET() {
  try {
    const data = await readHistory();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error reading history:", error);
    return NextResponse.json(
      { error: "Failed to read history data" },
      { status: 500 }
    );
  }
}

/**
 * POST handler for history API
 * Adds a new history entry to the prompt_history.json file
 */
export async function POST(request: Request) {
  try {
    // Get current history data
    const historyData = await readHistory();

    // Parse the new entry from the request
    const newEntry = (await request.json()) as Omit<
      PromptHistoryEntry,
      "id" | "timestamp"
    >;

    // Add id and timestamp to the new entry
    const completeEntry: PromptHistoryEntry = {
      ...newEntry,
      id: generateHistoryId(),
      timestamp: new Date().toISOString(),
    };

    // Add the new entry to the history
    historyData.entries.push(completeEntry);

    // Save the updated history
    await writeHistory(historyData);

    // Return the newly created entry
    return NextResponse.json(completeEntry, { status: 201 });
  } catch (error) {
    console.error("Error adding history entry:", error);
    return NextResponse.json(
      { error: "Failed to add history entry" },
      { status: 500 }
    );
  }
}
