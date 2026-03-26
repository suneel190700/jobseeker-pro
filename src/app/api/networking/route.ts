export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { callAI, parseJSON } from '@/lib/ai-router';

export async function POST(request: NextRequest) {
  try {
    const { action, company, jobTitle, jobDescription, resumeText } = await request.json();

    if (action === 'find_recruiter') {
      const text = await callAI({ tier: 'cheap', system: `You help job seekers find the right people to contact at companies. Return ONLY JSON: {"recruiters":[{"name":"Likely title (e.g. Head of AI Recruiting)","role":"Their department","linkedin_search":"https://www.linkedin.com/search/results/people/?keywords=ENCODED_SEARCH&origin=GLOBAL_SEARCH_HEADER"}],"tips":"Brief networking advice"}. Give 3-5 likely hiring contacts with LinkedIn search URLs. Use realistic titles for ${company}. Include: the direct hiring manager, the recruiter, and a team lead.`, user: `Company: ${company}\nRole: ${jobTitle || 'not specified'}` });
      return NextResponse.json(parseJSON(text));
    }

    if (action === 'cold_email') {
      const text = await callAI({ tier: 'cheap', system: `Write a personalized cold outreach email to a recruiter/hiring manager. Return ONLY JSON: {"subject":"email subject line","email":"full email body"}. Rules: Under 150 words. No buzzwords. Reference specific things from the JD. Show genuine interest in the company. Include 1 specific metric from the resume. End with a clear ask (coffee chat or 15-min call). Professional but warm tone.`, user: `Company: ${company}\nRole: ${jobTitle}\nJD: ${jobDescription || 'not provided'}\nResume: ${resumeText || 'not provided'}` });
      return NextResponse.json(parseJSON(text));
    }

    if (action === 'referral_tips') {
      const text = await callAI({ tier: 'cheap', system: `Help the job seeker find referral paths into ${company}. Return ONLY JSON: {"strategies":[{"title":"Strategy name","description":"Detailed actionable steps"}]}. Give 4-5 strategies: LinkedIn connections, alumni networks, meetups/events, open source, cold outreach. Be specific to ${company}.`, user: `Company: ${company}\nRole: ${jobTitle || 'any'}` });
      return NextResponse.json(parseJSON(text));
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) { console.error('Networking error:', error); return NextResponse.json({ error: error.message }, { status: 500 }); }
}
