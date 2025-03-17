# Prompt Builder API Documentation

This directory contains the API routes for the Prompt Builder application. The API provides endpoints for managing prompt fragments (prefixes, suffixes, and phase-specific prompts) as well as prompt generation history.

## API Overview

The API is organized into the following main sections:

### Prompt Management

- `/api/prompts/prefixes` - Endpoints for managing prefix prompts
- `/api/prompts/suffixes` - Endpoints for managing suffix prompts
- `/api/prompts/phases` - Endpoint for retrieving phase configuration
- `/api/prompts/phases/{phaseId}` - Endpoints for managing phase-specific prompts

### History Management

- `/api/history` - Endpoints for managing prompt generation history

## API Documentation

Complete API documentation is available in OpenAPI/Swagger format at `/api/swagger.yaml`.

To view the API documentation in a user-friendly UI:

1. Import the `swagger.yaml` file into a Swagger UI tool like:
   - [Swagger Editor](https://editor.swagger.io/)
   - [SwaggerHub](https://app.swaggerhub.com/)
   - Install a Swagger UI browser extension

2. Or use the Swagger UI provided by Next.js Swagger documentation tools:
   - Install a package like `swagger-ui-react`
   - Configure a UI documentation page in your Next.js app

## HTTP Methods

The API uses standard HTTP methods:

- `GET` - Retrieve data
- `POST` - Create new data
- `PUT` - Update existing data

## Request and Response Formats

All API endpoints accept and return JSON data. Common response formats include:

- Success responses: Include the requested data with appropriate HTTP status codes (200 for GET, 201 for POST)
- Error responses: Include an error message and appropriate HTTP status code (400, 404, 500)

## Error Handling

The API provides consistent error responses with:
- Clear error messages
- Appropriate HTTP status codes
- Additional context where appropriate (e.g., valid phase IDs for phase-related errors)

## Authentication

Authentication is not currently implemented but could be added in future versions.

## API Testing

All API endpoints have corresponding Jest tests in the `.test.ts` files alongside each route file. The tests cover:

- Successful operations
- Error handling
- Edge cases

Run tests using the Jest test runner with:

```bash
npm test
```