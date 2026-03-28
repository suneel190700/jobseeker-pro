'use client';
import { ArrowRight, BarChart3, Briefcase, Calendar, CheckCircle, ChevronRight, FileSignature, FolderOpen, Linkedin, MessageSquare, Mic, Search, Sparkles, Target, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { useTracker } from '@/hooks/useTracker';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import PageHeader from '@/components/layout/PageHeader';

const quickActions = [
  { href: '/resume-optimizer', label: 'Refine resume fit', desc: 'Improve alignment without making the resume feel robotic.', icon: Sparkles },
  { href: '/jobs', label: 'Research fresh roles', desc: 'Search intentionally and work only the strongest matches.', icon: Search },
  { href: '/mock-interview', label: 'Practice your answers', desc: 'Sharpen delivery before the recruiter call lands.', icon: Mic },
  { href: '/tracker', label: 'Clean the pipeline', desc: 'Keep every saved, applied, and interview stage current.', icon: Briefcase },
];

const tools = [
  { href: '/cover-letter', label: 'Cover Letter', icon: FileSignature },
  { href: '/interview-prep', label: 'Interview Prep', icon: MessageSquare },
  { href: '/linkedin', label: 'LinkedIn', icon: Linkedin },
  { href: '/networking', label: 'Networking', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/resume-versions', label: 'Resume Versions', icon: FolderOpen },
];

export default function DashboardPage() {
  const { profile, titles } = useResumeProfile();
  const tracker = useTracker();
  const [name, setName] = useState('');

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setName(data?.user?.user_metadata?.full_name?.split(' ')[0] || ''));
  }, []);

  const stats = useMemo(() => {
    const applied = tracker.cards.filter((c) => c.stage !== 'saved').length;
    const interviews = tracker.cards.filter((c) => c.stage === 'interview').length;
    const saved = tracker.cards.filter((c) => c.stage === 'saved').length;
    const offers = tracker.cards.filter((c) => c.stage === 'offer').length;
    return { applied, interviews, saved, offers };
  }, [tracker.cards]);

  const readiness = [
    { label: 'Base resume uploaded', done: !!profile, href: '/profile' },
    { label: 'Target titles selected', done: titles.length > 0, href: '/profile' },
    { label: 'Applications moved into pipeline', done: stats.applied > 0, href: '/tracker' },
    { label: 'Interview practice completed', done: stats.interviews > 0, href: '/mock-interview' },
  ];

  const readinessScore = Math.round((readiness.filter((item) => item.done).length / readiness.length) * 100);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Career briefing"
        title={name ? `${name}, this workspace now feels completely different.` : 'This workspace now feels completely different.'}
        description="A warmer, more original design system built for focused job search work — less startup clone, more premium productivity product."
        action={
          <>
            <Link href="/resume-optimizer" className="btn-filled btn-sm !min-h-0 px-5 py-3">Optimize resume</Link>
            <Link href="/jobs" className="btn-gray btn-sm !min-h-0 px-5 py-3">Browse jobs</Link>
          </>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[1.45fr,1fr]">
        <div className="premium-panel overflow-hidden p-6 sm:p-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(41,88,214,0.08),transparent_34%),radial-gradient(circle_at_80%_22%,rgba(17,122,101,0.08),transparent_26%)]" />
          <div className="relative space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="page-eyebrow">Overview</p>
                <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-[30px]">A cleaner command center for resumes, jobs, and interviews.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">This layout is intentionally calmer: stronger hierarchy, softer palette, and a more distinct product identity.</p>
              </div>
              <div className="rounded-[24px] border border-[rgba(23,20,17,0.08)] bg-white/70 px-4 py-3 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-tertiary)]">Readiness</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{readinessScore}%</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Applications', value: stats.applied, icon: Briefcase, tone: 'from-blue-100 to-transparent' },
                { label: 'Interviews', value: stats.interviews, icon: Calendar, tone: 'from-emerald-100 to-transparent' },
                { label: 'Saved Roles', value: stats.saved, icon: Search, tone: 'from-amber-100 to-transparent' },
                { label: 'Offers', value: stats.offers, icon: CheckCircle, tone: 'from-violet-100 to-transparent' },
              ].map((item) => (
                <div key={item.label} className="metric-card p-4">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.tone}`} />
                  <div className="relative">
                    <div className="mb-7 flex items-center justify-between">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--text-tertiary)]">{item.label}</p>
                      <item.icon className="h-4 w-4 text-[var(--text-secondary)]" />
                    </div>
                    <p className="text-4xl font-semibold tracking-tight text-[var(--text-primary)]">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="premium-card p-6 sm:p-7">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="page-eyebrow">Next best move</p>
              <h3 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Priority sequence</h3>
            </div>
            <Target className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div className="space-y-3">
            {readiness.map((step, idx) => (
              <Link key={step.label} href={step.href} className="premium-hover flex items-center gap-3 rounded-2xl border border-[rgba(23,20,17,0.08)] bg-white/60 px-4 py-4">
                <div className={step.done ? 'flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--success)] text-white' : 'flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(23,20,17,0.08)] bg-white text-[var(--text-secondary)]'}>
                  {step.done ? <CheckCircle className="h-5 w-5" /> : <span className="text-sm font-semibold">0{idx + 1}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{step.label}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{step.done ? 'Completed' : 'Recommended next step'}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)]" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr,1fr]">
        <div className="premium-card p-6 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="page-eyebrow">Action queue</p>
              <h3 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Do the highest-impact work first.</h3>
            </div>
            <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="premium-hover group rounded-[24px] border border-[rgba(23,20,17,0.08)] bg-white/62 p-5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(41,88,214,0.1)] bg-[rgba(41,88,214,0.08)] text-[var(--accent)]">
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold tracking-tight text-[var(--text-primary)]">{action.label}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{action.desc}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 text-[var(--text-tertiary)] transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="premium-card p-6 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="page-eyebrow">Modules</p>
              <h3 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Everything is still reachable.</h3>
            </div>
            <BarChart3 className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div className="space-y-2.5">
            {tools.map((tool) => (
              <Link key={tool.href} href={tool.href} className="premium-hover flex items-center gap-3 rounded-2xl border border-[rgba(23,20,17,0.08)] bg-white/60 px-4 py-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(23,20,17,0.08)] bg-white text-[var(--text-secondary)]">
                  <tool.icon className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">{tool.label}</span>
                <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)]" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
