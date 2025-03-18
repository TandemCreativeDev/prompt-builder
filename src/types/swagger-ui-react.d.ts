declare module "swagger-ui-react" {
  import React from "react";

  export interface SwaggerUIProps {
    url?: string;
    spec?: object;
    layout?: string;
    filter?: boolean | string | ((tagName: string) => boolean);
    validatorUrl?: string | null;
    docExpansion?: "list" | "full" | "none";
    defaultModelsExpandDepth?: number;
    displayOperationId?: boolean;
    deepLinking?: boolean;
    tryItOutEnabled?: boolean;
    requestInterceptor?: (tagName: string) => boolean;
    responseInterceptor?: (tagName: string) => boolean;
    onComplete?: (tagName: string) => boolean;
    showMutatedRequest?: boolean;
    presets?: Array<unknown>;
    plugins?: Array<unknown>;
  }

  const SwaggerUI: React.FC<SwaggerUIProps>;

  export default SwaggerUI;
}
