import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-zinc-800/50">
        <span className="text-sm font-bold text-zinc-100 tracking-tight">JobSeeker Pro</span>
        <div className="flex gap-3">
          <Link href="/auth/login" className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition">Log in</Link>
          <Link href="/auth/signup" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition">Sign up free</Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-1.5 text-xs font-medium text-indigo-400 mb-6">
            AI-Powered Resume Optimization
          </div>
          <h1 className="text-5xl font-bold text-zinc-100 tracking-tight leading-[1.1]">
            Land your next role<br /><span className="text-indigo-400">with confidence.</span>
          </h1>
          <p className="mt-5 text-lg text-zinc-500 leading-relaxed max-w-xl mx-auto">
            ATS-optimized resumes, AI-generated cover letters, interview prep, and job matching — all in one platform.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/auth/signup" className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20">Get started free</Link>
            <Link href="/auth/login" className="rounded-lg border border-zinc-800 px-6 py-3 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition">Log in</Link>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-6">
            {[
              { n: 'Resume AI', d: 'ATS audit + AI rewrite targeting 95+ scores' },
              { n: 'Job Matching', d: 'Search, score, and track opportunities' },
              { n: 'Interview Prep', d: 'AI questions, STAR stories, company briefs' },
            ].map(f => (
              <div key={f.n} className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 text-left">
                <p className="text-sm font-semibold text-zinc-200">{f.n}</p>
                <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
