import { NextResponse } from "next/server";
import { readPhasesConfig } from "@/lib/prompts-io";

/**
 * GET handler for phases API
 * Returns the phases configuration
 */
export async function GET() {
  try {
    const data = await readPhasesConfig();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error reading phases config:", error);
    return NextResponse.json(
      { error: "Failed to read phases configuration" },
      { status: 500 }
    );
  }
}
