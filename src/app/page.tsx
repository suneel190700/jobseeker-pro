import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, CheckCircle2, GaugeCircle, Layers3, Sparkles, Workflow } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="app-ambient" aria-hidden />
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[rgba(11,13,17,0.82)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-400/25 bg-[linear-gradient(135deg,rgba(99,102,241,.22),rgba(124,58,237,.18))] text-indigo-200 shadow-[0_18px_36px_-24px_rgba(99,102,241,0.45)]">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div>
              <p className="serif-display text-[15px] font-semibold tracking-tight text-white">JobSeeker Dashboard & Portfolio</p>
              <p className="text-xs text-white/42">Quiet luxury for technical storytelling</p>
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(99,102,241,0.18),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(139,92,246,0.12),transparent_22%)]" />
            <div className="relative text-center">
              <p className="page-eyebrow inline-flex">Premium executive dashboard</p>
              <h1 className="mx-auto mt-5 max-w-4xl text-[42px] font-semibold tracking-[-0.05em] text-white sm:text-6xl md:text-7xl">
                A refined portfolio and job search hub
                <span className="block text-indigo-300">engineered with quiet luxury.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/60">
                Present your technical stack, career progression, live profile strength, and flagship projects in a glass-finished interface built for executive credibility.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Link href="/auth/signup" className="btn-filled gap-2">Open dashboard <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/dashboard" className="btn-gray btn-sm !min-h-0 px-6 py-3">Preview interface</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-16 md:grid-cols-3">
          {[
            { icon: Layers3, title: 'Technical Stack', body: 'Glowing tags for core engineering strengths like Python, SQL, and cloud systems.' },
            { icon: Workflow, title: 'Career Timeline', body: 'A vertical Git-style commit line to show progression with clarity and authority.' },
            { icon: GaugeCircle, title: 'Live Stats', body: 'Animated radial gauges for profile strength, ATS match, and interview momentum.' },
          ].map((item) => (
            <div key={item.title} className="premium-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-400/16 bg-indigo-400/10 text-indigo-200 shadow-[0_14px_30px_-22px_rgba(99,102,241,0.7)]">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="serif-display text-[22px] font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-7 text-white/56">{item.body}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto max-w-4xl border-t border-white/8 px-5 py-20 text-center">
          <div className="premium-card p-10 md:p-12">
            <div className="mb-5 flex justify-center gap-2 text-indigo-300">
              <CheckCircle2 className="h-5 w-5" />
              <CheckCircle2 className="h-5 w-5" />
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <p className="text-xl font-medium leading-relaxed text-white/72 md:text-2xl">
              This build prioritizes high-contrast hierarchy, elegant typography, spacious bento composition, and restrained glassmorphism — exactly in the direction of your approved reference.
            </p>
            <p className="footnote mt-5">Deep obsidian, slate, electric indigo, and engineered restraint.</p>
            <div className="mt-8 flex justify-center">
              <Link href="/dashboard" className="btn-filled">Go to dashboard</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
