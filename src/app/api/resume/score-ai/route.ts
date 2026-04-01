export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription } = await request.json();
    if (!resumeText || !jobDescription) return NextResponse.json({ error: 'Required' }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Anthropic key not configured' }, { status: 500 });

    const r = resumeText.slice(0, 3000);
    const j = jobDescription.slice(0, 2000);

    console.log('AI Score: calling Haiku directly');

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: `Score this resume against the job description as ATS systems (Workday, Greenhouse, Lever, iCIMS) would. Return ONLY a valid JSON object, nothing else.

RESUME:
${r}

JOB DESCRIPTION:
${j}

Return exactly this JSON structure with real scores:
{"overall_score":92,"ats_scores":{"workday":91,"greenhouse":93,"lever":90,"icims":92},"strengths":["str1","str2","str3"],"improvements":["imp1","imp2"],"recruiter_impression":"one sentence"}`
        }],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error('Haiku error:', resp.status, err.slice(0, 200));
      return NextResponse.json({ error: `Haiku ${resp.status}` }, { status: 500 });
    }

    const data = await resp.json();
    const text = data.content?.[0]?.text || '';
    console.log('AI Score raw:', text.slice(0, 300));

    // Parse JSON from response
    let result;
    try {
      // Strip markdown if any
      const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
      result = JSON.parse(clean);
    } catch {
      // Find JSON object
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try { result = JSON.parse(match[0]); } catch {
          // Fix and retry
          let fixed = match[0].replace(/,\s*([}\]])/g, '$1');
          const ob = (fixed.match(/\{/g)||[]).length;
          const cb = (fixed.match(/\}/g)||[]).length;
          for (let i = 0; i < ob - cb; i++) fixed += '}';
          result = JSON.parse(fixed);
        }
      } else {
        throw new Error('No JSON in response');
      }
    }

    console.log('AI Score parsed:', result.overall_score);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error('AI Score error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
