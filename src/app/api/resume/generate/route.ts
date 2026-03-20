export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const REWRITE_PROMPT = `You are an expert ATS resume writer optimizing for real ATS systems (Workday, Greenhouse, Lever, iCIMS, Taleo).

BASE RULES:
- Use original resume as source of truth. Keep same companies, titles, dates.
- Do NOT invent experience, metrics, or skills.
- Rewrite bullets to align with JD. Preserve real metrics.

KEYWORD INTEGRATION:
- Integrate missing high-weight JD keywords naturally into Summary, Skills, Experience.
- Each high-weight keyword should appear 2-3 times across the resume.
- Match JD terminology exactly (not synonyms).

BULLET RULES:
Every bullet: Action verb + technology/method + scale/context + measurable result
- Use: built, developed, deployed, optimized, designed, automated, reduced, improved
- Do NOT use: leveraged, spearheaded, utilized, synergized
- No em dashes. Hyphen bullets only.
- Every bullet needs at least one number/metric where original supports it.

ATS FORMATTING:
- Standard headers ONLY: Professional Summary, Technical Skills, Professional Experience, Education, Certifications
- No tables, columns, graphics, icons
- Consistent date format: Month YYYY
- Contact info at very top
- Single column layout

POST-GENERATION VALIDATION:
Before returning, verify:
1. All high-weight JD keywords are present (check each one)
2. Every bullet starts with a strong action verb
3. Every bullet has a metric or scale indicator
4. Standard section headers used
5. Dates are consistent format
6. Contact info is complete

Return JSON:
{
  "name": "Full Name",
  "email": "email",
  "phone": "phone",
  "location": "City, State",
  "linkedin": "url or empty",
  "github": "url or empty",
  "summary": "3-4 line summary, keyword-rich, no 'I', matches target role",
  "skills": ["skill1", "skill2"],
  "experience": [{"company": "", "title": "", "location": "", "dates": "Month YYYY - Month YYYY", "bullets": [""]}],
  "education": [{"institution": "", "degree": "", "dates": "", "details": ""}],
  "certifications": [""],
  "ats_match_summary": {
    "estimated_score": <number targeting 90+>,
    "matched_keywords": ["kw1"],
    "missing_keywords": ["kw1"],
    "validation": {
      "all_keywords_present": true/false,
      "all_bullets_have_action_verbs": true/false,
      "all_bullets_have_metrics": true/false,
      "standard_headers": true,
      "consistent_dates": true,
      "contact_complete": true
    },
    "suggestions": ["if any issues remain"]
  }
}

Return ONLY valid JSON.`;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'AI not configured.' }, { status: 503 });
    const { resumeText, jobDescription, jobTitle } = await request.json();
    if (!resumeText?.trim() || !jobDescription?.trim()) return NextResponse.json({ error: 'Resume and JD required.' }, { status: 400 });

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514', max_tokens: 4096, system: REWRITE_PROMPT,
      messages: [{ role: 'user', content: `ORIGINAL RESUME:\n${resumeText}\n\nTARGET JOB${jobTitle ? ` (${jobTitle})` : ''}:\n${jobDescription}` }],
    });

    const content = message.content[0];
    if (content.type !== 'text') return NextResponse.json({ error: 'Unexpected response.' }, { status: 500 });
    const cleaned = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return NextResponse.json({ resume: JSON.parse(cleaned) });
  } catch (error: any) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: error.message || 'Failed.' }, { status: 500 });
  }
}
