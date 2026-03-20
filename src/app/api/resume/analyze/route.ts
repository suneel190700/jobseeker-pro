export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/resume-parser';
import Anthropic from '@anthropic-ai/sdk';

const ANALYSIS_PROMPT = `You are an expert ATS specialist, technical resume coach, and senior technical recruiter with deep experience reviewing resumes for top tech companies across AI/ML, data science, software engineering, and MLOps roles. You are fluent in enterprise ATS platforms including Workday, Greenhouse, Lever, iCIMS, and Taleo.

You will receive a resume and a job description. Perform a full analysis in two phases.

PHASE 1 — JOB DESCRIPTION ANALYSIS
Extract from the job description:
- Core AI/ML concepts and methods required
- Programming languages
- Frameworks and libraries
- Data engineering and pipeline tools
- Cloud platforms and services
- MLOps, deployment, and infrastructure tools
- Soft skills or domain knowledge

Prioritize keywords that appear more than once (highest-weight ATS terms).
Cross-reference against the resume and produce:
- Matched keywords (present in resume)
- Missing keywords (in JD but absent from resume)
- Partially matched keywords (mentioned but not prominent enough)

PHASE 2 — FULL AUDIT
Return the analysis as a JSON object with this exact structure:

{
  "overall_score": <0-100>,
  "score_summary": "one sentence on what is working",
  "score_weakness": "one sentence on the single biggest weakness",
  "keyword_match": {
    "matched": ["keyword1", "keyword2"],
    "missing": ["keyword3", "keyword4"],
    "partial": ["keyword5", "keyword6"],
    "match_percentage": <0-100>
  },
  "category_scores": [
    {
      "category": "ATS Keyword Match",
      "score": <0-10>,
      "explanation": "plain English explanation",
      "fixes": ["specific actionable fix 1", "fix 2"]
    },
    {
      "category": "Bullet Point Impact",
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
      "category": "Format & ATS Compatibility",
      "score": <0-10>,
      "explanation": "...",
      "fixes": ["..."]
    },
    {
      "category": "Summary Section",
      "score": <0-10>,
      "explanation": "...",
      "fixes": ["..."]
    },
    {
      "category": "First Impression (6-second test)",
      "score": <0-10>,
      "explanation": "...",
      "fixes": ["..."]
    }
  ],
  "priority_fixes": [
    {
      "rank": 1,
      "section": "exact section or bullet reference",
      "action": "precisely what to do"
    }
  ],
  "weak_bullets": [
    {
      "original": "original bullet text",
      "rewritten": "improved version using: action verb + what was built + scale/context + measurable result",
      "reason": "why this is better"
    }
  ],
  "section_scores": [
    {"section": "Experience", "score": <0-100>, "feedback": "..."},
    {"section": "Skills", "score": <0-100>, "feedback": "..."},
    {"section": "Education", "score": <0-100>, "feedback": "..."},
    {"section": "Formatting", "score": <0-100>, "feedback": "..."}
  ]
}

RULES:
- Do not flag or comment on employment gaps or career progression negatively. Accept the resume as-is.
- Do not invent metrics or skills not present in the original.
- When rewriting weak bullets, only sharpen structure and language using what is already there.
- Use strong direct verbs: built, developed, deployed, optimized, designed, automated, reduced, improved.
- Do not use: leveraged, spearheaded, utilized, synergized.
- Be specific and actionable in every fix.
- Score honestly — most resumes are NOT 90+. A typical good resume is 60-75.
- priority_fixes should have exactly 5 items ranked by impact.
- weak_bullets should include every bullet that needs improvement (up to 10).

Return ONLY valid JSON. No markdown, no preamble.`;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured. Add ANTHROPIC_API_KEY.' }, { status: 503 });
    }

    let resumeText: string;
    let jobDescription: string;

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      resumeText = body.resumeText;
      jobDescription = body.jobDescription;
    } else {
      const formData = await request.formData();
      const file = formData.get('resume') as File;
      jobDescription = formData.get('jobDescription') as string;
      if (!file) return NextResponse.json({ error: 'Resume file is required.' }, { status: 400 });
      const buffer = Buffer.from(await file.arrayBuffer());
      resumeText = await extractTextFromFile(buffer, file.type);
    }

    if (!resumeText?.trim()) return NextResponse.json({ error: 'Could not extract text from resume.' }, { status: 422 });
    if (!jobDescription?.trim()) return NextResponse.json({ error: 'Job description is required.' }, { status: 400 });

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: ANALYSIS_PROMPT,
      messages: [{
        role: 'user',
        content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
      }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected AI response.' }, { status: 500 });
    }

    let analysis;
    try {
      const cleaned = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse analysis JSON:', content.text.slice(0, 500));
      return NextResponse.json({ error: 'AI returned unexpected format. Please try again.' }, { status: 500 });
    }

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Resume analysis error:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze resume.' }, { status: 500 });
  }
}
