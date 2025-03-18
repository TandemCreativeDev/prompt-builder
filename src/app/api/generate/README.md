# Generate API Endpoint Documentation

This endpoint interacts with the OpenAI API to refine and tidy prompt text.

## Overview

- **Endpoint:** `/api/generate`
- **Method:** POST
- **Description:** Sends text to OpenAI for refinement and tidying, preserving the original meaning and intent while improving clarity and conciseness.

## Request Format

```json
{
  "mainText": "Text to be refined by the AI",
  "model": "gpt-4o", // Optional, defaults to gpt-4o
  "temperature": 0.7, // Optional, defaults to 0.7 (range 0-2)
  "maxTokens": 1000 // Optional, defaults to 1000
}
```

### Required Fields

- `mainText`: String - The text content to be refined or tidied by the AI.

### Optional Fields

- `model`: String - The OpenAI model to use (defaults to "gpt-4o").
- `temperature`: Number - Controls randomness (0-2, default: 0.7).
- `maxTokens`: Number - Maximum tokens to generate (default: 1000).

## Response Format

```json
{
  "refinedText": "AI-refined version of the input text",
  "model": "Model name that was used",
  "metadata": {
    "completionTokens": 123,
    "promptTokens": 456,
    "totalTokens": 579
  }
}
```

### Success Response Fields

- `refinedText`: String - The refined/tidied version of the input text.
- `model`: String - The model that was used for generation.
- `metadata`: Object - Usage statistics:
  - `completionTokens`: Number - Tokens used for completion.
  - `promptTokens`: Number - Tokens used for the prompt.
  - `totalTokens`: Number - Total tokens used.

## Error Responses

### 400 Bad Request

Returned for invalid request parameters or payload.

```json
{
  "error": "Error message explaining the validation issue"
}
```

### 500 Internal Server Error

Returned for server issues or OpenAI API errors.

```json
{
  "error": "Error message explaining the server or OpenAI API issue"
}
```

## Environment Variables

This API endpoint requires an OpenAI API key to be set in the environment:

- `OPENAI_API_KEY`: Your OpenAI API key.

You can create a .env.local file in the project root with this variable:

```
OPENAI_API_KEY=your_openai_api_key_here
```

### Testing Without an API Key

For testing without exposing your API key:

1. For unit tests, the endpoint is configured to use mock responses when running in test mode.
2. For manual testing without an API key, the endpoint will return a descriptive error with a 500 status code explaining that the API key is missing.
3. For production, ensure the `OPENAI_API_KEY` is properly set in your environment or deployment platform (e.g., Vercel environment variables).

## Example Usage

### Request

```javascript
const response = await fetch("/api/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    mainText: "This is a rough text that should be improved and tidied up.",
  }),
});

const data = await response.json();
```

### Response

```json
{
  "refinedText": "This is a refined and improved version of the text.",
  "model": "gpt-4o",
  "metadata": {
    "completionTokens": 15,
    "promptTokens": 24,
    "totalTokens": 39
  }
}
```
