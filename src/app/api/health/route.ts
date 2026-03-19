import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const checks: Record<string, string> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };

  // Verify env vars are set (don't leak values)
  checks.supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing';
  checks.anthropic = process.env.ANTHROPIC_API_KEY ? 'configured' : 'missing';
  checks.rapidapi = process.env.RAPIDAPI_KEY ? 'configured' : 'missing';

  const allConfigured = Object.values(checks).every((v) => v !== 'missing');

  return NextResponse.json(checks, {
    status: allConfigured ? 200 : 503,
  });
}
