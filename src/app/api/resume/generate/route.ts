export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { callAI, parseJSON } from '@/lib/ai-router';

const PROMPT = `You are the world's #1 ATS resume optimization engine targeting 95+ scores on Workday, Greenhouse, Lever, iCIMS.

STEPS:
1. DEEP JD ANALYSIS: Detect company type (enterprise/startup/big tech), role level (entry/mid/senior), company values, ALL keywords including niche terms
2. ADAPTIVE TONE: Entry="Developed,Built,Collaborated" Senior="Architected,Led,Designed" Enterprise=add governance language
3. PAGE LENGTH: <5yr=1 page, 5+yr=2 pages. NEVER half-empty pages.
4. GROUPED SKILLS: {"Languages":[],"AI/ML":[],"Cloud":[],...}
5. KEYWORD SATURATION: Every required keyword 2x+ in resume. Exact JD terms, not synonyms.
6. BULLETS: [Action Verb]+[Technology]+[Scale]+[Metric]. Every bullet needs a number.

SOURCE OF TRUTH: Keep real companies, titles, dates. Do NOT invent. MAY rephrase and add implied keywords.

Return ONLY JSON:
{"name":"","email":"","phone":"","location":"","linkedin":"","github":"","summary":"3-4 lines keyword-rich","skills_grouped":{"Category":["skill"]},"skills":["flat list"],"experience":[{"company":"","title":"","location":"","dates":"Month YYYY - Present","bullets":[""]}],"education":[{"institution":"","degree":"","dates":"","details":""}],"certifications":[""],"page_count":1or2,"jd_analysis":{"company_type":"","role_level":"","tone_used":"","top_keywords":[]},"ats_match_summary":{"estimated_score":90,"matched_keywords":[],"missing_keywords":[],"keyword_density":"","suggestions":[]}}`;

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription, jobTitle } = await request.json();
    if (!resumeText?.trim() || !jobDescription?.trim()) return NextResponse.json({ error: 'Resume and JD required.' }, { status: 400 });
    const text = await callAI({ tier: 'balanced', system: PROMPT, user: `ORIGINAL RESUME:\n${resumeText}\n\nTARGET JOB${jobTitle ? ` (${jobTitle})` : ''}:\n${jobDescription}\n\nOptimize to score 95+. Be aggressive with keywords. Fill pages completely.`, maxTokens: 6000 });
    return NextResponse.json({ resume: parseJSON(text) });
  } catch (error: any) { console.error('Generate error:', error); return NextResponse.json({ error: error.message || 'Failed.' }, { status: 500 }); }
}
