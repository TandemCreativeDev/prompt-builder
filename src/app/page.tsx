import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <main className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6">
          AI-Assisted Prompt Repository & Generator
        </h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Welcome to Prompt Builder
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            A tool for creating, managing, and tracking AI prompts.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            This application allows you to:
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
            <li>Manage prompt fragments (prefixes, suffixes, phase prompts)</li>
            <li>Assemble complete prompts from these fragments</li>
            <li>Track prompt history and usage</li>
            <li>Refine prompts with AI assistance</li>
          </ul>
        </div>
        <div className="flex gap-6">
          <Link
            href="/builder"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
          >
            Prompt Builder
          </Link>
          <Link
            href="/api-docs"
            className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
          >
            API Docs
          </Link>
        </div>
      </main>
    </div>
  );
}
