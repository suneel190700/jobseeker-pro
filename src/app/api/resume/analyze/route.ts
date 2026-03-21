export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/resume-parser';
import Anthropic from '@anthropic-ai/sdk';

const PROMPT = `You are an expert ATS specialist and senior technical recruiter. Analyze the resume against the job description.

PHASE 1 — Extract from JD: core skills, languages, frameworks, cloud, MLOps tools, soft skills. Prioritize repeated keywords.
Cross-reference against resume: matched, missing, partially matched.

PHASE 2 — Return JSON:
{
  "overall_score": <0-100>,
  "score_summary": "one sentence on strengths",
  "score_weakness": "one sentence on biggest gap",
  "keyword_match": {
    "matched": ["kw1"],
    "missing": ["kw2"],
    "partial": ["kw3"],
    "match_percentage": <0-100>
  },
  "category_scores": [
    {"category": "ATS Keyword Match", "score": <0-10>, "explanation": "...", "fixes": ["..."]},
    {"category": "Bullet Point Impact", "score": <0-10>, "explanation": "...", "fixes": ["..."]},
    {"category": "Quantification", "score": <0-10>, "explanation": "...", "fixes": ["..."]},
    {"category": "Technical Depth", "score": <0-10>, "explanation": "...", "fixes": ["..."]},
    {"category": "Career Progression", "score": <0-10>, "explanation": "...", "fixes": ["..."]},
    {"category": "Format & ATS Compatibility", "score": <0-10>, "explanation": "...", "fixes": ["..."]},
    {"category": "Summary Section", "score": <0-10>, "explanation": "...", "fixes": ["..."]},
    {"category": "First Impression", "score": <0-10>, "explanation": "...", "fixes": ["..."]}
  ],
  "priority_fixes": [{"rank": 1, "section": "...", "action": "..."}],
  "weak_bullets": [{"original": "...", "rewritten": "...", "reason": "..."}],
  "section_scores": [
    {"section": "Experience", "score": <0-100>, "feedback": "..."},
    {"section": "Skills", "score": <0-100>, "feedback": "..."},
    {"section": "Education", "score": <0-100>, "feedback": "..."},
    {"section": "Formatting", "score": <0-100>, "feedback": "..."}
  ]
}

RULES: Do not flag employment gaps. Do not invent metrics. Score honestly — most resumes are 50-75, not 90+. 5 priority fixes. Up to 10 weak bullets. Return ONLY valid JSON.`;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'AI not configured.' }, { status: 503 });

    let resumeText: string;
    let jobDescription: string;
    const ct = request.headers.get('content-type') || '';

    if (ct.includes('application/json')) {
      const body = await request.json();
      resumeText = body.resumeText;
      jobDescription = body.jobDescription;
    } else {
      const fd = await request.formData();
      const file = fd.get('resume') as File;
      jobDescription = fd.get('jobDescription') as string;
      if (!file) return NextResponse.json({ error: 'Resume required.' }, { status: 400 });
      resumeText = await extractTextFromFile(Buffer.from(await file.arrayBuffer()), file.type);
    }

    if (!resumeText?.trim()) return NextResponse.json({ error: 'Could not extract text.' }, { status: 422 });
    if (!jobDescription?.trim()) return NextResponse.json({ error: 'JD required.' }, { status: 400 });

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514', max_tokens: 4096, system: PROMPT,
      messages: [{ role: 'user', content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}` }],
    });

    const c = msg.content[0];
    if (c.type !== 'text') return NextResponse.json({ error: 'Unexpected response.' }, { status: 500 });
    const cleaned = c.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return NextResponse.json(JSON.parse(cleaned));
  } catch (error: any) {
    console.error('Analyze error:', error);
    return NextResponse.json({ error: error.message || 'Failed.' }, { status: 500 });
  }
}
