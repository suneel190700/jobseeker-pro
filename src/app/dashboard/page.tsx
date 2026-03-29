'use client';
import {
  Search,
  Sparkles,
  FileSignature,
  MessageSquare,
  Linkedin,
  Kanban,
  User,
  FolderOpen,
  Mic,
  BarChart3,
  Users,
  CheckCircle,
  ChevronRight,
  Lightbulb,
  Calendar,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { useTracker } from '@/hooks/useTracker';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import PageHeader from '@/components/layout/PageHeader';

const actions = [
  { href: '/jobs', label: 'Search Jobs', desc: 'TheirStack + filters', icon: Search, color: 'var(--info)' },
  { href: '/resume-optimizer', label: 'Resume AI', desc: 'ATS optimization', icon: Sparkles, color: 'var(--accent)' },
  { href: '/mock-interview', label: 'Mock Interview', desc: 'Voice practice', icon: Mic, color: 'var(--accent-secondary)' },
  { href: '/networking', label: 'Networking', desc: 'Outreach & recruiters', icon: Users, color: 'var(--success)' },
  { href: '/analytics', label: 'Analytics', desc: 'Funnel clarity', icon: BarChart3, color: 'var(--warning)' },
  { href: '/tracker', label: 'Tracker', desc: 'Pipeline', icon: Kanban, color: 'var(--accent-secondary)' },
];

const tips = [
  'Apply within 24 hours of posting — early applicants get more callbacks.',
  'Tuesday–Thursday mornings are often the best window to submit.',
  'Resumes with quantified metrics get more interview requests.',
  'Match exact JD keywords — many ATS tools use literal matching.',
];

export default function DashboardPage() {
  const { profile, titles } = useResumeProfile();
  const tracker = useTracker();
  const [name, setName] = useState('');
  const [tip] = useState(tips[Math.floor(Math.random() * tips.length)]);
  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setName(data?.user?.user_metadata?.full_name?.split(' ')[0] || ''));
  }, []);

  const s = {
    applied: tracker.cards.filter((c) => c.stage !== 'saved').length,
    interviews: tracker.cards.filter((c) => c.stage === 'interview').length,
    saved: tracker.cards.filter((c) => c.stage === 'saved').length,
    offers: tracker.cards.filter((c) => c.stage === 'offer').length,
  };

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title={name ? `Hey, ${name}` : 'Welcome back'}
        description="Your career workspace — search, tune, and track in one place."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Applied', value: s.applied, icon: Briefcase, color: 'var(--info)' },
          { label: 'Interviews', value: s.interviews, icon: Calendar, color: 'var(--accent)' },
          { label: 'Saved', value: s.saved, icon: Search, color: 'var(--accent-secondary)' },
          { label: 'Offers', value: s.offers, icon: CheckCircle, color: 'var(--success)' },
        ].map((x) => (
          <div key={x.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="caption">{x.label}</span>
              <x.icon className="h-4 w-4" style={{ color: x.color, opacity: 0.85 }} />
            </div>
            <span className="text-3xl font-bold tracking-tight tabular-nums" style={{ color: x.color }}>
              {x.value}
            </span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="headline mb-4">Quick actions</h2>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {actions.map((a) => (
                <Link key={a.href} href={a.href} className="surface surface-hover p-4 press group block border border-[var(--separator)]">
                  <div
                    className="h-11 w-11 rounded-[var(--radius-md)] flex items-center justify-center mb-3 border"
                    style={{ background: 'var(--surface-1)', borderColor: 'var(--separator)' }}
                  >
                    <a.icon className="h-5 w-5" style={{ color: a.color }} />
                  </div>
                  <p className="text-[15px] font-semibold">{a.label}</p>
                  <p className="caption mt-0.5 !font-medium !normal-case !tracking-normal">{a.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="surface p-5 border border-[var(--separator)]">
            <h2 className="headline mb-4">Getting started</h2>
            <div>
              {[
                { done: !!profile, label: 'Upload your base resume', href: '/profile' },
                { done: titles.length > 0, label: 'Set target job titles', href: '/profile' },
                { done: s.applied > 0, label: 'Move a role out of Saved', href: '/tracker' },
                { done: s.interviews > 0, label: 'Run a mock interview', href: '/mock-interview' },
              ].map((step, i) => (
                <Link key={i} href={step.href} className="list-row group">
                  <div
                    className="h-[22px] w-[22px] rounded-full flex items-center justify-center flex-shrink-0"
                    style={
                      step.done
                        ? { background: 'var(--success)' }
                        : { border: '2px solid var(--fill)' }
                    }
                  >
                    {step.done && <CheckCircle className="h-[14px] w-[14px] text-[var(--bg-primary)]" strokeWidth={2.5} />}
                  </div>
                  <span
                    className={`flex-1 text-[15px] ${step.done ? 'line-through' : ''}`}
                    style={{ color: step.done ? 'var(--text-tertiary)' : 'var(--text-primary)' }}
                  >
                    {step.label}
                  </span>
                  {!step.done && <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)]" />}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div
            className="surface p-4 border"
            style={{
              borderColor: 'var(--accent-dim-strong)',
              background: 'linear-gradient(165deg, var(--accent-dim) 0%, var(--surface-1) 100%)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-[var(--accent)]" />
              <span className="caption text-[var(--accent)]">Pro tip</span>
            </div>
            <p className="subhead leading-relaxed">{tip}</p>
          </div>

          <div className="surface overflow-hidden border border-[var(--separator)]">
            <div className="px-4 py-3 border-b border-[var(--separator)]">
              <span className="caption">More tools</span>
            </div>
            {[
              { href: '/cover-letter', label: 'Cover Letter', icon: FileSignature },
              { href: '/interview-prep', label: 'Interview Q&A', icon: MessageSquare },
              { href: '/linkedin', label: 'LinkedIn Optimizer', icon: Linkedin },
              { href: '/resume-versions', label: 'My Resumes', icon: FolderOpen },
              { href: '/profile', label: 'Profile', icon: User },
            ].map((t) => (
              <Link key={t.href} href={t.href} className="list-row group">
                <t.icon className="h-4 w-4 text-[var(--text-tertiary)]" />
                <span className="flex-1 text-[14px] text-[var(--text-secondary)]">{t.label}</span>
                <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-tertiary)]" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
