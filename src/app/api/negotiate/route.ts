export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { callAI, parseJSON } from '@/lib/ai-router';

export async function POST(request: NextRequest) {
  try {
    const { role, company, currentOffer, targetSalary, experience, context } = await request.json();
    const text = await callAI({
      tier: 'cheap',
      system: 'You are an expert salary negotiation coach. Return ONLY valid JSON.',
      user: `Help negotiate salary. Role: ${role}. Company: ${company||'N/A'}. Current offer: ${currentOffer}. Target: ${targetSalary}. Experience: ${experience||'mid'}. Context: ${context||'none'}.
Return JSON: {"market_range":{"min":0,"max":0,"median":0},"assessment":"is the offer fair?","strategy":"overall approach","talking_points":["point1","point2","point3"],"email_template":"short negotiation email","counter_offer":"recommended counter number","risks":"what could go wrong","timing":"when to negotiate"}`,
      maxTokens: 2000
    });
    return NextResponse.json(parseJSON(text));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
