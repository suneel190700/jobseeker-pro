export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'AI not configured.' }, { status: 503 });
    const { resumeText, jobDescription, jobTitle, companyName, type } = await request.json();
    if (!resumeText?.trim() || !jobDescription?.trim()) return NextResponse.json({ error: 'Resume and JD required.' }, { status: 400 });

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    let sys = '';
    if (type === 'questions') {
      sys = `Generate interview questions for this role. Return JSON: {"behavioral":[{"question":"","why_asked":"","tip":""}],"technical":[{"question":"","why_asked":"","tip":""}],"system_design":[{"question":"","why_asked":"","tip":""}],"role_specific":[{"question":"","why_asked":"","tip":""}]}. 3-4 per category, specific to the JD. ONLY JSON.`;
    } else if (type === 'star') {
      sys = `Convert resume bullets to STAR stories. Return JSON: {"stories":[{"title":"","relevant_for":"","situation":"","task":"","action":"","result":"","keywords":[""]}]}. 5-8 stories. ONLY JSON.`;
    } else {
      sys = `Company research brief. Return JSON: {"company_overview":"","recent_news":"topics to research","culture_values":[""],"interview_talking_points":[""],"questions_to_ask":[""],"red_flags_to_watch":[""]}. ONLY JSON.`;
    }
    const msg = await anthropic.messages.create({ model: 'claude-sonnet-4-20250514', max_tokens: 3000, system: sys, messages: [{ role: 'user', content: `RESUME:\n${resumeText.slice(0,3000)}\nJOB: ${jobTitle||'role'} at ${companyName||'company'}\nJD:\n${jobDescription.slice(0,3000)}` }] });
    const c = msg.content[0]; if (c.type !== 'text') return NextResponse.json({ error: 'Unexpected.' }, { status: 500 });
    return NextResponse.json(JSON.parse(c.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
