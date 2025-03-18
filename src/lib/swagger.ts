import { createSwaggerSpec } from 'next-swagger-doc';
import path from 'path';
import fs from 'fs';

/**
 * Generate the Swagger specification from the API specification document
 */
export const getApiDocs = () => {
  const apiYamlPath = path.join(process.cwd(), 'src/app/api/swagger.yaml');
  const apiYaml = fs.readFileSync(apiYamlPath, 'utf8');

  const spec = createSwaggerSpec({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Prompt Builder API',
        version: '1.0.0',
        description: 'API for managing prompt fragments and history in the Prompt Builder application',
      },
    },
    apiFolder: 'src/app/api',
    schemaFolders: ['src/types'],
  });
  
  return spec;
};