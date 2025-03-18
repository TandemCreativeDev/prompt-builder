declare module 'swagger-ui-react' {
  import React from 'react';

  export interface SwaggerUIProps {
    url?: string;
    spec?: object;
    layout?: string;
    filter?: boolean | string | Function;
    validatorUrl?: string | null;
    docExpansion?: 'list' | 'full' | 'none';
    defaultModelsExpandDepth?: number;
    displayOperationId?: boolean;
    deepLinking?: boolean;
    tryItOutEnabled?: boolean;
    requestInterceptor?: Function;
    responseInterceptor?: Function;
    onComplete?: Function;
    showMutatedRequest?: boolean;
    presets?: Array<any>;
    plugins?: Array<any>;
  }

  const SwaggerUI: React.FC<SwaggerUIProps>;

  export default SwaggerUI;
}