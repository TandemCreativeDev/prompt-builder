'use client';

import { useEffect, useState } from 'react';
import 'swagger-ui-dist/swagger-ui.css';

/**
 * Page component for displaying the API documentation using Swagger UI
 */
export default function ApiDocs() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import SwaggerUI only on client-side
    const initSwaggerUI = async () => {
      try {
        // Import the standalone bundle instead of the module
        const SwaggerUIBundle = await import('swagger-ui-dist/swagger-ui-bundle.js');
        const SwaggerUIStandalonePreset = await import('swagger-ui-dist/swagger-ui-standalone-preset.js');
        
        SwaggerUIBundle.default({
          dom_id: '#swagger-ui',
          url: '/api/docs',
          presets: [
            SwaggerUIBundle.default.presets.apis,
            SwaggerUIStandalonePreset.default
          ],
          layout: 'BaseLayout',
          deepLinking: true,
        });
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to initialize Swagger UI:", error);
      }
    };

    if (!isLoaded) {
      initSwaggerUI();
    }

    // Cleanup
    return () => {
      const swaggerUiContainer = document.getElementById('swagger-ui');
      if (swaggerUiContainer) {
        swaggerUiContainer.innerHTML = '';
      }
    };
  }, [isLoaded]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Prompt Builder API Documentation</h1>
      <div id="swagger-ui" />
    </div>
  );
}