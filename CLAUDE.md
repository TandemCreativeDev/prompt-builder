# Prompt Builder Project Context

## Project Summary

- Next.js project with TypeScript and Tailwind CSS
- Purpose: Creating, managing, and tracking AI prompts
- Backend functionality and API routes implementation complete

## Completed Tasks (3 of 9)

1. **Task 1**: Initial project setup (completed before our conversation)

   - Next.js with TypeScript and Tailwind CSS set up
   - Basic project structure established

2. **Task 2**: Core functionality implementation

   - Added type definitions for prompts and history in `/src/types/prompts.ts` and `/src/types/history.ts`
   - Created ID generation utilities in `/src/lib/id-generator.ts`
   - Implemented file I/O utilities for prompts in `/src/lib/prompts-io.ts`
   - Implemented file I/O utilities for history in `/src/lib/history-io.ts`
   - Added comprehensive tests for all utilities

3. **Task 3**: API routes implementation
   - Created REST API endpoints for prefixes, suffixes, phases, and history
   - Added validation and error handling
   - Implemented route handlers with proper HTTP methods
   - Added middleware for phase-related routes
   - Created tests for all API endpoints
   - Added Swagger documentation and README for the API
   - Set up proper data structure in `/data/` directory

## Remaining Tasks (6 of 9)

4. **Task 4**: Prompt Store UI Implementation
   Task: Build the UI for the Prompt Store, including panels for prefixes, suffixes, and phase prompts, and implement inline editing with history.
   Instructions:
1. Create separate React components for each panel: PrefixPanel, SuffixPanel, and PhasePromptPanel.
1. Implement filtering functionality by tags for the prefix and suffix panels.
1. For inline editing:
   - Allow users to click a prompt to edit it.
   - Provide options to update for the current session or persist the change (with logging to the prompt’s `history_log`).
   - Include a confirmation modal before reverting to a previous version.
1. Document each component with JSDoc comments and provide function signatures (e.g., `function PrefixPanel(props: PrefixPanelProps): JSX.Element`).
1. Write component tests using React Testing Library to verify:

   - Proper rendering of prompt items.
   - Functionality of inline editing and history logging.
     References: [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro).
     Deliverable: Functional UI components for the Prompt Store with tests and inline documentation.

1. **Task 5**: Prompt Builder UI Implementation
   Task: Create the Prompt Builder UI for assembling the final prompt.
   Instructions:
1. Develop a layout that includes:
   - Top panel for Phase Prompts (with placeholders to be filled by the user).
   - Bottom panels: Left for Prefix, Centre for Main Text, and Right for Suffix.
   - Action buttons between the panels: "Generate" (with Ctrl+Enter) and "Tidy with AI and Generate" (with Ctrl+T+Enter).
   - A separate output box to display the generated prompt along with a copy button.
1. Implement keyboard shortcuts that open dropdowns for:
   - `/` for general prompt options.
   - `#` for phase prompts.
   - `$` for prefix prompts.
   - `@` for suffix prompts.
1. Document each UI component and maintain clear separation of concerns using functional components (e.g., `function MainTextArea(props: { value: string, onChange: (val: string) => void }): JSX.Element`).
1. Write integration tests to verify:

   - Correct assembly order of components.
   - Functionality of keyboard shortcuts.
   - Proper display of the generated prompt.
     References: [Next.js Component Patterns](https://nextjs.org/docs/basic-features/pages) and [shadcn/ui Documentation](https://ui.shadcn.com/).
     Deliverable: Fully functional Prompt Builder UI components integrated with clear documentation and tests.

1. **Task 6**: AI-Refinement API Endpoint
   Task: Develop the `/api/generate` endpoint that interacts with the OpenAI API for refining prompt text.
   Instructions:
1. Create an API route at `/api/generate` that:
   - Accepts a POST request with a payload containing the main text and any other prompt components as needed.
   - Calls the OpenAI API to refine the main text (for the "Tidy with AI" functionality).
   - Returns the AI-refined version of the prompt.
1. Validate incoming request data and ensure API keys are securely accessed via environment variables.
1. Implement error handling to return appropriate HTTP status codes (e.g., 400 for bad requests, 500 for internal errors).
1. Document the endpoint with expected request and response schemas.
1. Write tests (using Jest and Supertest) to simulate:

   - A successful API call with valid data.
   - Error scenarios such as missing data or API failures.
     Documentation: Refer to [OpenAI API Documentation](https://platform.openai.com/docs/api-reference/introduction) and [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction).
     Function Signature Example:
   - `export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> { ... }`
     Deliverable: A robust API endpoint for AI prompt refinement with complete tests and inline documentation.

1. **Task 7**: Prompt Assembly & History Logging
   Task: Implement the prompt assembly function and integrate history logging.
   Instructions:
1. Create a function `assemblePrompt` that concatenates the following in order:
   - Selected prefix (from the PrefixPanel)
   - Phase prompt (with filled placeholders)
   - Main text (user-provided text)
   - Selected suffix (from the SuffixPanel)
1. Define the function signature:
   - `function assemblePrompt(prefix: string, phase: string, mainText: string, suffix: string): string`
1. Implement a function `logGeneratedPrompt` that appends the generated prompt along with metadata (e.g., timestamp, user input, AI-refined text, and references to the fragments) to `prompt_history.json`.
1. Write unit tests to:

   - Ensure that the assembly function concatenates components in the correct order.
   - Validate that history entries are logged correctly with all required fields.
     Documentation: Use [Jest Documentation](https://jestjs.io/docs/getting-started) for testing guidance.
     Deliverable: A working prompt assembly function and history logging mechanism with comprehensive unit tests and inline code documentation.

1. **Task 8**: End-to-End Integration & Testing
   Task: Integrate all UI components and API routes, then perform end-to-end testing of the full workflow.
   Instructions:
1. Combine the Prompt Store and Prompt Builder UIs, ensuring that:
   - The user can select and edit prompt fragments.
   - The assembled prompt is generated and displayed correctly.
   - The "Tidy with AI" functionality calls the `/api/generate` endpoint and returns the refined prompt.
1. Set up Cypress tests to simulate the following scenarios:
   - User selects prompt fragments, enters main text, and generates a prompt.
   - Inline editing updates the prompt fragments and the changes reflect across the UI.
   - Generated prompts are correctly logged in history and can be restored.
1. Ensure error states (e.g., API failures) are handled gracefully and notifications are displayed.
   Documentation: Refer to [Cypress Documentation](https://docs.cypress.io/) for test implementation.
   Deliverable: A fully integrated system with comprehensive end-to-end tests covering the entire user workflow.

1. **Task 9**: Deployment & Security Measures
   Task: Prepare the application for deployment on Vercel and implement basic security and rate limiting.
   Instructions:
1. Configure environment variables for secure storage of the OpenAI API key.
1. Implement basic rate limiting on sensitive API routes (e.g., `/api/generate`) to prevent abuse.
1. Write documentation on deployment steps and best practices for securing Next.js API routes.
1. Verify the deployment process on Vercel with a staging environment, ensuring that file persistence and API endpoints work as expected.
   Documentation: Refer to [Vercel Deployment Documentation](https://vercel.com/docs) and [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers).
   Deliverable: A deployed and secure version of the application with detailed documentation and tests confirming secure behavior.

## Key Components

- **Types**: `/src/types/prompts.ts`, `/src/types/history.ts`
- **Utilities**: ID generation, prompts and history I/O
- **API Endpoints**: Prefixes, suffixes, phases, and history
- **Data Storage**: JSON files in `/data/` directory

## Implementation Details

### Data Structures

- **Prompt Phase**: Core building block of prompts with ID, title, description, and content
- **Prompt Prefix/Suffix**: Reusable components that can be added to phases
- **History Record**: Tracks prompt usage with timestamp, content, and response

### API Routes

- `/api/prompts/phases`: Manage prompt phases
- `/api/prompts/phases/[phaseId]`: CRUD operations for specific phases
- `/api/prompts/prefixes`: Manage prompt prefixes
- `/api/prompts/suffixes`: Manage prompt suffixes
- `/api/history`: Track and retrieve prompt usage history

### File Structure

- `/data/phases.json`: Contains list of all phases with metadata
- `/data/phases/[id].json`: Individual phase content files
- `/data/prefixes.json`: Prefix definitions
- `/data/suffixes.json`: Suffix definitions
- `/data/history.json`: Usage history records

## Development Process

- Systematic, atomic commits for each functional area
- Test-driven development for all components
- RESTful API design principles followed
- Comprehensive validation and error handling
- Data stored in JSON files with proper file I/O utilities
