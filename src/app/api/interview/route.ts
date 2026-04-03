export const dynamic = 'force-dynamic';
import { trackAICall } from "@/lib/track-usage";
import { NextRequest, NextResponse } from 'next/server';
import { callAI, parseJSON, smartTruncate } from '@/lib/ai-router';

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription, jobTitle, companyName, type: prepType } = await request.json();
    if (!jobDescription?.trim()) return NextResponse.json({ error: 'JD required' }, { status: 400 });

    let sys = '';
    if (prepType === 'questions') sys = `Generate interview questions with sample answers. Return ONLY JSON: {"technical":[{"question":"","answer":"sample answer the candidate should give","why_asked":"","tip":""}],"behavioral":[{"question":"","answer":"sample STAR-format answer","why_asked":"","tip":""}],"system_design":[{"question":"","answer":"approach to answer","context":""}],"questions_to_ask":[{"question":"","why_good":""}]}. 5 technical, 5 behavioral, 2 system design, 3 to ask. Answers should be specific to the candidate's resume.`;
    else if (prepType === 'star') sys = 'Generate STAR stories from the resume. Return ONLY JSON: {"stories":[{"title":"","relevant_for":"which question type","situation":"","task":"","action":"","result":"with metrics","keywords":["kw"]}]}. 4-5 stories.';
    else if (prepType === 'company') sys = 'Research the company. Return ONLY JSON: {"company_overview":"","culture_values":[""],"interview_talking_points":[""],"questions_to_ask":[""],"recent_news":"","tips":[""]}.';
    else return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

    trackAICall().catch(() => {}); // fire and forget
    const text = await callAI({ tier: 'cheap', system: sys, user: `Resume:\n${smartTruncate(resumeText || '', 3000)}\n\nJob: ${jobTitle || ''} at ${companyName || ''}\n\nJD:\n${smartTruncate(jobDescription, 2000)}`, maxTokens: 4000 });
    return NextResponse.json(parseJSON(text));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
