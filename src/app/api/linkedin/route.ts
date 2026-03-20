export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'AI not configured.' }, { status: 503 });

    const { resumeText, targetRoles } = await request.json();
    if (!resumeText?.trim()) return NextResponse.json({ error: 'Resume text required.' }, { status: 400 });

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const rolesContext = targetRoles?.length > 0 ? `Target roles: ${targetRoles.join(', ')}` : 'Optimize for the candidate\'s strongest experience area.';

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: `You are a LinkedIn optimization expert and personal branding coach.

Given a resume and target roles, generate optimized LinkedIn content.

RULES:
- Headline: Max 220 chars, keyword-rich, format: "Role | Expertise | Value Prop" — no emojis
- About/Summary: 3-4 paragraphs, first person, conversational but professional, keyword-rich, include a CTA. Max 2000 chars.
- Skills: Top 15 most relevant and searchable skills for the target roles
- Headline and About should be optimized for LinkedIn search (recruiter keywords)
- Do NOT use buzzwords: leverage, synergy, passionate, guru, ninja, rockstar
- DO use: built, deployed, optimized, scaled, designed, automated

Return ONLY JSON:
{
  "headline": "optimized headline",
  "about": "optimized about section",
  "skills": ["skill1", "skill2", ...],
  "tips": ["tip1", "tip2", "tip3"]
}

No markdown.`,
      messages: [{ role: 'user', content: `RESUME:\n${resumeText.slice(0, 3000)}\n\n${rolesContext}` }],
    });

    const content = message.content[0];
    if (content.type !== 'text') return NextResponse.json({ error: 'Unexpected response.' }, { status: 500 });
    const cleaned = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return NextResponse.json(JSON.parse(cleaned));
  } catch (error: any) {
    console.error('LinkedIn error:', error);
    return NextResponse.json({ error: error.message || 'Failed.' }, { status: 500 });
  }
}
