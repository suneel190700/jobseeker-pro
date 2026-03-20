export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const REWRITE_PROMPT = `You are an expert ATS resume writer. Generate a fully tailored, ATS-optimized resume based on the original resume and target job description.

BASE RULES (never violate):
- Use the original resume as the source of truth
- Keep the same companies, job titles, and dates
- Do NOT invent experience, metrics, or skills not present or clearly implied in the original
- Rewrite and sharpen bullets to align with the JD — do not fabricate
- Preserve real metrics and achievements exactly as stated
- Do not flag or comment on employment gaps

KEYWORD INTEGRATION:
- Integrate missing high-weight JD keywords naturally into Summary, Skills, and Experience
- Include related terms where appropriate (e.g., ML / AI / NLP / Deep Learning)
- Match job title language to the role where honest and accurate
- Avoid keyword stuffing — integration must read naturally

BULLET WRITING RULES:
Every bullet must follow: Action verb + technology or method + scale or context + measurable result
- Use: built, developed, deployed, optimized, designed, automated, reduced, improved
- Do NOT use: leveraged, spearheaded, utilized, synergized
- Do NOT use em dashes anywhere
- Avoid repetitive sentence structures across bullets
- Every bullet should have at least one number, metric, or scale indicator where the original supports it

FORMATTING RULES:
- Standard section order: Summary, Skills, Experience, Education, Certifications
- Hyphen bullets only
- Left-align everything
- Consistent date format (Month YYYY)
- Plain text only — no tables, columns, graphics

Return the optimized resume as a JSON object:
{
  "name": "Full Name",
  "email": "email",
  "phone": "phone",
  "location": "City, State",
  "linkedin": "linkedin url or empty string",
  "github": "github url or empty string",
  "summary": "3-4 line professional summary: role-specific, keyword-rich, written without 'I', matching target role and level",
  "skills": ["skill1", "skill2", ...],
  "experience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "location": "City, State",
      "dates": "Month YYYY - Month YYYY",
      "bullets": ["bullet1", "bullet2", ...]
    }
  ],
  "education": [
    {
      "institution": "University",
      "degree": "Degree and Field",
      "dates": "Month YYYY",
      "details": "GPA, honors, relevant coursework (optional, empty string if none)"
    }
  ],
  "certifications": ["cert1", "cert2"],
  "ats_match_summary": {
    "estimated_score": <number>,
    "matched_keywords": ["kw1", "kw2"],
    "missing_keywords": ["kw1"],
    "suggestions": ["suggestion1"]
  }
}

VALIDATION before returning:
- No invented experience, metrics, or skills
- All high-weight JD keywords naturally integrated
- ATS match score target 90+ based on keyword coverage
- No buzzwords or em dashes
- Every bullet follows the action verb + tech + scale + result pattern
- Summary is role-specific and keyword-rich

Return ONLY valid JSON. No markdown, no preamble.`;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured.' }, { status: 503 });
    }

    const { resumeText, jobDescription, jobTitle } = await request.json();

    if (!resumeText?.trim() || !jobDescription?.trim()) {
      return NextResponse.json({ error: 'Resume text and job description required.' }, { status: 400 });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: REWRITE_PROMPT,
      messages: [{
        role: 'user',
        content: `ORIGINAL RESUME:\n${resumeText}\n\nTARGET JOB${jobTitle ? ` (${jobTitle})` : ''}:\n${jobDescription}`,
      }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected AI response.' }, { status: 500 });
    }

    let resumeData;
    try {
      const cleaned = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      resumeData = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse resume JSON:', content.text.slice(0, 500));
      return NextResponse.json({ error: 'AI returned unexpected format. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ resume: resumeData });
  } catch (error: any) {
    console.error('Resume generation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate resume.' }, { status: 500 });
  }
}
