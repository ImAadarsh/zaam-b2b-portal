import { NextResponse } from 'next/server';

/** Catalog is served by zaam-api /api/b2b/catalog/* — this Next route is intentionally not a mock fallback. */
export async function GET() {
  return NextResponse.json(
    {
      error: {
        message: 'Use NEXT_PUBLIC_ZAAM_API_URL B2B catalog endpoints with retailer auth. This local mock catalog route is disabled.'
      }
    },
    { status: 410 }
  );
}
