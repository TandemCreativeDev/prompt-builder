import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readPhasesConfig } from "@/lib/prompts-io";
import fs from "fs";
import path from "path";

/**
 * Checks if a data file exists for the given API path
 * @param apiPath The API path to check
 * @returns Whether the data file exists
 */
function dataFileExists(apiPath: string): boolean {
  // Extract the filepath from the API path
  const apiPrefixRegex = /^\/api\/prompts\//;
  if (!apiPrefixRegex.test(apiPath)) {
    return false;
  }

  const relativePath = apiPath.replace(apiPrefixRegex, "");
  if (!relativePath) {
    // Root prompts endpoint is always valid
    return true;
  }

  // Check if the corresponding JSON file exists
  const dataPath = path.join(process.cwd(), "data", `${relativePath}.json`);
  return fs.existsSync(dataPath);
}

/**
 * Middleware that runs before API requests
 * Used to validate routes and parameters
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip if this is not a prompts API route
  if (!pathname.startsWith("/api/prompts/")) {
    return NextResponse.next();
  }

  // Check if the request is for a phase-specific API route
  const phaseRouteMatch = pathname.match(/^\/api\/prompts\/phases\/([^\/]+)$/);

  if (phaseRouteMatch) {
    const phaseId = phaseRouteMatch[1];

    try {
      // Get the valid phases from the configuration
      const phasesConfig = await readPhasesConfig();
      const validPhaseIds = phasesConfig.map((phase) => phase.id);

      // If the phase ID is not valid, return a 404 response
      if (!validPhaseIds.includes(phaseId)) {
        console.error(
          `Phase ${phaseId} not found in configuration. Valid phases: ${validPhaseIds.join(
            ", "
          )}`
        );
        return NextResponse.json(
          {
            error: `Phase ${phaseId} not found in configuration`,
            validPhases: validPhaseIds,
            message: `Please use one of the valid phase IDs: ${validPhaseIds.join(
              ", "
            )}`,
          },
          { status: 404 }
        );
      }
    } catch (error) {
      console.error("Error validating phase ID:", error);
      // Return a more helpful error response instead of continuing
      return NextResponse.json(
        {
          error: "Error accessing phase configuration",
          message:
            "There was an error checking the phase ID against the configuration. Please ensure phases.json is properly configured.",
        },
        { status: 500 }
      );
    }
  }

  // Check if the API path corresponds to an existing data file
  if (!dataFileExists(pathname)) {
    // If it's the root API endpoint, let it through (it will list available paths)
    if (pathname === "/api/prompts") {
      return NextResponse.next();
    }

    // For other paths, check if data file exists
    console.error(`Data file not found for API path: ${pathname}`);
    return NextResponse.json(
      {
        error: "Resource not found",
        message: `No data file exists for ${pathname}`,
      },
      { status: 404 }
    );
  }

  // For valid routes, continue with the request
  return NextResponse.next();
}

/**
 * Configure which paths the middleware runs on
 */
export const config = {
  matcher: "/api/prompts/:filepath*",
};
