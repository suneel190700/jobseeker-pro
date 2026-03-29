export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { callAI, parseJSON } from '@/lib/ai-router';

export async function POST(request: NextRequest) {
  try {
    const { jobTitle, location, experience } = await request.json();
    const text = await callAI({ tier: 'cheap', system: 'Return ONLY JSON: {"min":number,"max":number,"median":number,"currency":"USD","source":"estimated","notes":"brief context"}. Estimate annual salary range in USD.', user: `Role: ${jobTitle}\nLocation: ${location || 'US'}\nExperience: ${experience || 'mid-level'}` });
    return NextResponse.json(parseJSON(text));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
