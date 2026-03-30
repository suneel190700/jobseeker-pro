export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { callAI, parseJSON } from '@/lib/ai-router';

export async function POST(request: NextRequest) {
  try {
    const { company, jobTitle } = await request.json();
    if (!company) return NextResponse.json({ error: 'Company required' }, { status: 400 });
    const text = await callAI({
      tier: 'cheap',
      system: 'You are a career research assistant. Return ONLY valid JSON with company research brief.',
      user: `Research this company for an interview. Company: ${company}. Role: ${jobTitle || 'N/A'}.
Return JSON: {"overview":"2-3 sentence company summary","industry":"","size":"","culture":"key culture points","recent_news":"recent developments","interview_tips":["tip1","tip2","tip3"],"questions_to_ask":["q1","q2","q3"],"values":["value1","value2"],"tech_stack":["tech1","tech2"],"glassdoor_rating":"estimated"}`,
      maxTokens: 2000
    });
    return NextResponse.json(parseJSON(text));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
