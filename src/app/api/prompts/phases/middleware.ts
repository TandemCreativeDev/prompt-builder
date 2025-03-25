import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readPhasesConfig } from "../../../../lib/prompts-io";

/**
 * Middleware that runs before API requests
 * Used to validate phase IDs in phase-specific routes
 */
export async function middleware(request: NextRequest) {
  // Check if the request is for a phase-specific API route
  const phaseRouteMatch = request.nextUrl.pathname.match(
    /^\/api\/prompts\/phases\/([^\/]+)$/
  );

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

  // Continue with the request
  return NextResponse.next();
}

/**
 * Configure which paths the middleware runs on
 */
export const config = {
  matcher: "/api/prompts/phases/:phaseId*",
};
