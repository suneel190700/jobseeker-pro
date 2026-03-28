import Link from 'next/link';
import {
  Sparkles,
  Search,
  FileText,
  Mic,
  Users,
  BarChart3,
  Zap,
  ArrowRight,
  CheckCircle,
  Shield,
  Globe,
  Target,
  Clock,
  Star,
  Briefcase,
  TrendingUp,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="app-root min-h-screen text-[var(--text-primary)]">
      <div className="app-ambient" aria-hidden />
      <header className="relative z-10 border-b" style={{ borderColor: 'var(--separator)', background: 'rgba(5,6,8,0.72)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 h-16">
          <Link href="/" className="flex items-center gap-2.5 press">
            <div
              className="h-9 w-9 rounded-[var(--radius-sm)] flex items-center justify-center ring-1 ring-white/10"
              style={{ background: 'linear-gradient(145deg, var(--accent), var(--accent-secondary))' }}
            >
              <Sparkles className="h-[18px] w-[18px] text-[var(--bg-primary)]" strokeWidth={2.2} />
            </div>
            <span className="font-bold text-[15px] tracking-tight">
              JobSeeker<span className="text-[var(--accent)]"> Pro</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {['Features', 'How it Works', 'Pricing'].map((t) => (
              <a
                key={t}
                href={`#${t.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-2 text-[13px] font-semibold rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)] transition-colors"
              >
                {t}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Log in
            </Link>
            <Link href="/auth/signup" className="btn-filled btn-sm !min-h-0 py-2.5 px-5">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-[1]">
        <section className="max-w-6xl mx-auto px-5 pt-16 pb-12 md:pt-24 md:pb-16 text-center">
          <p className="page-eyebrow inline-block">AI career workspace</p>
          <h1 className="mt-3 text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08]">
            Hire yourself into
            <br />
            <span
              className="bg-gradient-to-r from-[var(--accent)] via-[var(--accent-secondary)] to-[var(--accent)] bg-clip-text text-transparent"
              style={{ backgroundSize: '200% auto' }}
            >
              the right role
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            One sleek workspace for job search, ATS-tuned resumes, voice interviews, and outreach — built for momentum, not clutter.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/auth/signup" className="btn-filled gap-2">
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/auth/login" className="btn-gray btn-sm !min-h-0 py-3 px-6">
              I have an account
            </Link>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-5 pb-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { icon: Globe, value: '323K+', label: 'Sources', c: 'var(--info)' },
              { icon: Target, value: '95+', label: 'ATS target', c: 'var(--accent-secondary)' },
              { icon: Briefcase, value: 'TheirStack', label: 'Job data', c: 'var(--accent)' },
              { icon: Shield, value: '16K+', label: 'ATS tools', c: 'var(--success)' },
              { icon: TrendingUp, value: '195', label: 'Countries', c: 'var(--warning)' },
              { icon: Star, value: '4.9', label: 'Avg rating', c: 'var(--destructive)' },
            ].map((s) => (
              <div
                key={s.label}
                className="surface-interactive p-5 text-center border border-[var(--separator)]"
              >
                <s.icon className="h-5 w-5 mx-auto mb-2" style={{ color: s.c }} />
                <p className="text-xl font-bold">{s.value}</p>
                <p className="caption mt-1 !normal-case !tracking-normal font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="max-w-6xl mx-auto px-5 py-20 border-t border-[var(--separator)]">
          <div className="text-center mb-14">
            <span className="pill border border-[var(--accent-dim)] bg-[var(--accent-dim)] text-[var(--accent)] mb-4">
              <Zap className="h-3.5 w-3.5" /> Toolkit
            </span>
            <h2 className="title-1 mt-4">Everything in one flow</h2>
            <p className="subhead mt-3 max-w-lg mx-auto">Fewer tabs. Fewer templates. More signal on what actually gets you interviews.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: FileText, title: 'Resume AI', desc: 'JD-aware rewrites, keyword coverage, and exports that stay readable to humans and ATS.', c: 'var(--accent)' },
              { icon: Search, title: 'Job discovery', desc: 'Search powered by TheirStack with filters that respect how you actually want to work.', c: 'var(--info)' },
              { icon: Mic, title: 'Voice mock interview', desc: 'Practice out loud with structured feedback — pacing, fillers, and clarity.', c: 'var(--accent-secondary)' },
              { icon: Users, title: 'Networking', desc: 'Outreach drafts and recruiter angles without sounding like a mail-merge robot.', c: 'var(--success)' },
              { icon: BarChart3, title: 'Analytics', desc: 'Funnel clarity from saved roles to offers — so you know where time pays off.', c: 'var(--warning)' },
              { icon: Shield, title: 'Cover letters', desc: 'Tone-matched letters grounded in your resume and the posting.', c: 'var(--accent)' },
            ].map((f) => (
              <div
                key={f.title}
                className="group surface-elevated p-6 border border-[var(--separator)] transition-all duration-300 hover:border-[rgba(44,224,196,0.25)] hover:shadow-glow-sm"
              >
                <div
                  className="h-11 w-11 rounded-[var(--radius-md)] flex items-center justify-center mb-4 border"
                  style={{ background: 'var(--surface-1)', borderColor: 'var(--separator)' }}
                >
                  <f.icon className="h-5 w-5" style={{ color: f.c }} />
                </div>
                <h3 className="title-3 mb-2">{f.title}</h3>
                <p className="subhead text-[15px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="max-w-4xl mx-auto px-5 py-20 text-center border-t border-[var(--separator)]">
          <span className="pill border border-[var(--separator)] bg-[var(--surface-1)] text-[var(--text-secondary)] mb-4">
            <Clock className="h-3.5 w-3.5" /> Quick start
          </span>
          <h2 className="title-1 mt-4">Three steps, same afternoon</h2>
          <div className="grid md:grid-cols-3 gap-10 mt-14 text-left">
            {[
              { n: '01', t: 'Bring your resume', d: 'Upload once. We structure it for scoring, rewrites, and job matching.', ac: 'var(--accent)' },
              { n: '02', t: 'Search with intent', d: 'Run tight searches, save roles to the tracker, and score fit per posting.', ac: 'var(--accent-secondary)' },
              { n: '03', t: 'Ship better applications', d: 'Optimize, draft outreach, and rehearse answers — all wired to the same job context.', ac: 'var(--success)' },
            ].map((s) => (
              <div key={s.n}>
                <div
                  className="inline-flex h-12 w-12 rounded-[var(--radius-md)] items-center justify-center font-bold border mb-4"
                  style={{ borderColor: 'var(--separator)', color: s.ac, background: 'var(--surface-1)' }}
                >
                  {s.n}
                </div>
                <h3 className="headline mb-2">{s.t}</h3>
                <p className="subhead leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-5 py-20 border-t border-[var(--separator)]">
          <div className="surface-elevated p-10 md:p-12 text-center max-w-3xl mx-auto border border-[var(--separator)]">
            <div className="flex justify-center gap-1 mb-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-5 w-5 text-[var(--warning)] fill-[var(--warning)]" />
              ))}
            </div>
            <p className="text-xl md:text-2xl font-medium text-[var(--text-secondary)] leading-relaxed">
              &ldquo;Callbacks jumped once the resume and JD were speaking the same language. The tracker meant I stopped losing roles in
              spreadsheets.&rdquo;
            </p>
            <p className="mt-5 footnote">— Product manager, offer in 4 weeks</p>
          </div>
        </section>

        <section id="pricing" className="max-w-6xl mx-auto px-5 py-20 border-t border-[var(--separator)]">
          <div className="text-center mb-12">
            <span className="pill border border-[var(--separator)] bg-[var(--surface-1)] text-[var(--text-secondary)] mb-4">
              <Sparkles className="h-3.5 w-3.5" /> Pricing
            </span>
            <h2 className="title-1 mt-4">Free tier stays useful</h2>
            <p className="subhead mt-2">Upgrade only when you outgrow daily limits.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            <div className="surface-elevated p-8 border border-[var(--separator)]">
              <h3 className="title-3">Free</h3>
              <p className="text-3xl font-bold mt-2">
                $0<span className="text-sm font-normal text-[var(--text-tertiary)]">/mo</span>
              </p>
              <ul className="mt-6 space-y-3 text-left">
                {['Daily AI resume passes', 'Job search & saves', 'Mock interview sessions', 'Tracker & analytics basics'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[15px] text-[var(--text-secondary)]">
                    <CheckCircle className="h-4 w-4 text-[var(--accent)] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="mt-8 block w-full btn-gray text-center py-3 !min-h-0">
                Create account
              </Link>
            </div>
            <div
              className="surface-elevated p-8 border relative overflow-hidden"
              style={{ borderColor: 'rgba(44, 224, 196, 0.35)', background: 'linear-gradient(165deg, var(--accent-dim) 0%, var(--bg-elevated) 45%)' }}
            >
              <span className="pill absolute top-4 right-4 border border-[var(--accent-dim-strong)] bg-[var(--bg-elevated)] text-[var(--accent)] text-[10px]">
                Coming soon
              </span>
              <h3 className="title-3">Pro</h3>
              <p className="text-3xl font-bold mt-2">
                $19<span className="text-sm font-normal text-[var(--text-tertiary)]">/mo</span>
              </p>
              <ul className="mt-6 space-y-3 text-left">
                {['Higher daily limits', 'Priority models', 'Advanced analytics', 'Recruiter outreach depth'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[15px] text-[var(--text-secondary)]">
                    <CheckCircle className="h-4 w-4 text-[var(--accent-secondary)] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button type="button" disabled className="mt-8 w-full btn-filled opacity-40 cursor-not-allowed">
                Coming soon
              </button>
            </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-5 py-24 text-center border-t border-[var(--separator)]">
          <h2 className="title-1">Ready when you are</h2>
          <p className="subhead mt-3 text-[17px]">No credit card for the free tier.</p>
          <div className="mt-8">
            <Link href="/auth/signup" className="btn-filled inline-flex gap-2">
              Open the workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <footer className="border-t border-[var(--separator)] py-10 px-5">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[var(--text-tertiary)]">
            <div className="flex items-center gap-2 font-semibold text-[var(--text-secondary)]">
              <Sparkles className="h-4 w-4 text-[var(--accent)]" />
              JobSeeker Pro
            </div>
            <span>© {new Date().getFullYear()} JobSeeker Pro</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
