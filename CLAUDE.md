# Prompt Builder Project Context

## Project Summary

- Next.js project with TypeScript and Tailwind CSS
- Purpose: Creating, managing, and tracking AI prompts
- Backend functionality and API routes implementation complete

## Completed Tasks (4 of 9)

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

4. **Task 4**: Prompt Store UI Implementation

- **Goal:** Build the UI for managing prompt fragments.
- **Tasks:**
  - Create components for listing prefixes, suffixes, and phase prompts.
  - Implement filtering by tags/categories.
  - Build inline editing components with edit history and reversion functionality.
- **Testing:** Write component tests with React Testing Library to verify editing, filtering, and history logging.
- **References:** [React Testing Library](https://testing-library.com/docs/react-testing-library/intro).

## Remaining Tasks (5 of 9)

5. **Task 5**: Prompt Builder UI Implementation

- **Goal:** Develop the UI for assembling the final prompt.
- **Tasks:**
  - Build the main text area, action buttons (Generate, Tidy with AI and Generate), and panels for prefix, phase prompt, and suffix.
  - Implement keyboard shortcuts (e.g., `/`, `#`, `$`, `@`) for triggering dropdowns.
- **Testing:** Create integration tests to ensure that prompt components assemble correctly.
- **References:** [Next.js Components](https://nextjs.org/docs/basic-features/pages), [shadcn/ui Documentation](https://ui.shadcn.com/).

6. **Task 6**: AI-Refinement API Endpoint

- **Goal:** Create an API route (`/api/generate`) that interacts with the OpenAI API for prompt refinement.
- **Tasks:**
  - Build the endpoint with proper request validation, error handling, and environment variable usage for API keys.
  - Define the function signature and error responses.
- **Testing:** Write tests to simulate API calls and validate both success and failure scenarios.
- **References:** [OpenAI API Documentation](https://platform.openai.com/docs/api-reference/introduction).

7. **Task 7**: Prompt Assembly & History Logging

- **Goal:** Implement functions to assemble the final prompt and log generated prompts.
- **Tasks:**
  - Create a function that concatenates the selected prefix, phase prompt (with placeholders filled), main text, and suffix.
  - Log every generated prompt to `prompt_history.json` with appropriate metadata.
- **Testing:** Write unit tests for the assembly function and history logging.
- **References:** [Jest Documentation](https://jestjs.io/docs/getting-started).

8. **Task 8**: End-to-End Integration & Testing

- **Goal:** Validate the full user workflow from prompt selection to generation and history logging.
- **Tasks:**
  - Integrate UI components with API endpoints.
  - Use end-to-end testing tools (e.g., Cypress) to simulate user interactions.
- **Testing:** Define scenarios that cover every use case, including error handling and keyboard shortcuts.
- **References:** [Cypress Documentation](https://docs.cypress.io/).

9. **Task 9**: Deployment & Security Measures

- **Goal:** Prepare the application for deployment on Vercel, ensuring secure management of API keys and rate limiting.
- **Tasks:**
  - Configure environment variables for secure API key management.
  - Add basic rate limiting to API routes.
- **Testing:** Verify deployment on a staging environment and test production error handling.
- **References:** [Vercel Deployment Docs](https://vercel.com/docs).

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
