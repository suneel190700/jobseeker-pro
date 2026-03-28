'use client';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronRight,
  FileSignature,
  FolderOpen,
  Linkedin,
  MessageSquare,
  Mic,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { useTracker } from '@/hooks/useTracker';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import PageHeader from '@/components/layout/PageHeader';

const quickActions = [
  { href: '/resume-optimizer', label: 'Run ATS optimization', desc: 'Target the roles you actually want next.', icon: Sparkles },
  { href: '/jobs', label: 'Search new jobs', desc: 'Find fresh roles and move fast on the best fits.', icon: Search },
  { href: '/mock-interview', label: 'Practice out loud', desc: 'Build sharper answers before the call arrives.', icon: Mic },
  { href: '/tracker', label: 'Update pipeline', desc: 'Keep saved, applied, and interview stages clean.', icon: Briefcase },
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
    createClient()
      .auth.getUser()
      .then(({ data }) => setName(data?.user?.user_metadata?.full_name?.split(' ')[0] || ''));
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
    { label: 'At least one role applied', done: stats.applied > 0, href: '/tracker' },
    { label: 'Interview practice completed', done: stats.interviews > 0, href: '/mock-interview' },
  ];

  const readinessScore = Math.round((readiness.filter((item) => item.done).length / readiness.length) * 100);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Career command center"
        title={name ? `${name}, make this your strongest application cycle yet.` : 'Make this your strongest application cycle yet.'}
        description="A cleaner, faster workspace for search, ATS improvement, applications, and interview prep — all in one premium flow."
        action={
          <>
            <Link href="/resume-optimizer" className="btn-filled btn-sm !min-h-0 px-5 py-3">
              Optimize resume
            </Link>
            <Link href="/jobs" className="btn-gray btn-sm !min-h-0 px-5 py-3">
              Explore jobs
            </Link>
          </>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
        <div className="premium-panel overflow-hidden p-6 sm:p-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.18),transparent_36%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.12),transparent_28%)]" />
          <div className="relative space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="page-eyebrow">Momentum overview</p>
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-[30px]">Your application engine is ready for a premium polish.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58">Use the dashboard as your operating system: search intentionally, tailor faster, and keep every active role visible.</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/35">Readiness</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-white">{readinessScore}%</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Applications', value: stats.applied, icon: Briefcase, tone: 'from-indigo-400/30 to-indigo-500/5' },
                { label: 'Interviews', value: stats.interviews, icon: Calendar, tone: 'from-cyan-400/30 to-cyan-500/5' },
                { label: 'Saved Roles', value: stats.saved, icon: Search, tone: 'from-violet-400/28 to-violet-500/5' },
                { label: 'Offers', value: stats.offers, icon: CheckCircle, tone: 'from-emerald-400/28 to-emerald-500/5' },
              ].map((item) => (
                <div key={item.label} className="metric-card p-4">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.tone}`} />
                  <div className="relative">
                    <div className="mb-7 flex items-center justify-between">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-white/38">{item.label}</p>
                      <item.icon className="h-4 w-4 text-white/65" />
                    </div>
                    <p className="text-4xl font-semibold tracking-tight text-white">{item.value}</p>
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
              <h3 className="text-xl font-semibold tracking-tight text-white">Focus sequence</h3>
            </div>
            <Target className="h-5 w-5 text-cyan-300" />
          </div>
          <div className="space-y-3">
            {readiness.map((step, idx) => (
              <Link key={step.label} href={step.href} className="premium-hover flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                <div className={step.done ? 'flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-[#05110b]' : 'flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/55'}>
                  {step.done ? <CheckCircle className="h-5 w-5" /> : <span className="text-sm font-semibold">0{idx + 1}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{step.label}</p>
                  <p className="text-xs text-white/42">{step.done ? 'Completed' : 'Recommended next step'}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-white/30" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr,1fr]">
        <div className="premium-card p-6 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="page-eyebrow">Priority actions</p>
              <h3 className="text-xl font-semibold tracking-tight text-white">Work the highest-impact levers first.</h3>
            </div>
            <TrendingUp className="h-5 w-5 text-indigo-300" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="premium-hover group rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(99,102,241,.28),rgba(34,211,238,.14))] text-white shadow-[0_14px_34px_-20px_rgba(99,102,241,.85)]">
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold tracking-tight text-white">{action.label}</p>
                    <p className="mt-1 text-sm leading-6 text-white/50">{action.desc}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 text-white/28 transition group-hover:translate-x-0.5 group-hover:text-white/75" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="premium-card p-6 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="page-eyebrow">Tool stack</p>
              <h3 className="text-xl font-semibold tracking-tight text-white">Everything still accessible.</h3>
            </div>
            <BarChart3 className="h-5 w-5 text-cyan-300" />
          </div>
          <div className="space-y-2.5">
            {tools.map((tool) => (
              <Link key={tool.href} href={tool.href} className="premium-hover flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-white/70">
                  <tool.icon className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-medium text-white/78">{tool.label}</span>
                <ChevronRight className="h-4 w-4 text-white/28" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
