'use client';

import { useEffect, useState } from 'react';
import 'swagger-ui/dist/swagger-ui.css';

/**
 * Page component for displaying the API documentation using Swagger UI
 */
export default function ApiDocs() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import SwaggerUI only on client-side
    const initSwaggerUI = async () => {
      const { default: SwaggerUI } = await import('swagger-ui');
      SwaggerUI({
        dom_id: '#swagger-ui',
        url: '/api/docs',
        presets: [
          SwaggerUI.presets.apis,
          SwaggerUI.SwaggerUIStandalonePreset,
        ],
        layout: 'BaseLayout',
        deepLinking: true,
      });
      setIsLoaded(true);
    };

    if (!isLoaded) {
      initSwaggerUI();
    }
  }, [isLoaded]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Prompt Builder API Documentation</h1>
      <div id="swagger-ui" />
    </div>
  );
}