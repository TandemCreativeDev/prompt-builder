import React from "react";

/**
 * Layout for the API documentation page
 */
export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="api-docs-layout">{children}</div>;
}

export const metadata = {
  title: "Prompt Builder API Documentation",
  description: "API documentation for the Prompt Builder application",
};
