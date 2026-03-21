export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { callAI, parseJSON } from '@/lib/ai-router';

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription, jobTitle, companyName, prepType } = await request.json();
    if (!resumeText?.trim() || !jobDescription?.trim()) return NextResponse.json({ error: 'Resume and JD required.' }, { status: 400 });
    let sys = '';
    if (prepType === 'questions') sys = 'Generate interview questions. Return ONLY JSON: {"technical_questions":[{"question":"","why_asked":"","tip":""}],"behavioral_questions":[{"question":"","what_they_want":"","tip":""}],"system_design":[{"question":"","context":""}],"questions_to_ask":[{"question":"","why_good":""}]}. 5 technical, 5 behavioral, 2 system design, 3 to ask.';
    else if (prepType === 'star') sys = 'Create STAR stories from resume. Return ONLY JSON: {"stories":[{"title":"","best_for_question":"","situation":"","task":"","action":"","result":""}]}. 5-7 stories. No fabrication.';
    else sys = `Company research brief for ${companyName || 'the company'}. Return ONLY JSON: {"company_overview":"","recent_news":"","culture_values":[],"tech_stack_likely":[],"talking_points":[],"why_you_fit":""}`;
    const text = await callAI({ tier: 'cheap', system: sys, user: `RESUME:\n${resumeText.slice(0, 3000)}\n\nJOB: ${jobTitle || 'role'} at ${companyName || 'company'}\n\nJD:\n${jobDescription.slice(0, 3000)}` });
    return NextResponse.json(parseJSON(text));
  } catch (error: any) { console.error('Interview error:', error); return NextResponse.json({ error: error.message || 'Failed.' }, { status: 500 }); }
}
