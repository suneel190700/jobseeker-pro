export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

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
      system: `You are an expert resume writer and ATS optimization specialist. Rewrite the provided resume to be optimized for the given job description.

RULES:
1. Keep all factual information (dates, companies, degrees, names) exactly the same — do NOT fabricate experience
2. Rewrite bullet points to emphasize relevant skills and achievements for the target role
3. Add missing keywords from the JD naturally into existing experience bullets
4. Ensure strong action verbs start each bullet
5. Add quantified achievements where the original has vague statements
6. Reorder sections/bullets to prioritize most relevant experience
7. Ensure a dedicated Skills section exists with relevant technologies from the JD
8. Keep the tone professional and concise

Return the optimized resume as a JSON object with this structure:
{
  "name": "Full Name",
  "email": "email",
  "phone": "phone",
  "location": "location",
  "linkedin": "linkedin url or empty",
  "github": "github url or empty",
  "summary": "2-3 sentence professional summary tailored to the role",
  "skills": ["skill1", "skill2", ...],
  "experience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "location": "City, State",
      "dates": "Start - End",
      "bullets": ["Achievement 1", "Achievement 2", ...]
    }
  ],
  "education": [
    {
      "institution": "University",
      "degree": "Degree and Field",
      "dates": "Graduation date",
      "details": "GPA, honors, relevant coursework (optional)"
    }
  ],
  "certifications": ["Cert 1", "Cert 2"]
}

Return ONLY valid JSON, no markdown.`,
      messages: [{
        role: 'user',
        content: `ORIGINAL RESUME:\n${resumeText}\n\nTARGET JOB${jobTitle ? ` (${jobTitle})` : ''}:\n${jobDescription}`,
      }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected AI response.' }, { status: 500 });
    }

    const cleaned = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const resumeData = JSON.parse(cleaned);

    return NextResponse.json({ resume: resumeData });
  } catch (error: any) {
    console.error('Resume generation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate resume.' }, { status: 500 });
  }
}
