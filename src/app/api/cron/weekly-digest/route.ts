export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, weeklyDigestEmail } from '@/lib/email';
import { callAI, parseJSON } from '@/lib/ai-router';

function getSB() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sb = getSB();
  if (!sb) return NextResponse.json({ error: 'DB not configured' }, { status: 500 });

  try {
    // Get all users who want digests
    const { data: users } = await sb.from('profiles').select('id, email, target_titles').not('email', 'is', null);
    if (!users?.length) return NextResponse.json({ message: 'No users', sent: 0 });

    // Generate market insights with AI
    let marketData: any = { trending: [], stats: {}, tips: [] };
    try {
      const text = await callAI({
        tier: 'cheap',
        system: 'Return ONLY JSON with job market trends.',
        user: `Generate a weekly job market digest for tech professionals. Return JSON: {"trending":[{"role":"AI Engineer","count":1200},{"role":"Data Engineer","count":900}],"stats":{"newJobs":"15K+","avgSalary":"$145K"},"tips":["tip1","tip2","tip3"]}`,
        maxTokens: 500,
      });
      marketData = parseJSON(text);
    } catch { 
      marketData = {
        trending: [
          { role: 'AI/ML Engineer', count: 1500 },
          { role: 'Data Engineer', count: 1200 },
          { role: 'Full Stack Developer', count: 2000 },
          { role: 'DevOps/SRE', count: 800 },
          { role: 'Cloud Architect', count: 600 },
        ],
        stats: { newJobs: '12K+', avgSalary: '$140K' },
        tips: ['Tailor your resume for each application', 'Follow up within 48 hours', 'Prepare STAR stories before interviews'],
      };
    }

    let sent = 0;
    for (const user of users) {
      if (!user.email) continue;
      try {
        await sendEmail({
          to: user.email,
          subject: 'Your Weekly Job Market Digest - JobSeeker Pro',
          html: weeklyDigestEmail(marketData),
        });
        sent++;
      } catch (e) { console.error('Digest error:', user.id, e); }
    }

    return NextResponse.json({ message: `Sent ${sent} digests`, sent });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
