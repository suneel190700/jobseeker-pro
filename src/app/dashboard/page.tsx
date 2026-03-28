'use client';
import { ArrowRight, BarChart3, Briefcase, CheckCircle2, Clock3, Cpu, Radar, Search, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { useTracker } from '@/hooks/useTracker';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import PageHeader from '@/components/layout/PageHeader';

const modules = [
  { href: '/resume-optimizer', label: 'Resume Analysis', desc: 'Run ATS tuning and skill alignment checks.', icon: Sparkles },
  { href: '/jobs', label: 'Jobs Intelligence', desc: 'Search fresh roles and inspect fit faster.', icon: Search },
  { href: '/mock-interview', label: 'Interview Studio', desc: 'Practice answers with a stronger feedback loop.', icon: Cpu },
  { href: '/tracker', label: 'Pipeline Tracker', desc: 'Monitor progress from saved role to offer.', icon: Radar },
];

export default function DashboardPage() {
  const { profile, titles } = useResumeProfile();
  const tracker = useTracker();
  const [name, setName] = useState('');

  useEffect(() => { createClient().auth.getUser().then(({ data }) => setName(data?.user?.user_metadata?.full_name?.split(' ')[0] || '')); }, []);

  const stats = useMemo(() => {
    const applied = tracker.cards.filter((c) => c.stage !== 'saved').length;
    const interviews = tracker.cards.filter((c) => c.stage === 'interview').length;
    const saved = tracker.cards.filter((c) => c.stage === 'saved').length;
    const offers = tracker.cards.filter((c) => c.stage === 'offer').length;
    return { applied, interviews, saved, offers };
  }, [tracker.cards]);

  const readinessScore = useMemo(() => {
    let score = 0;
    if (profile) score += 35;
    if (titles.length > 0) score += 20;
    if (stats.applied > 0) score += 25;
    if (stats.interviews > 0) score += 20;
    return score;
  }, [profile, titles.length, stats.applied, stats.interviews]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="System overview"
        title={name ? `${name}, your AI command center is online.` : 'Your AI command center is online.'}
        description="This direction is built to feel like a living tool: command rail, live panels, persistent insights, and stronger operational focus."
        action={<><Link href="/resume-optimizer" className="btn-filled btn-sm !min-h-0 px-5 py-3">Run analysis</Link><Link href="/jobs" className="btn-gray btn-sm !min-h-0 px-5 py-3">Open jobs feed</Link></>}
      />

      <section className="grid gap-4 lg:grid-cols-[1.45fr,1fr]">
        <div className="premium-panel overflow-hidden p-6 sm:p-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,194,255,0.16),transparent_34%),radial-gradient(circle_at_82%_22%,rgba(124,58,237,0.16),transparent_28%)]" />
          <div className="relative space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="page-eyebrow">Operational state</p>
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-[30px]">A single control surface for search, resume tuning, and application momentum.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58">Every core workflow is moving toward a command-center model instead of a generic SaaS dashboard pattern.</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-right"><p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/32">Readiness index</p><p className="mt-1 text-3xl font-semibold tracking-tight text-white">{readinessScore}</p></div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Applications', value: stats.applied, icon: Briefcase, tone: 'from-cyan-400/16 to-transparent' },
                { label: 'Interviews', value: stats.interviews, icon: Clock3, tone: 'from-violet-400/16 to-transparent' },
                { label: 'Saved Roles', value: stats.saved, icon: Search, tone: 'from-sky-400/14 to-transparent' },
                { label: 'Offers', value: stats.offers, icon: CheckCircle2, tone: 'from-emerald-400/16 to-transparent' },
              ].map((item) => (
                <div key={item.label} className="metric-card p-4">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.tone}`} />
                  <div className="relative"><div className="mb-6 flex items-center justify-between"><p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-white/34">{item.label}</p><item.icon className="h-4 w-4 text-white/68" /></div><p className="text-4xl font-semibold tracking-tight text-white">{item.value}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="premium-card p-6 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-3"><div><p className="page-eyebrow">System status</p><h3 className="text-xl font-semibold tracking-tight text-white">Signal quality</h3></div><TrendingUp className="h-5 w-5 text-cyan-300" /></div>
          <div className="space-y-3">
            {[
              { label: 'Resume profile', status: profile ? 'Loaded' : 'Missing', ok: !!profile },
              { label: 'Target titles', status: titles.length > 0 ? `${titles.length} active` : 'Not set', ok: titles.length > 0 },
              { label: 'Tracker activity', status: stats.applied > 0 ? 'Flow active' : 'Idle', ok: stats.applied > 0 },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 text-sm"><span className="text-white/62">{row.label}</span><span className={row.ok ? 'text-emerald-300' : 'text-amber-300'}>{row.status}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr,1fr]">
        <div className="premium-card p-6 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-4"><div><p className="page-eyebrow">Modules</p><h3 className="text-xl font-semibold tracking-tight text-white">Primary command modules</h3></div><BarChart3 className="h-5 w-5 text-cyan-300" /></div>
          <div className="grid gap-3 md:grid-cols-2">
            {modules.map((item) => (
              <Link key={item.href} href={item.href} className="premium-hover group rounded-[22px] border border-white/8 bg-white/[0.03] p-5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/16 bg-cyan-400/10 text-cyan-200 shadow-[0_14px_30px_-22px_rgba(0,194,255,0.7)]"><item.icon className="h-5 w-5" /></div>
                <div className="flex items-start justify-between gap-3"><div><p className="text-base font-semibold tracking-tight text-white">{item.label}</p><p className="mt-1 text-sm leading-6 text-white/54">{item.desc}</p></div><ArrowRight className="mt-1 h-4 w-4 text-white/26 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" /></div>
              </Link>
            ))}
          </div>
        </div>

        <div className="premium-card p-6 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-4"><div><p className="page-eyebrow">Recent activity</p><h3 className="text-xl font-semibold tracking-tight text-white">Live feed</h3></div><Cpu className="h-5 w-5 text-violet-300" /></div>
          <div className="space-y-3">
            {[
              ['Resume tuning suggested', 'Use ATS optimization on your highest-priority JD.'],
              ['Jobs panel ready', 'Search with tight filters and inspect fit in the detail panel.'],
              ['Interview prep available', 'Mock interview module is ready for rehearsals.'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"><p className="text-sm font-semibold text-white">{title}</p><p className="mt-1 text-sm leading-6 text-white/54">{body}</p></div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
