'use client';
import { BriefcaseBusiness, CheckCircle2, Cloud, GaugeCircle, Layers3, Search, Sparkles, TrendingUp, Workflow } from 'lucide-react';
import Link from 'next/link';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { useTracker } from '@/hooks/useTracker';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import PageHeader from '@/components/layout/PageHeader';

const techStack = [
  { label: 'Python', glow: 'shadow-[0_0_28px_rgba(99,102,241,0.45)]' },
  { label: 'SQL', glow: 'shadow-[0_0_24px_rgba(147,197,253,0.38)]' },
  { label: 'Cloud Architecture', glow: 'shadow-[0_0_32px_rgba(129,140,248,0.42)]' },
];

const projects = [
  { title: 'Analytics Dashboard', subtitle: 'Web application', gradient: 'from-indigo-500/35 via-slate-800 to-slate-950' },
  { title: 'AI Job Tracker', subtitle: 'Workflow platform', gradient: 'from-slate-200/90 via-slate-50 to-slate-300/80', light: true },
  { title: 'Cloud Monitoring Tool', subtitle: 'Operations console', gradient: 'from-indigo-500/35 via-slate-900 to-slate-950' },
];

function RadialGauge({ value, label }: { value: number; label: string }) {
  const angle = Math.round((value / 100) * 360);
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative grid h-36 w-36 place-items-center rounded-full border border-white/8 bg-[rgba(9,11,16,0.6)]"
        style={{
          background: `conic-gradient(rgba(99,102,241,0.96) 0deg ${angle}deg, rgba(255,255,255,0.08) ${angle}deg 360deg)`,
          boxShadow: '0 24px 44px -30px rgba(99,102,241,0.42)',
        }}
      >
        <div className="grid h-[104px] w-[104px] place-items-center rounded-full border border-white/8 bg-[rgba(11,13,17,0.92)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="text-center">
            <div className="text-[44px] font-semibold leading-none tracking-tight text-white">{value}</div>
            <div className="mt-1 text-sm text-white/60">%</div>
          </div>
        </div>
      </div>
      <p className="text-sm font-medium text-white/78">{label}</p>
    </div>
  );
}

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

  const profileStrength = profile ? 85 : 58;
  const atsMatch = titles.length > 0 ? 78 : 52;
  const interviewRate = stats.interviews > 0 ? 42 : 18;

  const careerTimeline = [
    { year: '2023', role: 'Senior Data Engineer', company: 'TechCorp', body: 'Led ETL pipeline development and cloud migration.' },
    { year: '2020', role: 'Data Analyst', company: 'Nexis Insights', body: 'Performed analytics, reporting, and business intelligence work.' },
    { year: '2018', role: 'IT Specialist', company: 'Global Solutions', body: 'Managed systems, infrastructure, and internal operational support.' },
    { year: '2016', role: 'Junior Developer', company: 'Innovatech', body: 'Developed and tested web applications across product teams.' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Executive profile"
        title={name ? `${name}, your premium dashboard is ready.` : 'Your premium dashboard is ready.'}
        description="A quiet-luxury interface for technical storytelling, live profile metrics, and portfolio presentation — built around a data-driven hierarchy."
        action={
          <>
            <Link href="/resume-optimizer" className="btn-filled btn-sm !min-h-0 px-5 py-3">Resume AI</Link>
            <Link href="/jobs" className="btn-gray btn-sm !min-h-0 px-5 py-3">Open Jobs</Link>
          </>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[1.08fr,1.42fr]">
        <div className="space-y-6">
          <div className="premium-panel p-7">
            <h2 className="serif-display text-[24px] font-semibold tracking-tight text-white">Technical Stack</h2>
            <div className="mt-5 h-px bg-white/10" />
            <div className="mt-8 flex flex-wrap gap-4">
              {techStack.map((tech) => (
                <div key={tech.label} className={`rounded-[18px] border border-white/12 bg-white/[0.04] px-6 py-3 text-lg font-medium text-white ${tech.glow}`}>
                  {tech.label}
                </div>
              ))}
            </div>
          </div>

          <div className="premium-panel p-7">
            <h2 className="serif-display text-[24px] font-semibold tracking-tight text-white">Career Timeline</h2>
            <div className="mt-5 h-px bg-white/10" />
            <div className="relative mt-6 space-y-8 pl-9 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-[linear-gradient(180deg,rgba(148,163,184,0.65),rgba(99,102,241,0.38),rgba(148,163,184,0.25))]">
              {careerTimeline.map((item) => (
                <div key={item.year + item.role} className="relative">
                  <span className="absolute left-[-28px] top-5 h-4 w-4 rounded-full border border-indigo-200/50 bg-indigo-300 shadow-[0_0_20px_rgba(165,180,252,0.5)]" />
                  <div className="grid gap-3 md:grid-cols-[52px_1fr] md:gap-5">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-[15px] font-medium text-white/92">{item.year}</div>
                    <div>
                      <p className="serif-display text-[18px] font-semibold text-white">{item.role}</p>
                      <p className="text-[17px] text-white/84">{item.company}</p>
                      <p className="mt-2 text-[15px] leading-7 text-white/54">{item.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="premium-panel p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="serif-display text-[24px] font-semibold tracking-tight text-white">Live Stats</h2>
                <div className="mt-5 h-px bg-white/10" />
              </div>
              <GaugeCircle className="mt-1 h-5 w-5 text-indigo-300" />
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <RadialGauge value={profileStrength} label="Profile Strength" />
              <RadialGauge value={atsMatch} label="ATS Match" />
              <RadialGauge value={interviewRate} label="Interview Rate" />
            </div>
            <div className="mt-8 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                <div className="flex items-center gap-3"><TrendingUp className="h-4 w-4 text-indigo-300" /><span className="text-white/76">Applications Sent</span></div>
                <span className="text-[34px] font-semibold tracking-tight text-white">{stats.applied || 56}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-white/70" /><span className="text-white/76">Interviews Scheduled</span></div>
                <span className="text-[34px] font-semibold tracking-tight text-white">{stats.interviews || 12}</span>
              </div>
            </div>
          </div>

          <div className="premium-panel p-7">
            <h2 className="serif-display text-[24px] font-semibold tracking-tight text-white">Project Gallery</h2>
            <div className="mt-5 h-px bg-white/10" />
            <div className="mt-7 grid gap-5 lg:grid-cols-3">
              {projects.map((project) => (
                <div key={project.title} className="premium-hover rounded-[22px] border border-white/10 bg-white/[0.03] p-3">
                  <div className="rounded-[18px] border border-white/10 bg-[rgba(5,7,11,0.92)] p-3 shadow-[0_20px_40px_-34px_rgba(0,0,0,0.8)]">
                    <div className="mb-3 flex items-center gap-1.5 px-1">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className={`overflow-hidden rounded-[14px] border ${project.light ? 'border-slate-300/20 bg-white' : 'border-white/8 bg-slate-950'} p-3`}>
                      <div className={`h-40 rounded-[12px] bg-gradient-to-br ${project.gradient} p-3`}>
                        <div className="grid h-full grid-rows-[auto_1fr_auto] gap-3">
                          <div className="grid grid-cols-4 gap-2">
                            <div className={`h-2 rounded-full ${project.light ? 'bg-slate-400/50' : 'bg-white/18'}`} />
                            <div className={`h-2 rounded-full ${project.light ? 'bg-slate-400/30' : 'bg-white/10'}`} />
                            <div className={`h-2 rounded-full ${project.light ? 'bg-slate-400/30' : 'bg-white/10'}`} />
                            <div className={`h-2 rounded-full ${project.light ? 'bg-slate-400/30' : 'bg-white/10'}`} />
                          </div>
                          <div className="grid grid-cols-[1.15fr_0.85fr] gap-3">
                            <div className={`rounded-xl ${project.light ? 'bg-slate-700/10' : 'bg-black/20'} p-3`}>
                              <div className={`h-16 rounded-lg ${project.light ? 'bg-slate-500/15' : 'bg-indigo-400/18'}`} />
                              <div className={`mt-3 h-2 rounded-full ${project.light ? 'bg-slate-500/20' : 'bg-white/12'}`} />
                              <div className={`mt-2 h-2 w-2/3 rounded-full ${project.light ? 'bg-slate-500/14' : 'bg-white/9'}`} />
                            </div>
                            <div className={`space-y-3 rounded-xl ${project.light ? 'bg-slate-700/8' : 'bg-black/18'} p-3`}>
                              <div className={`h-12 rounded-lg ${project.light ? 'bg-slate-500/18' : 'bg-white/10'}`} />
                              <div className={`h-12 rounded-lg ${project.light ? 'bg-slate-500/12' : 'bg-indigo-300/16'}`} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className={`h-9 rounded-xl ${project.light ? 'bg-slate-500/16' : 'bg-white/10'}`} />
                            <div className={`h-9 rounded-xl ${project.light ? 'bg-slate-500/10' : 'bg-indigo-300/14'}`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-2 pb-1 pt-4">
                    <p className="text-[18px] font-medium tracking-tight text-white">{project.title}</p>
                    <p className="mt-1 text-[15px] text-white/58">{project.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Sparkles, label: 'Resume AI', body: 'ATS tuning and keyword refinement across multiple target roles.', href: '/resume-optimizer' },
          { icon: Search, label: 'Job Discovery', body: 'Search, inspect, and save roles using a focused research workflow.', href: '/jobs' },
          { icon: Workflow, label: 'Application Pipeline', body: 'Track progress from saved roles to live interviews in one place.', href: '/tracker' },
        ].map((card) => (
          <Link key={card.label} href={card.href} className="premium-card premium-hover flex items-start gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-400/16 bg-indigo-400/10 text-indigo-200 shadow-[0_14px_30px_-22px_rgba(99,102,241,0.7)]">
              <card.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="serif-display text-[20px] font-semibold text-white">{card.label}</p>
              <p className="mt-2 text-[15px] leading-7 text-white/56">{card.body}</p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
