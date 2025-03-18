# Prompt Store UI Components

This directory contains UI components for the Prompt Builder's prompt store feature.

## Main Components

### PromptStore
The main component that integrates all panels. It provides:
- Tab navigation between different prompt types
- State management for selections
- Event handlers for all prompt operations

### PromptItem
A reusable component for displaying individual prompt items with:
- Display of prompt metadata like tags, usage count, etc.
- Inline editing capabilities
- History viewing and version restoration
- Selection mechanism

### Panel Components

- **PrefixPanel**: Displays and manages prefix prompts with filtering capabilities
- **SuffixPanel**: Displays and manages suffix prompts with filtering capabilities
- **PhasePromptPanel**: Displays and manages phase prompts with phase-based tab navigation

## Testing

For testing UI components, run:

```bash
npm run test:ui
```

Note: UI component tests require additional setup and mocking for shadcn components. These tests are separated from the main test suite to avoid conflicts.

## Usage

To use the Prompt Store in a page, import and use it as follows:

```jsx
import { PromptStore } from '@/components/PromptStore';

export default function PromptStorePage() {
  // Fetch data and set up handlers
  
  return (
    <div>
      <PromptStore
        prefixesData={prefixesData}
        suffixesData={suffixesData}
        phasesConfig={phasesConfig}
        phasePromptsMap={phasePromptsMap}
        onSelectPrefix={handleSelectPrefix}
        onSelectSuffix={handleSelectSuffix}
        onSelectPhasePrompt={handleSelectPhasePrompt}
        onUpdatePrefix={handleUpdatePrefix}
        onUpdateSuffix={handleUpdateSuffix}
        onUpdatePhasePrompt={handleUpdatePhasePrompt}
      />
    </div>
  );
}
```

## Component Structure

```
components/
├── PromptStore.tsx       # Main container component
├── panels/
│   ├── PromptItem.tsx    # Reusable prompt item component
│   ├── PrefixPanel.tsx   # Panel for prefix prompts
│   ├── SuffixPanel.tsx   # Panel for suffix prompts
│   ├── PhasePromptPanel.tsx # Panel for phase prompts
│   └── __tests__/        # Unit tests for panel components
└── __tests__/            # Tests for the main PromptStore component
```