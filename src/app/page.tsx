import Link from 'next/link';
import { Sparkles, Search, FileText, Mic, Users, BarChart3, Zap, ArrowRight, CheckCircle, Shield, Globe, Target, Clock, Star, Briefcase, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0d1f3c 40%, #0a1628 100%)' }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />

      {/* Pill Navbar */}
      <header className="relative z-50 flex justify-center pt-5 px-6">
        <nav className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl px-2.5 py-1.5" style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 4px 20px rgba(0,0,0,0.3)' }}>
          <div className="flex items-center gap-2.5 pl-2 pr-4">
            <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}><Sparkles className="h-4 w-4 text-white" /></div>
            <span className="text-[15px] font-semibold text-white">JobSeeker Pro</span>
          </div>
          <div className="hidden sm:flex items-center">
            {['Features', 'How it Works', 'Pricing'].map(t => (
              <a key={t} href={`#${t.toLowerCase().replace(/\s+/g, '-')}`} className="px-4 py-2 text-[13px] font-medium text-slate-400 hover:text-white transition-colors">{t}</a>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Link href="/auth/login" className="px-4 py-2 text-[13px] font-medium text-slate-400 hover:text-white transition-colors">Login</Link>
            <Link href="/auth/signup" className="px-5 py-2 text-[13px] font-semibold text-white rounded-full transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>Get Started</Link>
          </div>
        </nav>
      </header>

      {/* Powered by badges */}
      <div className="relative z-10 flex justify-center mt-10">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">Powered by</span>
          {[{ name: 'LinkedIn', color: '#0a66c2' }, { name: 'Indeed', color: '#2164f3' }, { name: 'Glassdoor', color: '#0caa41' }, { name: '16K+ ATS', color: '#8b5cf6' }].map(b => (
            <span key={b.name} className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: b.color }} />{b.name}
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-14 pb-8 text-center">
        <h1 className="text-6xl sm:text-7xl font-extrabold leading-[1.05] tracking-tight">
          <span style={{ background: 'linear-gradient(135deg, #60a5fa, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>JobSeeker Pro</span>
          <br /><span className="text-white">Career Intelligence</span>
        </h1>
        <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">AI-powered resume optimization, job matching across 323K+ sites, voice mock interviews, and smart networking tools. Build your career with precision.</p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/auth/signup" className="group px-8 py-3.5 text-sm font-semibold text-white rounded-xl flex items-center gap-2 transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>Explore Features <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" /></Link>
          <Link href="/auth/login" className="px-8 py-3.5 text-sm font-semibold text-slate-300 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all backdrop-blur-sm">View Demo</Link>
        </div>
      </section>

      {/* Stats - glassmorphic cards */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[{ icon: Globe, value: '323K+', label: 'Job Sources', color: '#3b82f6' }, { icon: Target, value: '95+', label: 'ATS Score', color: '#8b5cf6' }, { icon: Briefcase, value: '179M', label: 'Jobs Indexed', color: '#06b6d4' }, { icon: Shield, value: '16K+', label: 'ATS Platforms', color: '#10b981' }, { icon: TrendingUp, value: '195', label: 'Countries', color: '#f59e0b' }, { icon: Star, value: '4.9', label: 'User Rating', color: '#ec4899' }].map(s => (
            <div key={s.label} className="rounded-2xl border border-white/[0.06] p-5 text-center transition-all hover:border-white/[0.1] hover:bg-white/[0.02]" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)' }}>
              <s.icon className="h-5 w-5 mx-auto mb-2" style={{ color: s.color }} />
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-5xl mx-auto px-6 mt-32">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 text-xs font-semibold text-blue-400 mb-4"><Zap className="h-3 w-3" /> Core Features</span>
          <h2 className="text-4xl font-bold text-white">Everything you need to land the job</h2>
          <p className="mt-3 text-base text-slate-500 max-w-xl mx-auto">Six AI-powered tools working together to maximize your chances.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[{ icon: FileText, title: 'Resume AI Engine', desc: 'Deep JD analysis, ATS keyword matching, adaptive tone. Targets 95+ scores on Workday, Greenhouse, Lever.', color: '#3b82f6', glow: 'rgba(59,130,246,0.1)' }, { icon: Search, title: 'Smart Job Search', desc: 'Aggregates from LinkedIn, Indeed, Glassdoor & 16K+ ATS. Full descriptions, salary data, 1-click apply.', color: '#06b6d4', glow: 'rgba(6,182,212,0.1)' }, { icon: Mic, title: 'Voice Mock Interview', desc: 'AI interviewer with real-time scoring. Filler word detection, pace analysis, confidence rating.', color: '#ec4899', glow: 'rgba(236,72,153,0.1)' }, { icon: Users, title: 'Networking Suite', desc: 'Find hiring managers on LinkedIn, generate cold emails, discover referral paths into any company.', color: '#8b5cf6', glow: 'rgba(139,92,246,0.1)' }, { icon: BarChart3, title: 'Application Analytics', desc: 'Track your funnel: applied → screened → interviewed → offered. Conversion rates vs benchmarks.', color: '#f59e0b', glow: 'rgba(245,158,11,0.1)' }, { icon: Shield, title: 'AI Cover Letters', desc: 'Generate tailored cover letters per application. Matches company tone, references JD keywords.', color: '#10b981', glow: 'rgba(16,185,129,0.1)' }].map(f => (
            <div key={f.title} className="group rounded-2xl border border-white/[0.06] p-6 transition-all duration-300 hover:border-white/[0.1]" style={{ background: `linear-gradient(180deg, ${f.glow} 0%, transparent 100%)` }}>
              <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${f.color}15`, border: `1px solid ${f.color}25` }}><f.icon className="h-5 w-5" style={{ color: f.color }} /></div>
              <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="relative z-10 max-w-4xl mx-auto px-6 mt-32">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-4"><Clock className="h-3 w-3" /> Quick Start</span>
          <h2 className="text-4xl font-bold text-white">Get started in 3 minutes</h2>
        </div>
        <div className="grid grid-cols-3 gap-8">
          {[{ n: '01', title: 'Upload Resume', desc: 'Drop your PDF, DOCX or TXT. We parse it instantly.', color: '#3b82f6' }, { n: '02', title: 'Search & Match', desc: 'Jobs from 323K+ sites. AI scores each against your resume.', color: '#8b5cf6' }, { n: '03', title: 'Optimize & Apply', desc: 'AI rewrites your resume per job. Score jumps to 95+.', color: '#10b981' }].map(s => (
            <div key={s.n} className="text-center">
              <div className="inline-flex h-14 w-14 rounded-2xl items-center justify-center mb-5 border border-white/[0.06]" style={{ background: `${s.color}10` }}><span className="text-lg font-bold" style={{ color: s.color }}>{s.n}</span></div>
              <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 mt-32">
        <div className="rounded-2xl border border-white/[0.06] p-10 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex justify-center gap-1 mb-4">{[1,2,3,4,5].map(i => <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />)}</div>
          <p className="text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">&ldquo;I went from zero callbacks to 5 interviews in 2 weeks. The ATS optimization is incredible — my score went from 42% to 97%.&rdquo;</p>
          <p className="mt-4 text-sm text-slate-500">— Software Engineer, landed role at a Fortune 500</p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 max-w-4xl mx-auto px-6 mt-32">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5 text-xs font-semibold text-violet-400 mb-4"><Sparkles className="h-3 w-3" /> Pricing</span>
          <h2 className="text-4xl font-bold text-white">Start free, upgrade when ready</h2>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div className="rounded-2xl border border-white/[0.06] p-8" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h3 className="text-lg font-bold text-white">Free</h3>
            <p className="text-3xl font-bold text-white mt-2">$0<span className="text-sm font-normal text-slate-500">/month</span></p>
            <div className="mt-6 space-y-3">
              {['5 AI resume optimizations/day','10 job searches/day','3 mock interviews/day','2 downloads/day','Application tracker','LinkedIn optimizer'].map(f=>(
                <div key={f} className="flex items-center gap-2.5 text-sm text-slate-400"><CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0"/>{f}</div>
              ))}
            </div>
            <Link href="/auth/signup" className="mt-8 block w-full py-3 text-sm font-semibold text-white text-center rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-all">Get Started</Link>
          </div>
          <div className="rounded-2xl border border-blue-500/20 p-8 relative" style={{ background: 'linear-gradient(180deg, rgba(59,130,246,0.05) 0%, rgba(99,102,241,0.02) 100%)' }}>
            <div className="absolute top-4 right-4"><span className="inline-flex items-center rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold px-2 py-0.5">Coming Soon</span></div>
            <h3 className="text-lg font-bold text-white">Pro</h3>
            <p className="text-3xl font-bold text-white mt-2">$19<span className="text-sm font-normal text-slate-500">/month</span></p>
            <div className="mt-6 space-y-3">
              {['Unlimited AI optimizations','Unlimited job searches','Unlimited mock interviews','Unlimited downloads','Priority AI models','Recruiter finder & cold emails','Advanced analytics','Priority support'].map(f=>(
                <div key={f} className="flex items-center gap-2.5 text-sm text-slate-400"><CheckCircle className="h-4 w-4 text-blue-400 flex-shrink-0"/>{f}</div>
              ))}
            </div>
            <button disabled className="mt-8 block w-full py-3 text-sm font-semibold text-white text-center rounded-xl opacity-50 cursor-not-allowed" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>Coming Soon</button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 mt-32 pb-20 text-center">
        <h2 className="text-4xl font-bold text-white">Ready to accelerate your job search?</h2>
        <p className="mt-4 text-base text-slate-500">Join thousands using AI to land more interviews.</p>
        <div className="mt-8"><Link href="/auth/signup" className="group inline-flex px-8 py-3.5 text-sm font-semibold text-white rounded-xl items-center gap-2 transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>Start Free Now <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" /></Link></div>
        <div className="mt-5 flex items-center justify-center gap-5 text-xs text-slate-600">{['No credit card required','Free forever plan','Cancel anytime'].map(t=>(<span key={t} className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-emerald-500/50"/>{t}</span>))}</div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.04] py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-blue-500" /><span className="font-medium">JobSeeker Pro</span></div>
          <span>&copy; 2026 JobSeeker Pro. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
