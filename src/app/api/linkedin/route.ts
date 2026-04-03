export const dynamic = 'force-dynamic';
import { trackAICall } from "@/lib/track-usage";
import { NextRequest, NextResponse } from 'next/server';
import { callAI, parseJSON, smartTruncate } from '@/lib/ai-router';

export async function POST(request: NextRequest) {
  try {
    const { resumeText, targetRoles } = await request.json();
    if (!resumeText?.trim()) return NextResponse.json({ error: 'Resume required.' }, { status: 400 });
    const roles = targetRoles?.length > 0 ? `Target: ${targetRoles.join(', ')}` : '';
    trackAICall().catch(() => {}); // fire and forget
    const text = await callAI({ tier: 'cheap', system: `LinkedIn optimization expert. Return ONLY JSON: {"headline":"max 220 chars keyword-rich","about":"3-4 paragraphs first person max 2000 chars","skills":["top 15 skills"],"tips":["3 tips"]}. No buzzwords. ${roles}`, user: `RESUME:\n${resumeText}` });
    return NextResponse.json(parseJSON(text));
  } catch (error: any) { console.error('LinkedIn error:', error); return NextResponse.json({ error: error.message || 'Failed.' }, { status: 500 }); }
}
