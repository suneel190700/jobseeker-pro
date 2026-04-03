export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, jobAlertEmail } from '@/lib/email';

function getSB() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sb = getSB();
  if (!sb) return NextResponse.json({ error: 'DB not configured' }, { status: 500 });

  try {
    // Get all active alerts with user emails
    const { data: alerts } = await sb.from('job_alerts').select('*, profiles(email)').eq('active', true);
    if (!alerts?.length) return NextResponse.json({ message: 'No active alerts', sent: 0 });

    let sent = 0;
    for (const alert of alerts) {
      try {
        const email = (alert as any).profiles?.email;
        if (!email) continue;

        // Search jobs matching this alert
        const params = new URLSearchParams({ query: alert.query, page: '1' });
        if (alert.location) params.set('location', alert.location);
        params.set('date_posted', 'today');

        const jobRes = await fetch(`https://jsearch.p.rapidapi.com/search?${params}`, {
          headers: { 'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!, 'X-RapidAPI-Host': 'jsearch.p.rapidapi.com' },
        });

        if (!jobRes.ok) continue;
        const jobData = await jobRes.json();
        const jobs = (jobData.data || []).slice(0, 10).map((j: any) => ({
          title: j.job_title, company: j.employer_name,
          location: j.job_city ? `${j.job_city}, ${j.job_state}` : 'US',
          salary_min: j.job_min_salary, salary_max: j.job_max_salary,
          source_url: j.job_apply_link || j.job_google_link,
        }));

        if (jobs.length === 0) continue;

        // Send email
        await sendEmail({
          to: email,
          subject: `${jobs.length} new ${alert.query} jobs found`,
          html: jobAlertEmail(jobs, alert.query),
        });

        // Update last_sent
        await sb.from('job_alerts').update({ last_sent: new Date().toISOString() }).eq('id', alert.id);
        sent++;
      } catch (e) { console.error('Alert error:', alert.id, e); }
    }

    return NextResponse.json({ message: `Sent ${sent} alerts`, sent });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
