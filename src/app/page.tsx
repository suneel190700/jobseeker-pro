import Link from 'next/link';
import { ArrowRight, BarChart3, BrainCircuit, CheckCircle2, Clock3, Cpu, Radar, Search, Shield, Sparkles, Waves } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="app-ambient" aria-hidden />
      <header className="sticky top-0 z-40 border-b border-[var(--separator)] bg-[rgba(11,15,20,0.84)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/25 bg-[linear-gradient(135deg,rgba(0,194,255,.22),rgba(124,58,237,.18))] text-cyan-200 shadow-[0_18px_36px_-24px_rgba(0,194,255,0.55)]"><BrainCircuit className="h-5 w-5" /></div>
            <div><p className="text-[15px] font-semibold tracking-tight text-white">JobSeeker Pro</p><p className="text-xs text-white/42">AI Command Center</p></div>
          </div>
          <div className="flex items-center gap-2"><Link href="/auth/login" className="btn-gray btn-sm !min-h-0 px-4 py-3">Log in</Link><Link href="/auth/signup" className="btn-filled btn-sm !min-h-0 px-5 py-3">Get started</Link></div>
        </div>
      </header>

      <main className="relative z-[1]">
        <section className="mx-auto max-w-6xl px-5 pb-14 pt-16 md:pt-24">
          <div className="premium-panel overflow-hidden px-6 py-12 sm:px-10 md:px-12 md:py-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(0,194,255,0.14),transparent_24%),radial-gradient(circle_at_86%_18%,rgba(124,58,237,0.12),transparent_22%)]" />
            <div className="relative text-center">
              <p className="page-eyebrow inline-flex">Distinct product identity</p>
              <h1 className="mx-auto mt-5 max-w-4xl text-[42px] font-semibold tracking-[-0.05em] text-white sm:text-6xl md:text-7xl">A live AI command center<span className="block text-cyan-300">for your job search workflow.</span></h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/60">Search roles, tune resumes, practice interviews, and manage your pipeline in a layout that feels like a tool, not a template.</p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3"><Link href="/auth/signup" className="btn-filled gap-2">Launch workspace <ArrowRight className="h-4 w-4" /></Link><Link href="/auth/login" className="btn-gray btn-sm !min-h-0 px-6 py-3">I have an account</Link></div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { icon: Search, value: '323K+', label: 'Sources' },
              { icon: Radar, value: 'AI feed', label: 'Insights' },
              { icon: Cpu, value: 'Live', label: 'Modules' },
              { icon: Shield, value: '16K+', label: 'ATS tools' },
              { icon: Waves, value: 'Panel', label: 'Layout' },
              { icon: Clock3, value: '24h', label: 'Timing' },
            ].map((s) => (
              <div key={s.label} className="metric-card p-5 text-center"><s.icon className="mx-auto mb-3 h-5 w-5 text-cyan-300" /><p className="text-xl font-semibold text-white">{s.value}</p><p className="caption mt-1 !normal-case !tracking-normal font-medium">{s.label}</p></div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl border-t border-[var(--separator)] px-5 py-20">
          <div className="mb-14 text-center"><span className="pill border border-white/10 bg-white/[0.04] text-white/66"><Sparkles className="h-3.5 w-3.5" /> Modules</span><h2 className="title-1 mt-5 text-white">Built like a live operating surface</h2><p className="subhead mx-auto mt-3 max-w-xl text-white/58">The product language is panels, feeds, rails, and insights — not generic marketing cards.</p></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Resume Analysis', 'JD-aware ATS tuning and bullet improvement in a command layout.'],
              ['Jobs Intelligence', 'Split-view search with fit analysis and signal-first review.'],
              ['Interview Studio', 'Focused rehearsal surface with less noise and better pacing.'],
              ['Tracker Grid', 'Pipeline visibility with faster state changes and cleaner status.'],
              ['Live Insights', 'Persistent AI guidance instead of hidden suggestions.'],
              ['Command Navigation', 'Rail-first UX that feels like a real tool environment.'],
            ].map(([title, desc]) => (
              <div key={title} className="premium-card premium-hover p-6"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/18 bg-cyan-400/10 text-cyan-200"><BrainCircuit className="h-5 w-5" /></div><h3 className="title-3 mb-2 text-white">{title}</h3><p className="subhead text-[15px] leading-relaxed text-white/56">{desc}</p></div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl border-t border-[var(--separator)] px-5 py-20 text-center">
          <span className="pill border border-white/10 bg-white/[0.04] text-white/66"><BarChart3 className="h-3.5 w-3.5" /> Flow</span>
          <h2 className="title-1 mt-5 text-white">Three steps. One control surface.</h2>
          <div className="mt-14 grid gap-10 text-left md:grid-cols-3">
            {[
              { n: '01', t: 'Load your resume', d: 'Bring your baseline profile into the system.' },
              { n: '02', t: 'Scan active roles', d: 'Search and inspect the best-fit jobs faster.' },
              { n: '03', t: 'Ship stronger applications', d: 'Optimize, practice, and track in the same interface.' },
            ].map((s) => (
              <div key={s.n}><div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] font-semibold text-cyan-300">{s.n}</div><h3 className="headline mb-2 text-white">{s.t}</h3><p className="subhead leading-relaxed text-white/56">{s.d}</p></div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl border-t border-[var(--separator)] px-5 py-20">
          <div className="premium-card mx-auto max-w-3xl p-10 text-center md:p-12"><div className="mb-5 flex justify-center gap-2 text-cyan-300"><CheckCircle2 className="h-5 w-5" /><CheckCircle2 className="h-5 w-5" /><CheckCircle2 className="h-5 w-5" /></div><p className="text-xl font-medium leading-relaxed text-white/72 md:text-2xl">This direction is intentionally not corporate, not editorial, and not dark-glass SaaS. It is meant to feel like an active AI system.</p><p className="footnote mt-5">Distinct by structure first, not only by colors.</p></div>
        </section>
      </main>
    </div>
  );
}
