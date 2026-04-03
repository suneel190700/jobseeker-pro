import { Resend } from 'resend';

let resend: Resend | null = null;
function getResend() {
  if (!resend && process.env.RESEND_API_KEY) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const r = getResend();
  if (!r) throw new Error('RESEND_API_KEY not configured');
  const { data, error } = await r.emails.send({
    from: 'JobSeeker Pro <notifications@jobseeker-pro.vercel.app>',
    to, subject, html,
  });
  if (error) throw new Error(error.message);
  return data;
}

export function jobAlertEmail(jobs: any[], query: string) {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#10131a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px">
    <div style="text-align:center;margin-bottom:32px">
      <h1 style="color:#bbc3ff;font-size:24px;margin:0">JobSeeker Pro</h1>
      <p style="color:#8e90a2;font-size:14px;margin-top:4px">New Job Alert</p>
    </div>
    <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px;margin-bottom:16px">
      <p style="color:#c4c5d9;font-size:14px;margin:0 0 16px">We found <strong style="color:#00daf3">${jobs.length} new jobs</strong> matching "${query}":</p>
      ${jobs.slice(0, 10).map(j => `
        <div style="border-bottom:1px solid rgba(255,255,255,0.05);padding:12px 0">
          <a href="${j.source_url || '#'}" style="color:#e1e2eb;font-size:15px;font-weight:600;text-decoration:none">${j.title}</a>
          <p style="color:#bbc3ff;font-size:13px;margin:4px 0 0">${j.company} • ${j.location || 'US'}</p>
          ${j.salary_min ? `<p style="color:#8e90a2;font-size:12px;margin:2px 0 0">$${Math.round(j.salary_min/1000)}k - $${Math.round((j.salary_max||j.salary_min)/1000)}k</p>` : ''}
        </div>
      `).join('')}
    </div>
    <div style="text-align:center;margin-top:24px">
      <a href="https://jobseeker-pro.vercel.app/jobs" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#5203d5,#3c59fd);color:white;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px">View All Jobs</a>
    </div>
    <p style="color:#434656;font-size:11px;text-align:center;margin-top:32px">You're receiving this because you set up a job alert on JobSeeker Pro.</p>
  </div>
</body></html>`;
}

export function weeklyDigestEmail(data: { trending: any[]; stats: any; tips: string[] }) {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#10131a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px">
    <div style="text-align:center;margin-bottom:32px">
      <h1 style="color:#bbc3ff;font-size:24px;margin:0">JobSeeker Pro</h1>
      <p style="color:#8e90a2;font-size:14px;margin-top:4px">Weekly Job Market Digest</p>
    </div>

    ${data.stats ? `
    <div style="display:flex;gap:12px;margin-bottom:20px">
      <div style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;text-align:center">
        <p style="color:#00daf3;font-size:28px;font-weight:800;margin:0">${data.stats.newJobs || 0}</p>
        <p style="color:#8e90a2;font-size:11px;margin:4px 0 0">New Jobs This Week</p>
      </div>
      <div style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;text-align:center">
        <p style="color:#cdbdff;font-size:28px;font-weight:800;margin:0">${data.stats.avgSalary || 'N/A'}</p>
        <p style="color:#8e90a2;font-size:11px;margin:4px 0 0">Avg Salary</p>
      </div>
    </div>` : ''}

    <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px;margin-bottom:16px">
      <h2 style="color:#bbc3ff;font-size:16px;margin:0 0 16px">Trending Roles</h2>
      ${data.trending.map(t => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.03)">
          <span style="color:#e1e2eb;font-size:14px">${t.role}</span>
          <span style="color:#00daf3;font-size:13px;font-weight:600">${t.count} openings</span>
        </div>
      `).join('')}
    </div>

    ${data.tips?.length > 0 ? `
    <div style="background:rgba(82,3,213,0.1);border:1px solid rgba(205,189,255,0.2);border-radius:16px;padding:24px;margin-bottom:16px">
      <h2 style="color:#cdbdff;font-size:16px;margin:0 0 12px">Weekly Tips</h2>
      ${data.tips.map(t => `<p style="color:#c4c5d9;font-size:13px;margin:8px 0">• ${t}</p>`).join('')}
    </div>` : ''}

    <div style="text-align:center;margin-top:24px">
      <a href="https://jobseeker-pro.vercel.app/dashboard" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#5203d5,#3c59fd);color:white;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px">Open Dashboard</a>
    </div>
    <p style="color:#434656;font-size:11px;text-align:center;margin-top:32px">Your weekly digest from JobSeeker Pro.</p>
  </div>
</body></html>`;
}
