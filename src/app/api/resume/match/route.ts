export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 503 });
    }

    const { resumeText, jobs } = await request.json();

    if (!resumeText || !jobs || !Array.isArray(jobs)) {
      return NextResponse.json({ error: 'resumeText and jobs array required' }, { status: 400 });
    }

    // Build a batch prompt for efficiency — score all jobs in one call
    const jobList = jobs
      .slice(0, 10) // Max 10 jobs per batch
      .map((j: any, i: number) => `JOB_${i}: ${j.title} at ${j.company}\n${(j.description || '').slice(0, 300)}`)
      .join('\n\n');

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `You are a job matching expert. Score how well the resume matches each job on a scale of 0-100.
Return ONLY a JSON array of objects: [{"index": 0, "score": 75, "reason": "one short sentence"}]
Return one entry per job. Be realistic — most scores should be 30-85. Return ONLY valid JSON, no markdown.`,
      messages: [{
        role: 'user',
        content: `RESUME:\n${resumeText.slice(0, 3000)}\n\nJOBS:\n${jobList}`,
      }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ scores: [] });
    }

    const cleaned = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const scores = JSON.parse(cleaned);

    return NextResponse.json({ scores });
  } catch (error: any) {
    console.error('Match scoring error:', error);
    return NextResponse.json({ scores: [], error: error.message }, { status: 500 });
  }
}
