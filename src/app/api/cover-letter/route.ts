export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'AI not configured.' }, { status: 503 });

    const { resumeText, jobDescription, jobTitle, companyName, tone } = await request.json();
    if (!resumeText?.trim() || !jobDescription?.trim()) return NextResponse.json({ error: 'Resume and JD required.' }, { status: 400 });

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const toneGuide = tone === 'formal' ? 'Use a formal, corporate tone.' : tone === 'enthusiastic' ? 'Use an enthusiastic, energetic tone while remaining professional.' : 'Use a confident, professional tone.';

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: `You are an expert cover letter writer. Write a compelling, ATS-friendly cover letter.

RULES:
- 3-4 paragraphs, under 400 words
- Opening: Hook + specific role + why this company
- Body: 2-3 specific achievements from resume that align with JD requirements. Use numbers and metrics from the resume.
- Closing: Call to action + enthusiasm
- ${toneGuide}
- Do NOT start with "I am writing to apply" — use a stronger opening
- Do NOT use: leverage, synergy, spearhead, utilize
- Do NOT fabricate any experience or metrics
- Reference the company by name
- Keep it concise and impactful

Return ONLY a JSON object:
{
  "cover_letter": "the full cover letter text",
  "subject_line": "email subject line for the application"
}

No markdown, no preamble.`,
      messages: [{ role: 'user', content: `RESUME:\n${resumeText.slice(0, 3000)}\n\nJOB: ${jobTitle || 'the role'} at ${companyName || 'the company'}\n\nJOB DESCRIPTION:\n${jobDescription.slice(0, 3000)}` }],
    });

    const content = message.content[0];
    if (content.type !== 'text') return NextResponse.json({ error: 'Unexpected response.' }, { status: 500 });
    const cleaned = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return NextResponse.json(JSON.parse(cleaned));
  } catch (error: any) {
    console.error('Cover letter error:', error);
    return NextResponse.json({ error: error.message || 'Failed.' }, { status: 500 });
  }
}
