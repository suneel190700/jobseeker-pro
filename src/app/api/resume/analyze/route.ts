export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/resume-parser';
import { calculateATSScore } from '@/lib/ats-engine';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
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

    // Step 1: Algorithmic scoring (instant, deterministic)
    const atsResult = calculateATSScore(resumeText, jobDescription);

    // Step 2: AI suggestions (if API key available)
    let aiSuggestions: any[] = [];

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          system: `You are an expert resume coach. Given a resume, job description, and algorithmic ATS analysis, provide actionable improvement suggestions.

Return ONLY a JSON array of suggestions:
[
  {
    "type": "critical|important|nice_to_have",
    "category": "keywords|formatting|content|impact",
    "message": "specific actionable advice",
    "original": "original text from resume if applicable",
    "suggested": "improved text if applicable"
  }
]

Focus on:
- Missing keywords that should be added naturally
- Weak bullet points that need quantified achievements
- Content gaps between resume and JD requirements
- Specific rewording suggestions with before/after

Return 5-10 suggestions. Return ONLY valid JSON, no markdown.`,
          messages: [{
            role: 'user',
            content: `RESUME:\n${resumeText.slice(0, 4000)}\n\nJOB DESCRIPTION:\n${jobDescription.slice(0, 3000)}\n\nALGORITHMIC ANALYSIS:\n- Overall Score: ${atsResult.overall_score}/100\n- Keyword Match: ${atsResult.keyword_match.match_percentage}%\n- Missing Keywords: ${atsResult.keyword_match.missing.slice(0, 15).join(', ')}\n- Formatting Issues: ${atsResult.formatting_issues.join(', ') || 'None'}`,
          }],
        });

        const content = message.content[0];
        if (content.type === 'text') {
          const cleaned = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          aiSuggestions = JSON.parse(cleaned);
        }
      } catch (aiError) {
        console.error('AI suggestions failed (using algorithmic results only):', aiError);
        // Generate basic suggestions from algorithmic analysis
        aiSuggestions = generateFallbackSuggestions(atsResult);
      }
    } else {
      // No API key — generate suggestions from algorithmic analysis
      aiSuggestions = generateFallbackSuggestions(atsResult);
    }

    return NextResponse.json({
      overall_score: atsResult.overall_score,
      keyword_match: atsResult.keyword_match,
      section_scores: atsResult.section_scores,
      formatting_score: atsResult.formatting_score,
      formatting_issues: atsResult.formatting_issues,
      suggestions: aiSuggestions,
      scoring_method: process.env.ANTHROPIC_API_KEY ? 'hybrid' : 'algorithmic',
    });
  } catch (error: any) {
    console.error('Resume analysis error:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze resume.' }, { status: 500 });
  }
}

function generateFallbackSuggestions(ats: ReturnType<typeof calculateATSScore>): any[] {
  const suggestions: any[] = [];

  // Missing keywords
  if (ats.keyword_match.missing.length > 0) {
    suggestions.push({
      type: 'critical',
      category: 'keywords',
      message: `Add these missing keywords to your resume: ${ats.keyword_match.missing.slice(0, 8).join(', ')}. Incorporate them naturally into your experience bullets or skills section.`,
    });
  }

  // Formatting issues
  for (const issue of ats.formatting_issues.slice(0, 3)) {
    suggestions.push({
      type: 'important',
      category: 'formatting',
      message: issue,
    });
  }

  // Low section scores
  for (const section of ats.section_scores) {
    if (section.score < 60) {
      suggestions.push({
        type: section.score < 40 ? 'critical' : 'important',
        category: 'content',
        message: `${section.section}: ${section.feedback}`,
      });
    }
  }

  return suggestions;
}
