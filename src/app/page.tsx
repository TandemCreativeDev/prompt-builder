export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <main className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6">
          AI-Assisted Prompt Repository & Generator
        </h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full mb-6">
          <h2 className="text-2xl font-semibold mb-4">Hello World!</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            This is a Next.js project with TypeScript, Tailwind CSS, and shadcn/ui components.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Check out the API route at <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">/api/hello</code>
          </p>
        </div>
        <div className="flex gap-4">
          <a 
            href="https://nextjs.org/docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Next.js Docs
          </a>
          <a 
            href="https://tailwindcss.com/docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            Tailwind Docs
          </a>
          <a 
            href="https://ui.shadcn.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            shadcn/ui Docs
          </a>
        </div>
      </main>
    </div>
  );
}
