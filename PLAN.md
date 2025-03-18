# Implementation Plan

## Comprehensive Blueprint

### 1. Project Initialization & Environment Setup
- **Goal:** Initialize a Next.js project using TypeScript, configure Tailwind CSS, and integrate shadcn/ui.
- **Tasks:**
  - Set up a new Next.js project.
  - Install and configure Tailwind CSS.
  - Integrate shadcn/ui for component styling and toast notifications.
  - Prepare the project structure to support serverless API routes.
- **Testing:** Confirm that the project builds and runs a simple “Hello World” page; verify that API routes can be accessed.
- **References:** [Next.js Documentation](https://nextjs.org/docs), [Tailwind CSS Docs](https://tailwindcss.com/docs).

### 2. Data Model & File Storage Design
- **Goal:** Define TypeScript interfaces for prompt fragments and prompt history. Create JSON files (`prompts.json` and `prompt_history.json`) for data persistence.
- **Tasks:**
  - Create interfaces for prefixes, suffixes, phase prompts, and history log entries.
  - Write utility functions to read and write JSON files.
- **Testing:** Write unit tests to ensure correct parsing and writing of JSON data.
- **References:** [TypeScript Handbook](https://www.typescriptlang.org/docs/), [Node.js File System API](https://nodejs.org/api/fs.html).

### 3. API Routes for Data Persistence
- **Goal:** Develop Next.js serverless API routes to handle CRUD operations on prompt fragments and history.
- **Tasks:**
  - Implement API endpoints (e.g., `/api/prompts`, `/api/history`).
  - Ensure proper error handling and validations.
- **Testing:** Use Jest and Supertest to validate API responses and error conditions.
- **References:** [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction).

### 4. Prompt Store UI Implementation
- **Goal:** Build the UI for managing prompt fragments.
- **Tasks:**
  - Create components for listing prefixes, suffixes, and phase prompts.
  - Implement filtering by tags/categories.
  - Build inline editing components with edit history and reversion functionality.
- **Testing:** Write component tests with React Testing Library to verify editing, filtering, and history logging.
- **References:** [React Testing Library](https://testing-library.com/docs/react-testing-library/intro).

### 5. Prompt Builder UI Implementation
- **Goal:** Develop the UI for assembling the final prompt.
- **Tasks:**
  - Build the main text area, action buttons (Generate, Tidy with AI and Generate), and panels for prefix, phase prompt, and suffix.
  - Implement keyboard shortcuts (e.g., `/`, `#`, `$`, `@`) for triggering dropdowns.
- **Testing:** Create integration tests to ensure that prompt components assemble correctly.
- **References:** [Next.js Components](https://nextjs.org/docs/basic-features/pages), [shadcn/ui Documentation](https://ui.shadcn.com/).

### 6. AI-Refinement API Endpoint
- **Goal:** Create an API route (`/api/generate`) that interacts with the OpenAI API for prompt refinement.
- **Tasks:**
  - Build the endpoint with proper request validation, error handling, and environment variable usage for API keys.
  - Define the function signature and error responses.
- **Testing:** Write tests to simulate API calls and validate both success and failure scenarios.
- **References:** [OpenAI API Documentation](https://platform.openai.com/docs/api-reference/introduction).

### 7. Prompt Assembly & History Logging
- **Goal:** Implement functions to assemble the final prompt and log generated prompts.
- **Tasks:**
  - Create a function that concatenates the selected prefix, phase prompt (with placeholders filled), main text, and suffix.
  - Log every generated prompt to `prompt_history.json` with appropriate metadata.
- **Testing:** Write unit tests for the assembly function and history logging.
- **References:** [Jest Documentation](https://jestjs.io/docs/getting-started).

### 8. End-to-End Integration & Testing
- **Goal:** Validate the full user workflow from prompt selection to generation and history logging.
- **Tasks:**
  - Integrate UI components with API endpoints.
  - Use end-to-end testing tools (e.g., Cypress) to simulate user interactions.
- **Testing:** Define scenarios that cover every use case, including error handling and keyboard shortcuts.
- **References:** [Cypress Documentation](https://docs.cypress.io/).

### 9. Deployment & Security
- **Goal:** Prepare the application for deployment on Vercel, ensuring secure management of API keys and rate limiting.
- **Tasks:**
  - Configure environment variables for secure API key management.
  - Add basic rate limiting to API routes.
- **Testing:** Verify deployment on a staging environment and test production error handling.
- **References:** [Vercel Deployment Docs](https://vercel.com/docs).

---

## Iterative Prompts for Code-Generation LLM (Using TDD)

Below are the iterative prompts for each development phase. Each prompt is self-contained, builds on previous steps, and includes detailed instructions, function signatures, and documentation references.

---

### Prompt 1: Project Initialization & Environment Setup

```text
Task: Initialize a new Next.js project using TypeScript, configure Tailwind CSS, and integrate shadcn/ui.
Instructions:
1. Create a new Next.js project with TypeScript using the command: 
   `npx create-next-app@latest --typescript`
2. Install Tailwind CSS following the official [Tailwind CSS Next.js guide](https://tailwindcss.com/docs/guides/nextjs).
3. Integrate shadcn/ui components by installing the required packages and setting up the necessary configurations.
4. Create a basic "Hello World" page and a simple API route (e.g., `/api/hello`) to verify serverless functions work.
5. Write a basic README.md that describes the project purpose and references the Next.js and Tailwind CSS documentation.
Deliverable: A working Next.js project that compiles, serves a styled page, and has a functioning API route.
TDD: Create a simple unit test that checks the API route response returns status 200 and expected JSON data.
```

---

### Prompt 2: Data Model & File Storage Design

```text
Task: Define TypeScript interfaces for prompt fragments and implement file I/O functions for JSON storage.
Instructions:
1. Create TypeScript interfaces for:
   - Prompt Fragment (with properties such as id, text, tags, rating, uses, last_used, created_by, ai_version_compatibility, length, deprecated, history_log).
   - History Log Entry (with properties: timestamp, text).
2. Define a separate interface for phase prompts (grouped by phases as an object with keys "1" to "6").
3. Create utility functions:
   - `readPrompts(): Promise<PromptsData>` to read `prompts.json`.
   - `writePrompts(data: PromptsData): Promise<void>` to write updates to `prompts.json`.
4. Write unit tests (using Jest) to ensure the JSON file is correctly parsed and written.
Documentation: Reference the [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) and [Node.js fs module](https://nodejs.org/api/fs.html).
Function Signatures:
   - `async function readPrompts(): Promise<PromptsData> { ... }`
   - `async function writePrompts(data: PromptsData): Promise<void> { ... }`
Deliverable: TypeScript interfaces and file I/O utility functions with accompanying unit tests.
```

---

### Prompt 3: API Routes for Data Persistence

```text
Task: Create Next.js API routes to handle CRUD operations on prompt fragments and history.
Instructions:
1. Create an API route at `/api/prompts` to support GET (retrieve prompts), POST (add new prompt), and PUT (update an existing prompt with history logging).
2. Create a separate API route at `/api/history` for logging and retrieving prompt generation history.
3. Each API route must validate the incoming request data and handle errors gracefully.
4. Document the expected request and response schemas.
5. Write Jest tests with Supertest to verify:
   - Successful retrieval of prompts.
   - Correct error handling when provided invalid data.
Documentation: Refer to [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) and [Jest Supertest Documentation](https://jestjs.io/).
Function Signature Example for `/api/prompts`:
   - `export default async function handler(req: NextApiRequest, res: NextApiResponse) { ... }`
Deliverable: API route implementations and tests for CRUD operations.
```

---

### Prompt 4: Prompt Store UI Implementation

```text
Task: Build the UI for the Prompt Store, including panels for prefixes, suffixes, and phase prompts, and implement inline editing with history.
Instructions:
1. Create separate React components for each panel: PrefixPanel, SuffixPanel, and PhasePromptPanel.
2. Implement filtering functionality by tags for the prefix and suffix panels.
3. For inline editing:
   - Allow users to click a prompt to edit it.
   - Provide options to update for the current session or persist the change (with logging to the prompt’s `history_log`).
   - Include a confirmation modal before reverting to a previous version.
4. Document each component with JSDoc comments and provide function signatures (e.g., `function PrefixPanel(props: PrefixPanelProps): JSX.Element`).
5. Write component tests using React Testing Library to verify:
   - Proper rendering of prompt items.
   - Functionality of inline editing and history logging.
References: [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro).
Deliverable: Functional UI components for the Prompt Store with tests and inline documentation.
```

---

### Prompt 5: Prompt Builder UI Implementation

```text
Task: Create the Prompt Builder UI for assembling the final prompt.
Instructions:
1. Develop a layout that includes:
   - Top panel for Phase Prompts (with placeholders to be filled by the user).
   - Bottom panels: Left for Prefix, Centre for Main Text, and Right for Suffix.
   - Action buttons between the panels: "Generate" (with Ctrl+Enter) and "Tidy with AI and Generate" (with Ctrl+T+Enter).
   - A separate output box to display the generated prompt along with a copy button.
2. Implement keyboard shortcuts that open dropdowns for:
   - `/` for general prompt options.
   - `#` for phase prompts.
   - `$` for prefix prompts.
   - `@` for suffix prompts.
3. Document each UI component and maintain clear separation of concerns using functional components (e.g., `function MainTextArea(props: { value: string, onChange: (val: string) => void }): JSX.Element`).
4. Write integration tests to verify:
   - Correct assembly order of components.
   - Functionality of keyboard shortcuts.
   - Proper display of the generated prompt.
References: [Next.js Component Patterns](https://nextjs.org/docs/basic-features/pages) and [shadcn/ui Documentation](https://ui.shadcn.com/).
Deliverable: Fully functional Prompt Builder UI components integrated with clear documentation and tests.
```

---

### Prompt 6: AI-Refinement API Endpoint

```text
Task: Develop the `/api/generate` endpoint that interacts with the OpenAI API for refining prompt text.
Instructions:
1. Create an API route at `/api/generate` that:
   - Accepts a POST request with a payload containing the main text and any other prompt components as needed.
   - Calls the OpenAI API to refine the main text (for the "Tidy with AI" functionality).
   - Returns the AI-refined version of the prompt.
2. Validate incoming request data and ensure API keys are securely accessed via environment variables.
3. Implement error handling to return appropriate HTTP status codes (e.g., 400 for bad requests, 500 for internal errors).
4. Document the endpoint with expected request and response schemas.
5. Write tests (using Jest and Supertest) to simulate:
   - A successful API call with valid data.
   - Error scenarios such as missing data or API failures.
Documentation: Refer to [OpenAI API Documentation](https://platform.openai.com/docs/api-reference/introduction) and [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction).
Function Signature Example:
   - `export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> { ... }`
Deliverable: A robust API endpoint for AI prompt refinement with complete tests and inline documentation.
```

---

### Prompt 7: Prompt Assembly & History Logging

```text
Task: Implement the prompt assembly function and integrate history logging.
Instructions:
1. Create a function `assemblePrompt` that concatenates the following in order:
   - Selected prefix (from the PrefixPanel)
   - Phase prompt (with filled placeholders)
   - Main text (user-provided text)
   - Selected suffix (from the SuffixPanel)
2. Define the function signature:
   - `function assemblePrompt(prefix: string, phase: string, mainText: string, suffix: string): string`
3. Implement a function `logGeneratedPrompt` that appends the generated prompt along with metadata (e.g., timestamp, user input, AI-refined text, and references to the fragments) to `prompt_history.json`.
4. Write unit tests to:
   - Ensure that the assembly function concatenates components in the correct order.
   - Validate that history entries are logged correctly with all required fields.
Documentation: Use [Jest Documentation](https://jestjs.io/docs/getting-started) for testing guidance.
Deliverable: A working prompt assembly function and history logging mechanism with comprehensive unit tests and inline code documentation.
```

---

### Prompt 8: End-to-End Integration & Testing

```text
Task: Integrate all UI components and API routes, then perform end-to-end testing of the full workflow.
Instructions:
1. Combine the Prompt Store and Prompt Builder UIs, ensuring that:
   - The user can select and edit prompt fragments.
   - The assembled prompt is generated and displayed correctly.
   - The "Tidy with AI" functionality calls the `/api/generate` endpoint and returns the refined prompt.
2. Set up Cypress tests to simulate the following scenarios:
   - User selects prompt fragments, enters main text, and generates a prompt.
   - Inline editing updates the prompt fragments and the changes reflect across the UI.
   - Generated prompts are correctly logged in history and can be restored.
3. Ensure error states (e.g., API failures) are handled gracefully and notifications are displayed.
Documentation: Refer to [Cypress Documentation](https://docs.cypress.io/) for test implementation.
Deliverable: A fully integrated system with comprehensive end-to-end tests covering the entire user workflow.
```

---

### Prompt 9: Deployment & Security Measures

```text
Task: Prepare the application for deployment on Vercel and implement basic security and rate limiting.
Instructions:
1. Configure environment variables for secure storage of the OpenAI API key.
2. Implement basic rate limiting on sensitive API routes (e.g., `/api/generate`) to prevent abuse.
3. Write documentation on deployment steps and best practices for securing Next.js API routes.
4. Verify the deployment process on Vercel with a staging environment, ensuring that file persistence and API endpoints work as expected.
Documentation: Refer to [Vercel Deployment Documentation](https://vercel.com/docs) and [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers).
Deliverable: A deployed and secure version of the application with detailed documentation and tests confirming secure behavior.
```