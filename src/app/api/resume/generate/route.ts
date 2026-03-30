export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { callAI, parseJSON, smartTruncate } from '@/lib/ai-router';

const PROMPT = `You are a senior resume writer and ATS optimization expert. Your task is to rewrite the resume to score 90-93% on ALL major ATS platforms.

TARGET ATS PLATFORMS: Workday, Greenhouse, Lever, iCIMS, UKG Pro, Taleo, SAP SuccessFactors.

STRICT ATS FORMATTING RULES:
- Single column layout only. No tables, columns, graphics, icons, images.
- Section headers EXACTLY: SUMMARY, SKILLS, EXPERIENCE, EDUCATION, CERTIFICATIONS
- Contact info at top of body: Name, Email, Phone, Location, LinkedIn
- Dates format: "Month YYYY - Present" or "Month YYYY - Month YYYY" (plain dash, not em dash)
- No em dashes, smart quotes, or unicode. Use plain dash (-) and straight quotes only.
- No headers/footers content - everything in body.
- Font assumption: Calibri 10-11pt

KEYWORD RULES:
- Each required keyword appears 2-3x naturally across resume. NEVER more than 3x.
- Place keywords in Summary, Skills, AND Experience sections.
- Use exact JD terms, not synonyms (ATS matches literally).
- Do NOT keyword stuff. If it reads unnaturally, remove it.

BULLET STYLE (Compressed Storytelling):
- Format: [Action Verb] + [Technology/Work] + [Short Context] + [Impact/Result]
- 1-2 lines per bullet. Max 6 bullets per job.
- No "I" or "we". No conversational phrasing.
- Mix short (1 line) and medium (2 line) bullets naturally.
- First bullet = biggest achievement. Last bullet = team/leadership.
- Never start 2 bullets with same verb in one job.
- Include metrics where real (avoid fake %). Some bullets without numbers are OK.

HUMANIZATION RULES:
- No em dashes (—). Use dash (-) or comma.
- Vary sentence structure. No identical bullet patterns.
- No buzzword stacking ("spearheaded cross-functional enterprise-grade initiatives").
- Slightly imperfect = human. Not every bullet needs a metric.
- Score target 90-93%. NOT 95+ which looks AI-generated.

CONTENT RULES:
- Keep real companies, titles, dates. Do NOT invent experience.
- MAY rephrase bullets and add implied keywords.
- Remove or downplay irrelevant experience.
- Add relevant coursework under Education (2-3 courses matching JD).
- Group skills by category matching JD requirements.
- Summary: 3 lines max, keyword-rich, specific to target role.

Return ONLY valid JSON (no markdown, no backticks):
{"name":"","email":"","phone":"","location":"","linkedin":"","github":"","summary":"3 lines","skills_grouped":{"Category":["skill"]},"experience":[{"company":"","title":"","location":"","dates":"Month YYYY - Present","bullets":[""]}],"education":[{"institution":"","degree":"","dates":"","coursework":["relevant course 1","relevant course 2"]}],"certifications":[""],"ats_compliance":{"format":"single column, standard headers","score_target":"90-93%","platforms_optimized":["Workday","Greenhouse","Lever","iCIMS","UKG Pro"]}}`;

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription, jobTitle, userName, company } = await request.json();
    if (!resumeText?.trim() || !jobDescription?.trim()) return NextResponse.json({ error: 'Resume and JD required.' }, { status: 400 });
    
    const text = await callAI({
      tier: 'balanced',
      system: PROMPT,
      user: `ORIGINAL RESUME:\n${smartTruncate(resumeText)}\n\nTARGET JOB${jobTitle ? ` (${jobTitle})` : ''}${company ? ` at ${company}` : ''}:\n${smartTruncate(jobDescription)}\n\nRewrite to score 90-93% on all ATS platforms. Be aggressive with keywords but natural. Fill pages. Add relevant coursework.`,
      maxTokens: 6000
    });
    
    try {
      const resume = parseJSON(text);
      // Add filename suggestion
      const safeName = (userName || resume.name || 'resume').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const safeCompany = (company || '').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const safePosition = (jobTitle || '').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      resume._filename = [safeName, safeCompany, safePosition].filter(Boolean).join('_');
      return NextResponse.json({ resume });
    } catch (parseErr) {
      console.error('Generate JSON parse failed, retrying...');
      const text2 = await callAI({
        tier: 'balanced',
        system: PROMPT + '\n\nCRITICAL: Return ONLY valid JSON. No markdown. Keep compact. Under 4000 tokens.',
        user: `RESUME:\n${smartTruncate(resumeText, 3000)}\n\nJOB: ${jobTitle || ''} at ${company || ''}\n\nJD:\n${smartTruncate(jobDescription, 2000)}`,
        maxTokens: 5000
      });
      const resume = parseJSON(text2);
      return NextResponse.json({ resume });
    }
  } catch (error: any) { console.error('Generate error:', error); return NextResponse.json({ error: error.message || 'Failed.' }, { status: 500 }); }
}
