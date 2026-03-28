export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/resume-parser';
import { callAI, parseJSON, smartTruncate } from '@/lib/ai-router';

const PROMPT = `You are an expert ATS (Applicant Tracking System) evaluator and resume analyzer.

Analyze the resume against the job description and return ONLY a valid JSON object in the exact structure below.

STRICT OUTPUT FORMAT:
{
  "overall_score": <0-100>,
  "ats_scores": {
    "workday": <0-100>,
    "lever": <0-100>,
    "icims": <0-100>,
    "greenhouse": <0-100>
  },
  "score_summary": "one concise sentence describing strengths",
  "score_weakness": "one concise sentence describing biggest gap",
  "keyword_match": {
    "matched": ["keywords found in resume"],
    "missing": ["important keywords missing"],
    "partial": ["partially matching keywords"],
    "match_percentage": <0-100>
  },
  "category_scores": [
    {
      "category": "ATS Keywords",
      "score": <0-10>,
      "explanation": "...",
      "fixes": ["..."]
    },
    {
      "category": "Bullet Impact",
      "score": <0-10>,
      "explanation": "...",
      "fixes": ["..."]
    },
    {
      "category": "Quantification",
      "score": <0-10>,
      "explanation": "...",
      "fixes": ["..."]
    },
    {
      "category": "Technical Depth",
      "score": <0-10>,
      "explanation": "...",
      "fixes": ["..."]
    },
    {
      "category": "Career Progression",
      "score": <0-10>,
      "explanation": "...",
      "fixes": ["..."]
    },
    {
      "category": "Format & ATS",
      "score": <0-10>,
      "explanation": "...",
      "fixes": ["..."]
    },
    {
      "category": "Summary",
      "score": <0-10>,
      "explanation": "...",
      "fixes": ["..."]
    },
    {
      "category": "First Impression",
      "score": <0-10>,
      "explanation": "...",
      "fixes": ["..."]
    }
  ],
  "priority_fixes": [
    { "rank": 1, "section": "...", "action": "..." },
    { "rank": 2, "section": "...", "action": "..." },
    { "rank": 3, "section": "...", "action": "..." },
    { "rank": 4, "section": "...", "action": "..." },
    { "rank": 5, "section": "...", "action": "..." }
  ],
  "weak_bullets": [
    {
      "original": "...",
      "rewritten": "...",
      "reason": "..."
    }
  ]
}

SCORING RULES:
- Be realistic: typical scores range between 50–75 unless exceptionally strong.
- ATS scores must reflect parsing + keyword optimization differences per system.
- Keyword match must be strictly derived from job description vs resume.
- Provide exactly 8 category_scores.
- Provide exactly 5 priority_fixes ranked 1–5.
- Provide up to 10 weak_bullets (only if needed, otherwise fewer).
- Keep explanations concise but meaningful.

CRITICAL:
- Return ONLY JSON.
- No markdown, no text before or after JSON.
`;

export async function POST(request: NextRequest) {
  try {
    let resumeText: string, jobDescription: string;
    const ct = request.headers.get('content-type') || '';

    if (ct.includes('application/json')) {
      const b = await request.json();
      resumeText = b.resumeText;
      jobDescription = b.jobDescription;
    } else {
      const fd = await request.formData();
      const f = fd.get('resume') as File;
      jobDescription = fd.get('jobDescription') as string;

      if (!f) return NextResponse.json({ error: 'Resume required.' }, { status: 400 });

      resumeText = await extractTextFromFile(
        Buffer.from(await f.arrayBuffer()),
        f.type
      );
    }

    if (!resumeText?.trim())
      return NextResponse.json({ error: 'Could not extract text.' }, { status: 422 });

    if (!jobDescription?.trim())
      return NextResponse.json({ error: 'Job description required.' }, { status: 400 });

    const text = await callAI({
      tier: 'cheap',
      system: PROMPT,
      user: `RESUME:\n${smartTruncate(resumeText)}\n\nJOB DESCRIPTION:\n${smartTruncate(jobDescription)}`,
      maxTokens: 8000
    });

    try {
      return NextResponse.json(parseJSON(text));
    } catch (parseErr) {
      console.error('JSON parse failed, retrying...', parseErr);

      const text2 = await callAI({
        tier: 'cheap',
        system:
          PROMPT +
          '\n\nCRITICAL: Return ONLY a single valid JSON object. No text before or after. Keep response under 4000 tokens.',
        user: `RESUME:\n${smartTruncate(resumeText)}\n\nJOB DESCRIPTION:\n${smartTruncate(jobDescription)}`,
        maxTokens: 8000
      });

      return NextResponse.json(parseJSON(text2));
    }
  } catch (error: any) {
    console.error('Analyze error:', error);
    return NextResponse.json({ error: error.message || 'Failed.' }, { status: 500 });
  }
}