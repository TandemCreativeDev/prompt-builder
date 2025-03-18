# AI-Assisted Prompt Repository & Generator

This project is a Next.js TypeScript web application that serves as a prompt repository and generator specifically tailored for an AI-assisted software development process. It is designed to be used with [the process](PROCESS.md) for AI-assisted development.

## Features

- **Prompt Store:** A repository for storing and managing prompt fragments (prefixes, suffixes, and phase prompts) along with their metadata and edit histories.
- **Prompt Builder:** A UI for composing a complete prompt by combining stored prompt fragments with user-typed input, with options for inline editing, AI-assisted tidying, and history management.

## Tech Stack

- **Frontend Framework:** Next.js with TypeScript
- **Styling/UI:** Tailwind CSS and [shadcn/ui](https://ui.shadcn.com/) for components and toast notifications
- **Serverless API:** Next.js API routes for handling requests to the OpenAI API
- **Data Storage:** JSON files for storing prompt fragments and generated prompt history

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

Run the test suite with:

```bash
npm test
```

## Documentation References

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
