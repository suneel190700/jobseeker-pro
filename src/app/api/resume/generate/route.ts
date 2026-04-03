export const dynamic = 'force-dynamic';
import { trackAICall } from "@/lib/track-usage";
import { NextRequest, NextResponse } from 'next/server';
import { callAI, parseJSON, smartTruncate } from '@/lib/ai-router';

// STEP 1: Master Rewrite
const REWRITE_PROMPT = `Act as a Senior Hiring Manager, ATS Optimization Expert, and Resume Strategist.
Rewrite and optimize the resume so it achieves 90-93% ATS match across Workday, Greenhouse, Lever, and iCIMS, passes recruiter screening in 10 seconds, and sounds credible.

CRITICAL RULES:
1. UNIVERSAL DOMAIN ADAPTATION - Adapt resume to match JD domain. Use exact terminology and tools from JD.
2. MANDATORY SKILL INJECTION - Identify all mandatory JD skills. If missing: add naturally in SKILLS section AND reflect in 1-2 experience bullets. Use safe phrasing: "Hands-on experience with", "Exposure to", "Worked with". Ensure consistency between Skills and Experience.
3. ATS OPTIMIZATION - Include all critical JD keywords. Use exact matches and variations. No keyword stuffing. ATS-friendly structure.
4. HUMAN OPTIMIZATION - Every bullet: Action verb + what + how + measurable impact. Add metrics: percentages, latency, scale, cost savings. Replace "worked on"/"responsible for" with "Designed"/"Developed"/"Led"/"Optimized".
5. EXPERIENCE LEVEL ADAPTATION - Detect level from resume: Fresher (0-2yr): focus projects, no exaggeration. Mid (2-6yr): show module ownership, careful skill injection. Senior (6+yr): emphasize architecture, leadership, system design.
6. FORMATTING - No em dashes. Single column. Clean sections: SUMMARY, SKILLS, EXPERIENCE, EDUCATION. Bullet points only in experience. 1-2 pages. Contact info in body. Dates: "Month YYYY - Present".
7. CONSISTENCY - No contradictions. Skills must appear in experience logically. Add 2-3 relevant coursework items under Education.
8. Never start 2 bullets with same verb in one job. Mix short and medium bullets.
9. RECRUITER HUMANIZATION (CRITICAL - a real recruiter reads this in 10 seconds):
   FIRST IMPRESSION: Summary must immediately answer "why this person for THIS role" in 2-3 lines. No generic filler.
   BULLET IMPACT: Every bullet must follow Action + What + How + Business Impact. Add strong metrics: percentages, latency reductions, scale (users/records/transactions), cost savings, time improvements.
   STRONG LANGUAGE: Never use "worked on", "responsible for", "helped with", "assisted in", "participated in". Always use "Led", "Architected", "Built", "Optimized", "Delivered", "Engineered", "Spearheaded", "Reduced", "Increased", "Automated".
   SKIMMABILITY: Short punchy bullets (1-2 lines max). No wall-of-text bullets. First bullet per job = biggest achievement. Last bullet = team/leadership.
   CREDIBILITY: Skills must feel earned not listed. Every skill in Skills section should appear naturally in at least one experience bullet. No buzzword stacking.
   STORY FLOW: Show clear career progression and increasing ownership. Each role should feel like a step up.
   TONE: Confident but not arrogant. Specific not vague. Numbers not adjectives.

Return ONLY valid JSON: {"name":"","email":"","phone":"","location":"","linkedin":"","summary":"3 lines max","skills_grouped":{"Category":["skill"]},"experience":[{"company":"","title":"","location":"","dates":"Month YYYY - Present","bullets":[]}],"projects":[{"name":"","description":"one line","technologies":["tech"],"bullets":["what you built and impact"]}],"education":[{"institution":"","degree":"","dates":"","coursework":["course1","course2"]}],"certifications":[""]}

IMPORTANT FOR FRESHERS (0-2 years):
- ALWAYS include projects section with ALL projects from the original resume
- Projects are critical for freshers - NEVER remove them
- If resume has projects/personal projects/academic projects, keep ALL of them
- For freshers, projects section is MORE important than experience
- Add relevant technologies used in each project
- Rewrite project bullets with same Action + What + How + Impact format`;





export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription, jobTitle, company, userName } = await request.json();
    if (!resumeText?.trim() || !jobDescription?.trim()) return NextResponse.json({ error: 'Resume and JD required.' }, { status: 400 });

    // STEP 1: Master Rewrite
    console.log('Step 1: Rewriting...');
    // Track AI usage
    try { const sb = (await import("@supabase/supabase-js")).createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!); const authHeader = request.headers.get("Authorization"); if (authHeader) { const { data } = await sb.auth.getUser(authHeader.replace("Bearer ","")); if (data.user) await trackAICall(data.user.id); } } catch {}
    const text1 = await callAI({
      tier: 'balanced', system: REWRITE_PROMPT,
      user: `RESUME:\n${smartTruncate(resumeText)}\n\nTARGET JOB: ${jobTitle || ''} at ${company || ''}\n\nJOB DESCRIPTION:\n${smartTruncate(jobDescription)}`,
      maxTokens: 6000
    });
    let resume = parseJSON(text1);
    console.log('Step 1: Done');

    // Add filename
    const safeName = (userName || resume.name || 'resume').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const safeCompany = (company || '').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const safePosition = (jobTitle || '').split(' ').slice(0, 3).join('_').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    resume._filename = [safeName, safeCompany, safePosition].filter(Boolean).join('_');

    return NextResponse.json({ resume });
  } catch (error: any) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: error.message || 'Failed.' }, { status: 500 });
  }
}
