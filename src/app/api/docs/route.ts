import { NextResponse } from 'next/server';
import { getApiDocs } from '@/lib/swagger';

/**
 * GET handler for the API documentation route
 * @returns Swagger specification JSON
 */
export function GET() {
  const spec = getApiDocs();
  return NextResponse.json(spec);
}