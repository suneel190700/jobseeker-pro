export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ scores: [], error: 'AI not configured' }, { status: 503 });
    }

    const { resumeText, jobs } = await request.json();

    if (!resumeText || !jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json({ error: 'resumeText and jobs array required' }, { status: 400 });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Build job list — include full description for better scoring
    const jobList = jobs
      .slice(0, 10)
      .map((j: any, i: number) => {
        const desc = (j.description || '').slice(0, 500);
        return `JOB_${i}: "${j.title}" at ${j.company}\n${desc}`;
      })
      .join('\n---\n');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: `You are a senior technical recruiter evaluating resume-to-job fit.

For each job, assess how well the candidate's SPECIFIC experience, skills, and seniority level match the role. Consider:
- Direct skill overlap (tools, languages, frameworks they've actually used)
- Seniority/experience level match
- Domain relevance (e.g., healthcare AI vs general AI)
- Missing critical requirements
- Culture/role type fit

Scoring guide:
- 85-95: Exceptional fit, candidate checks almost every box
- 70-84: Strong fit, most key requirements met
- 50-69: Moderate fit, some relevant skills but gaps exist  
- 30-49: Weak fit, significant skill or experience gaps
- 10-29: Poor fit, fundamentally different role/domain

Be discriminating. NOT every AI job is a 90% match for an AI engineer. A "Content Manager at OpenAI" is NOT a strong match for an ML Engineer.

Return ONLY a JSON array: [{"index": 0, "score": 72, "reason": "one specific sentence explaining the score"}]
One entry per job. Return ONLY valid JSON, no markdown.`,
      messages: [{
        role: 'user',
        content: `CANDIDATE RESUME (summarized):\n${resumeText.slice(0, 2500)}\n\nJOBS TO SCORE:\n${jobList}`,
      }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ scores: [] });
    }

    let scores;
    try {
      const cleaned = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      scores = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse AI match scores:', content.text.slice(0, 200));
      return NextResponse.json({ scores: [] });
    }

    return NextResponse.json({ scores });
  } catch (error: any) {
    console.error('Match scoring error:', error);
    return NextResponse.json({ scores: [], error: error.message }, { status: 500 });
  }
}
