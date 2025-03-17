import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Hello from the API!',
      status: 'success',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}