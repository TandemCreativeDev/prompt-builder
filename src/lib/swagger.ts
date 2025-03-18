import { createSwaggerSpec } from 'next-swagger-doc';
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';

/**
 * Generate the Swagger specification from the API specification document
 */
export const getApiDocs = () => {
  try {
    // Path to the Swagger YAML file
    const apiYamlPath = path.join(process.cwd(), 'src/app/api/swagger.yaml');
    
    // Read and parse the YAML file
    const apiYaml = fs.readFileSync(apiYamlPath, 'utf8');
    const apiDoc = yaml.load(apiYaml);
    
    // Return the parsed document
    return apiDoc;
  } catch (error) {
    console.error('Error loading Swagger spec:', error);
    
    // Return a minimal spec if there's an error
    return {
      openapi: '3.0.0',
      info: {
        title: 'Prompt Builder API',
        version: '1.0.0',
        description: 'API for managing prompt fragments and history in the Prompt Builder application',
      },
      paths: {}
    };
  }
};