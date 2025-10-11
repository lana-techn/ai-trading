import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Cache cleared',
    timestamp: new Date().toISOString()
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}
