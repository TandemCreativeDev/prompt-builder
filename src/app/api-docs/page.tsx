'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import CSS for Swagger UI
import 'swagger-ui-react/swagger-ui.css';

// Dynamically import SwaggerUI React component with SSR disabled
const SwaggerUI = dynamic(
  () => import('swagger-ui-react').then((mod) => mod.default),
  { ssr: false }
);

/**
 * Page component for displaying the API documentation using Swagger UI
 */
export default function ApiDocs() {
  // Use state to track client-side rendering
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [swaggerSpec, setSwaggerSpec] = useState<any>(null);

  // Fetch the API docs directly
  useEffect(() => {
    const fetchApiDocs = async () => {
      try {
        const response = await fetch('/api/docs');
        if (!response.ok) {
          throw new Error('Failed to fetch API docs');
        }
        const data = await response.json();
        setSwaggerSpec(data);
      } catch (error) {
        console.error('Error fetching API docs:', error);
      }
    };

    if (isMounted) {
      fetchApiDocs();
    }
  }, [isMounted]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Prompt Builder API Documentation</h1>
      
      {/* Only render SwaggerUI when component is mounted on client and spec is loaded */}
      {isMounted && swaggerSpec ? (
        <SwaggerUI spec={swaggerSpec} />
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}