import Link from 'next/link';
import { ArrowRight, BarChart3, Briefcase, CheckCircle, Clock, FileText, Globe, Mic, Search, Shield, Sparkles, Star, Target, TrendingUp, Users, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="app-ambient" aria-hidden />
      <header className="sticky top-0 z-40 border-b border-[var(--separator)] bg-[rgba(247,243,236,0.84)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1f4fcc_0%,#3a73eb_100%)] text-white shadow-[0_16px_34px_-24px_rgba(41,88,214,0.55)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-tight">JobSeeker Pro</p>
              <p className="text-xs text-[var(--text-secondary)]">A calmer job search workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="btn-gray btn-sm !min-h-0 px-4 py-3">Log in</Link>
            <Link href="/auth/signup" className="btn-filled btn-sm !min-h-0 px-5 py-3">Get started</Link>
          </div>
        </div>
      </header>

      <main className="relative z-[1]">
        <section className="mx-auto max-w-6xl px-5 pb-14 pt-16 md:pt-24">
          <div className="premium-panel overflow-hidden px-6 py-12 sm:px-10 md:px-12 md:py-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(41,88,214,0.1),transparent_24%),radial-gradient(circle_at_86%_20%,rgba(17,122,101,0.08),transparent_24%)]" />
            <div className="relative text-center">
              <p className="page-eyebrow inline-flex">Editorial AI workspace</p>
              <h1 className="mx-auto mt-5 max-w-4xl text-[42px] font-semibold tracking-[-0.05em] text-[var(--text-primary)] sm:text-6xl md:text-7xl">
                A premium job search product
                <span className="block text-[var(--accent)]">that does not look like everyone else’s.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
                Search roles, tailor resumes, practice interviews, and manage your pipeline in a calmer, more distinctive interface.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Link href="/auth/signup" className="btn-filled gap-2">Start free <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/auth/login" className="btn-gray btn-sm !min-h-0 px-6 py-3">I have an account</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { icon: Globe, value: '323K+', label: 'Sources' },
              { icon: Target, value: '95+', label: 'ATS target' },
              { icon: Briefcase, value: 'TheirStack', label: 'Job data' },
              { icon: Shield, value: '16K+', label: 'ATS tools' },
              { icon: TrendingUp, value: '195', label: 'Countries' },
              { icon: Star, value: '4.9', label: 'Avg rating' },
            ].map((s) => (
              <div key={s.label} className="metric-card p-5 text-center">
                <s.icon className="mx-auto mb-3 h-5 w-5 text-[var(--accent)]" />
                <p className="text-xl font-semibold">{s.value}</p>
                <p className="caption mt-1 !normal-case !tracking-normal font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl border-t border-[var(--separator)] px-5 py-20">
          <div className="mb-14 text-center">
            <span className="pill border border-[var(--separator)] bg-white/70 text-[var(--text-secondary)]"><Zap className="h-3.5 w-3.5" /> Toolkit</span>
            <h2 className="title-1 mt-5">Everything in one refined workflow</h2>
            <p className="subhead mx-auto mt-3 max-w-xl">No noisy gradients. No cloned startup dashboard look. Just a sharper interface for serious job search work.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: FileText, title: 'Resume AI', desc: 'ATS-aware rewrites and improvements grounded in the actual role.' },
              { icon: Search, title: 'Job search', desc: 'Research and shortlist roles in a cleaner review flow.' },
              { icon: Mic, title: 'Mock interview', desc: 'Practice answers and pacing in a more focused workspace.' },
              { icon: Users, title: 'Networking', desc: 'Draft outreach that sounds like a person, not automation.' },
              { icon: BarChart3, title: 'Analytics', desc: 'Understand funnel movement from saved roles to offers.' },
              { icon: Shield, title: 'Cover letters', desc: 'Generate role-specific letters with stronger tone control.' },
            ].map((f) => (
              <div key={f.title} className="premium-card premium-hover p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(41,88,214,0.08)] text-[var(--accent)]">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="title-3 mb-2">{f.title}</h3>
                <p className="subhead text-[15px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl border-t border-[var(--separator)] px-5 py-20 text-center">
          <span className="pill border border-[var(--separator)] bg-white/70 text-[var(--text-secondary)]"><Clock className="h-3.5 w-3.5" /> Quick start</span>
          <h2 className="title-1 mt-5">Three steps, same afternoon</h2>
          <div className="mt-14 grid gap-10 text-left md:grid-cols-3">
            {[
              { n: '01', t: 'Upload your resume', d: 'Bring your base resume into the workspace once.' },
              { n: '02', t: 'Target better roles', d: 'Search intentionally and score only the right jobs.' },
              { n: '03', t: 'Send sharper applications', d: 'Optimize, draft, and practice in the same flow.' },
            ].map((s) => (
              <div key={s.n}>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--separator)] bg-white/70 font-semibold text-[var(--accent)]">{s.n}</div>
                <h3 className="headline mb-2">{s.t}</h3>
                <p className="subhead leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl border-t border-[var(--separator)] px-5 py-20">
          <div className="premium-card mx-auto max-w-3xl p-10 text-center md:p-12">
            <div className="mb-5 flex justify-center gap-1">
              {[1,2,3,4,5].map((i) => <Star key={i} className="h-5 w-5 fill-[var(--warning)] text-[var(--warning)]" />)}
            </div>
            <p className="text-xl font-medium leading-relaxed text-[var(--text-secondary)] md:text-2xl">“This feels more like a premium work tool than a typical AI job app. I can stay in it longer without getting tired.”</p>
            <p className="footnote mt-5">— Early product feedback</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl border-t border-[var(--separator)] px-5 py-20">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="premium-card p-8">
              <h3 className="title-3">Free</h3>
              <p className="mt-2 text-3xl font-bold">$0<span className="text-sm font-normal text-[var(--text-tertiary)]">/mo</span></p>
              <ul className="mt-6 space-y-3">
                {['Daily AI resume passes', 'Job search & saves', 'Mock interview sessions', 'Tracker & analytics basics'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[15px] text-[var(--text-secondary)]"><CheckCircle className="h-4 w-4 text-[var(--success)]" />{f}</li>
                ))}
              </ul>
              <Link href="/auth/signup" className="mt-8 block w-full btn-gray text-center py-3 !min-h-0">Create account</Link>
            </div>
            <div className="premium-panel p-8">
              <span className="pill absolute right-4 top-4 border border-[rgba(41,88,214,0.12)] bg-[var(--accent-dim)] text-[var(--accent)] text-[10px]">Coming soon</span>
              <h3 className="title-3">Pro</h3>
              <p className="mt-2 text-3xl font-bold">Premium<span className="text-sm font-normal text-[var(--text-tertiary)]"> plan</span></p>
              <ul className="mt-6 space-y-3">
                {['Higher AI limits', 'Advanced resume tailoring', 'More exports and tracking depth', 'Priority future modules'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[15px] text-[var(--text-secondary)]"><CheckCircle className="h-4 w-4 text-[var(--accent)]" />{f}</li>
                ))}
              </ul>
              <div className="mt-8 rounded-2xl border border-[var(--separator)] bg-white/70 p-4 text-sm text-[var(--text-secondary)]">Built to feel distinct from the usual dark SaaS templates from the first screen.</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
