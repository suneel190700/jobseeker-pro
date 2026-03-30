import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#10131a', color: '#e1e2eb' }}>
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-8 h-16" style={{ background: 'rgba(16,19,26,0.6)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold text-[#bbc3ff] tracking-tighter font-['Manrope']">JobSeeker Pro</span>
          <div className="hidden md:flex gap-6">
            <a href="#features" className="text-[#e1e2eb]/60 text-sm font-medium hover:text-[#e1e2eb] transition-colors">Features</a>
            <a href="#pricing" className="text-[#e1e2eb]/60 text-sm font-medium hover:text-[#e1e2eb] transition-colors">Pricing</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-[#e1e2eb]/60 text-sm font-medium hover:text-[#e1e2eb] transition-colors">Login</Link>
          <Link href="/auth/signup" className="kinetic-btn px-6 py-2 text-sm">Get Started</Link>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero */}
        <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 overflow-hidden mesh-gradient">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#3c59fd]/20 blur-[160px] rounded-full -z-10 animate-pulse" />
          <div className="absolute bottom-20 right-0 w-[500px] h-[500px] bg-[#5203d5]/10 blur-[140px] rounded-full -z-10" />
          <div className="max-w-5xl w-full text-center space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4">
              <span className="text-[#cdbdff] text-xs font-bold tracking-widest uppercase">AI-Powered Career Suite</span>
              <span className="w-1 h-1 rounded-full bg-[#cdbdff]" />
              <span className="text-[#c4c5d9] text-xs font-medium">v2.0</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter leading-[0.9]">
              Land Your Dream Job <br/>
              <span className="bg-gradient-to-r from-[#bbc3ff] via-[#00daf3] to-[#cdbdff] bg-clip-text text-transparent">with AI Mastery</span>
            </h1>
            <p className="max-w-2xl mx-auto text-[#c4c5d9] text-lg md:text-xl leading-relaxed">
              AI-driven resume optimization, predictive interview coaching, job matching across 323K+ sources, and automated application tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link href="/auth/signup" className="kinetic-btn px-8 py-4 text-lg">Get Started Free</Link>
              <Link href="/auth/login" className="glass-panel px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all">View Demo</Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-24 w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-y border-white/5 backdrop-blur-sm bg-white/[0.02]">
            {[{v:'323K+',l:'Verified Sources'},{v:'95+',l:'Average ATS Score',c:'text-[#00daf3]'},{v:'14M',l:'Jobs Analyzed'},{v:'4.9/5',l:'User Rating',c:'text-[#cdbdff]'}].map(s => (
              <div key={s.l} className="flex flex-col items-center text-center space-y-1">
                <span className={`text-4xl font-bold tracking-tighter ${s.c || 'text-[#e1e2eb]'}`}>{s.v}</span>
                <span className="text-xs uppercase tracking-widest text-[#c4c5d9]">{s.l}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Features Bento */}
        <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">The Career Arsenal</h2>
            <p className="text-[#c4c5d9] max-w-xl">Every tool you need to outperform, powered by industry-leading AI.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 grid-rows-2 gap-4">
            {[
              {s:3,icon:'psychology',title:'AI Resume Architect',desc:'Dynamic content generation tailored to specific JDs with real-time ATS scoring across Workday, Lever, iCIMS, Greenhouse.',c:'text-[#bbc3ff]'},
              {s:3,icon:'record_voice_over',title:'Mock Interview AI',desc:'Voice-activated simulation with instant feedback on confidence, pace, filler words, and content quality.',c:'text-[#cdbdff]'},
              {s:2,icon:'assignment',title:'Smart Tracker',desc:'Unified kanban dashboard for all your applications across 50+ job boards.',c:'text-[#00daf3]'},
              {s:2,icon:'insights',title:'Market Insights',desc:'Real-time salary data and hiring trends for your specific role and region.',c:'text-[#e1e2eb]'},
              {s:2,icon:'group',title:'AI Networking',desc:'Automated outreach templates and LinkedIn strategy suggestions.',c:'text-[#bbc3ff]'},
            ].map(f => (
              <div key={f.title} className={`md:col-span-${f.s} glass-panel rounded-3xl p-8 transition-all hover:bg-white/[0.06]`}>
                <span className={`material-symbols-outlined ${f.c} text-4xl mb-4`}>{f.icon}</span>
                <h3 className="text-2xl font-bold mb-2">{f.title}</h3>
                <p className="text-[#c4c5d9] text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-white/[0.01] border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">The Three-Step Flow</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {[{n:'01',t:'Sync Your Profile',d:'Connect LinkedIn or upload your resume. Our AI analyzes your expertise in seconds.'},{n:'02',t:'Optimize & Train',d:'Generate hyper-targeted resumes and practice with AI until you hit a 90+ readiness score.'},{n:'03',t:'Launch & Win',d:'Apply with confidence. Track responses and negotiate offers using real-time market data.'}].map(s => (
                <div key={s.n} className="relative">
                  <div className="text-[120px] font-black text-white/[0.03] absolute -top-20 -left-4 z-0">{s.n}</div>
                  <div className="relative z-10 space-y-4">
                    <h3 className="text-2xl font-bold">{s.t}</h3>
                    <p className="text-[#c4c5d9]">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 px-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#007886]/10 blur-[120px] rounded-full -z-10" />
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Choose Your Velocity</h2>
              <p className="text-[#c4c5d9]">Transparent pricing for every stage.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-panel p-10 rounded-3xl flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#c4c5d9]">Starter</span>
                  <div className="mt-4 mb-8"><span className="text-5xl font-bold">$0</span><span className="text-[#c4c5d9]">/forever</span></div>
                  <ul className="space-y-4 mb-10">
                    {['5 AI Resume Generations / Day','Basic Application Tracker','10 Job Searches / Day','3 Mock Interviews / Day'].map(f => (
                      <li key={f} className="flex items-center gap-3 text-[#c4c5d9]"><span className="material-symbols-outlined text-[#bbc3ff] text-xl">check_circle</span>{f}</li>
                    ))}
                  </ul>
                </div>
                <Link href="/auth/signup" className="w-full py-4 rounded-xl border border-white/10 bg-white/5 font-bold hover:bg-white/10 transition-colors text-center block">Start Free</Link>
              </div>
              <div className="relative overflow-hidden p-10 rounded-3xl flex flex-col justify-between" style={{ background: 'rgba(16,19,26,0.6)', backdropFilter: 'blur(24px)', border: '2px solid #3c59fd', boxShadow: '0 0 50px rgba(60,89,253,0.15)' }}>
                <div className="absolute top-0 right-0 bg-[#3c59fd] text-white px-4 py-1 text-xs font-bold uppercase tracking-widest rounded-bl-xl">Best Value</div>
                <div>
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#bbc3ff]">Pro Career Suite</span>
                  <div className="mt-4 mb-8"><span className="text-5xl font-bold">$29</span><span className="text-[#c4c5d9]">/month</span></div>
                  <ul className="space-y-4 mb-10">
                    {['Unlimited AI Resumes & Covers','Full Mock Interview Access','Predictive Salary Analytics','Priority AI Resume Scanning','Advanced Networking Tools','Resume A/B Testing'].map(f => (
                      <li key={f} className="flex items-center gap-3"><span className="material-symbols-outlined text-[#00daf3] text-xl">check_circle</span>{f}</li>
                    ))}
                  </ul>
                </div>
                <button disabled className="w-full py-4 rounded-xl bg-[#3c59fd] text-white font-bold opacity-60 cursor-not-allowed">Coming Soon</button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 px-6 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[{q:'How accurate is the ATS scoring?',a:'Our algorithms reflect the current logic used by Workday, Greenhouse, Lever, and iCIMS — scoring each separately.'},{q:'Is my data secure?',a:'Enterprise-grade encryption. Your data is yours alone — we never sell to third parties.'},{q:'Can I cancel anytime?',a:'Yes. Cancel or pause your Pro subscription with a single click from settings.'},{q:'What job sources do you use?',a:'We aggregate from LinkedIn, Indeed, Glassdoor, and 16,000+ ATS platforms via TheirStack.'},{q:'How does voice mock interview work?',a:'AI asks questions based on your target JD. You answer via mic. Each answer is scored with filler word detection and coaching tips.'},{q:'Is there a free plan?',a:'Yes. Free includes 5 AI calls, 10 searches, and 3 mock interviews per day.'}].map((f,i) => (
              <div key={i} className="group glass-panel p-6 rounded-2xl hover:bg-white/[0.06] transition-colors cursor-pointer">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold">{f.q}</h4>
                  <span className="material-symbols-outlined text-[#8e90a2]">expand_more</span>
                </div>
                <p className="mt-4 text-[#c4c5d9] text-sm hidden group-hover:block leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #3c59fd, #5203d5)' }}>
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-7xl font-extrabold tracking-tighter text-white">Ready to outpace the market?</h2>
              <p className="text-white/80 text-xl max-w-2xl mx-auto font-medium">Join 50,000+ professionals who secured their dream roles with JobSeeker Pro.</p>
              <Link href="/auth/signup" className="inline-block bg-white text-[#3c59fd] px-12 py-5 rounded-2xl font-bold text-xl hover:scale-105 transition-transform">Join JobSeeker Pro</Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-white/5" style={{ background: 'var(--surface-container-lowest)' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-12 border-b border-white/5 pb-16">
          <div className="col-span-2">
            <span className="text-2xl font-bold text-[#bbc3ff] tracking-tighter block mb-6">JobSeeker Pro</span>
            <p className="text-[#c4c5d9] max-w-xs mb-8">The AI career suite for the modern professional. Accelerate your career with precision.</p>
          </div>
          {[{t:'Platform',l:['Resume Builder','Mock Interviews','ATS Scan','Career Tracker']},{t:'Company',l:['About Us','Blog','Careers']},{t:'Legal',l:['Privacy Policy','Terms of Service','Cookie Policy']}].map(c => (
            <div key={c.t}>
              <h5 className="font-bold mb-6 text-xs uppercase tracking-widest">{c.t}</h5>
              <ul className="space-y-4 text-[#c4c5d9] text-sm">{c.l.map(l => <li key={l}><a href="#" className="hover:text-[#bbc3ff] transition-colors">{l}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[#c4c5d9] text-xs">
          <p>© 2026 JobSeeker Pro. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00daf3]" />System Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
