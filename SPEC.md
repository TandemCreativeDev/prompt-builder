# AI-Assisted Prompt Repository & Generator Specification

## 1. Overview

This project is a Next.js TypeScript web application that serves as a prompt repository and generator specifically tailored for an AI-assisted software development process. The application consists of two main functions:

- **Prompt Store:** A repository for storing and managing prompt fragments (prefixes, suffixes, and phase prompts) along with their metadata and edit histories.
- **Prompt Builder:** A UI for composing a complete prompt by combining stored prompt fragments with user-typed input, with options for inline editing, AI-assisted tidying, and history management.

## 2. Technology Stack

- **Frontend Framework:** Next.js with TypeScript
- **Styling/UI:** Tailwind CSS and [shadcn/ui](https://ui.shadcn.com/) for components and toast notifications
- **Serverless API:** Next.js API routes for handling requests to the OpenAI API
- **Data Storage:** JSON files for storing prompt fragments and generated prompt history (with future potential integration to MongoDB)
- **Testing:** Jest and React Testing Library for unit and integration tests; optional end-to-end testing with Cypress

## 3. Functional Requirements

### 3.1 Prompt Store

- **Data Model:** Prompts are stored in a JSON file (`prompts.json`) with the following structure:

  ```json
  {
    "prefixes": [
      {
        "id": "123",
        "text": "Always consider edge cases when coding.",
        "tags": ["best practices", "coding"],
        "associated_model_type": "thinking",
        "rating": 4.5,
        "uses": 10,
        "last_used": "2025-03-16",
        "created_by": "user1",
        "ai_version_compatibility": ["ChatGPT-4o", "Claude 3.5"],
        "length": 56,
        "deprecated": false,
        "history_log": [
          {
            "timestamp": "2025-03-17T12:00:00Z",
            "text": "Give an in-depth technical breakdown:"
          },
          {
            "timestamp": "2025-03-16T14:45:00Z",
            "text": "Explain thoroughly:"
          }
        ]
      }
    ],
    "suffixes": [],
    "phase_prompts": {
      "1": [],
      "2": [],
      "3": [],
      "4": [],
      "5": [],
      "6": []
    }
  }
  ```

- **Edit History:**

  - Each stored prompt includes a `history_log` (an array of objects with `timestamp` and `text`) tracking previous versions.
  - **Reversion Behavior:** When a user reverts to a previous version, the current version is logged into `history_log` and the user must confirm before restoration.

- **Inline Editing:**
  - Users can click on a prompt to edit it.
  - An option is provided to either update the prompt only for the current session or save the edited version (overwriting the stored prompt) with its edit logged.

### 3.2 Prompt Builder

#### User Interface Layout

- **Top Half (Phase Prompt Panel):**

  - Displays available phase prompts for the selected process step.
  - Contains fields to fill in variable placeholders (blanks) within the phase prompt.
  - Only one phase prompt can be selected at a time; a new selection overwrites the previous one.

- **Bottom Panels:**

  - **Bottom Left (Prefix Panel):**
    - Lists stored prefix prompts.
    - Supports filtering by tags/categories.
    - Users select (via click or keyboard highlight + Enter) the prompts they want to include.
  - **Bottom Centre (Main Text Area):**
    - A text area where the user drafts the unique part of the prompt.
  - **Bottom Right (Suffix Panel):**
    - Similar to the prefix panel, it lists stored suffix prompts for selection.

- **Action Buttons:**

  - Centrally placed between the top phase prompt panel and the bottom panels.
  - Two main buttons:
    - **Generate:** Concatenates the selected prefix, main text, and suffix to form the final prompt.
      - **Shortcut:** `Ctrl+Enter`
    - **Tidy with AI and Generate:** Sends only the main text portion to the OpenAI API for refinement while keeping the stored prompts intact.
      - **Shortcut:** `Ctrl+T+Enter`
  - A separate output box is used to display the generated prompt with a copy button.

- **History Panel:**
  - A collapsible panel on the right side of the screen with a search bar.
  - Automatically logs every generated prompt in `prompt_history.json` (infinite history).
  - Users can click on history entries to load the prompt structure back into the editor or simply copy the prompt.
  - When an old prompt is loaded, it appears in the main editor for further editing before regeneration.

#### Inline Prompt Controls & Commands

- **Trigger Keys:**
  - `/` opens a dropdown with all prompt options.
  - `#` triggers phase prompt options.
  - `$` triggers prefix prompt options.
  - `@` triggers suffix prompt options.
- **Insertion:**
  - Prompts are inserted into designated panels (not directly into the main text area).
  - Selection requires confirmation (click/Enter) to insert into the UI.

### 3.3 Prompt Assembly Process

- **Order of Assembly:**
  1. **Prefix:** Selected from the bottom left panel.
  2. **Phase Prompt:** Contains placeholders (blanks) for variables; user fills in the blanks in its dedicated panel.
  3. **Main Text:** The core user-generated text from the bottom centre text area.
  4. **Suffix:** Selected from the bottom right panel.
- **Generation Options:**
  - **Standard Generate:** Concatenates the components.
  - **Tidy with AI:** Sends the main text to the OpenAI API for refinement; the stored prompts remain unchanged.
- **Output:** The final prompt appears in a separate output box with a copy button for easy pasting into any AI tool.

### 3.4 Data Persistence

- **Storage Files:**
  - `prompts.json` for storing prompt fragments (prefixes, suffixes, phase prompts) along with their edit histories.
  - `prompt_history.json` for logging all generated prompts.
    - Each history entry stores:
      - `id`
      - `timestamp`
      - `user_text` (the main text input)
      - `ai_refined_text` (if AI refinement was applied)
      - The associated prefix, suffix, and phase prompt (as references or text)
- **Update Behavior:**
  - **Prompt Fragments:** Updated via the UI with inline editing; every edit is logged in the respective prompt's `history_log`.
  - **Generated Prompts:** Appended automatically to `prompt_history.json`.

## 4. Backend & API Integration

- **API Routes:**

  - Create a serverless API route in Next.js (e.g., `/api/generate`) to handle calls to the OpenAI API.
  - **Endpoints:**
    - **/api/generate:** Receives the main text (and potentially other components) and returns the AI-refined version (for the "Tidy with AI" functionality).
  - **Error Handling:**
    - Validate incoming request data.
    - Catch errors from OpenAI API calls and return a standard error response.
    - Use toast notifications in the UI to display errors.

- **Security & Rate Limiting:**
  - Secure API keys using environment variables.
  - Optionally, implement rate limiting on the API route to prevent abuse.

## 5. Architecture & Data Handling

### 5.1 Application Architecture

- **Frontend:**

  - Built with Next.js using functional React components and TypeScript.
  - Styling handled with Tailwind CSS and shadcn/ui components for a consistent look and feel.
  - State management can be handled using React Context or a lightweight state management library if needed.

- **Backend:**
  - Serverless API routes provided by Next.js.
  - Data persistence via file I/O on JSON files (using Node.js file system APIs) with the possibility to switch to a NoSQL database (e.g., MongoDB) in the future.

### 5.2 Data Flow

- **Prompt Editing & Generation:**
  1. **UI Interaction:** Users select/edit prompts in the designated panels.
  2. **Local State Update:** The app maintains state for selected prompt fragments and user input.
  3. **Generation:** On clicking "Generate" or "Tidy with AI and Generate," the app assembles the prompt.
  4. **API Call:** For tidying, the main text is sent to the OpenAI API via a serverless route.
  5. **Output & Logging:** The final prompt is displayed and logged into `prompt_history.json`.

### 5.3 Error Handling Strategies

- **Frontend:**
  - Use toast notifications for real-time error alerts (e.g., failed API calls, invalid input).
  - Validate user inputs before submission.
- **Backend:**
  - Implement try/catch blocks around API calls.
  - Return HTTP status codes (e.g., 400 for bad requests, 500 for internal errors) with descriptive error messages.
  - Log errors server-side for troubleshooting.

## 6. Testing Plan

### 6.1 Unit Testing

- **Components:** Test individual React components (prompt panels, buttons, history panel) using Jest and React Testing Library.
- **Utility Functions:** Write unit tests for functions that handle JSON parsing, prompt assembly, and API response handling.

### 6.2 Integration Testing

- **API Endpoints:**
  - Use Jest with Supertest (or similar) to test API routes.
  - Verify successful OpenAI API calls, error responses, and proper handling of edge cases.

### 6.3 End-to-End Testing

- **E2E Tests:**
  - Consider using Cypress to simulate user flows:
    - Inserting prompt fragments
    - Generating prompts
    - Editing and reverting prompt histories
    - Using the "Tidy with AI" functionality
- **Test Scenarios:**
  - Verify that generated prompts follow the correct assembly order.
  - Ensure that history is correctly logged and can be restored.
  - Validate keyboard shortcuts and button actions.

## 7. Development & Deployment

- **Development Environment:**

  - Use a local Next.js development server.
  - Environment variables for OpenAI API keys.
  - Git for version control; consider using branches for feature development.

- **Deployment:**
  - Deploy using Vercel (recommended for Next.js projects) with serverless API support.
  - Configure build and deployment settings to include JSON file persistence (or connect to a database if migrated later).

## 8. Additional Considerations

- **Future Enhancements:**

  - Integration with MongoDB for robust storage and querying.
  - Support for multiple languages (if needed).
  - User authentication for multi-user prompt management.
  - Advanced analytics on prompt usage (e.g., popular prompts, usage trends).

- **Performance:**
  - Load only recent history entries on startup; fetch older entries on-demand.
  - Optimize file I/O operations to prevent blocking in serverless functions.
