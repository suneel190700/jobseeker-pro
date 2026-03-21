import Link from 'next/link';
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white sticky top-0 z-50"><div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3"><span className="text-xl font-bold text-brand-600">JobSeeker Pro</span><div className="flex gap-3"><Link href="/auth/login" className="px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 rounded-full transition">Sign in</Link><Link href="/auth/signup" className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-full transition">Join now</Link></div></div></header>
      <main className="max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight">Land your dream job<br/><span className="text-brand-600">with AI precision</span></h1>
        <p className="mt-5 text-xl text-gray-500 max-w-2xl mx-auto">ATS-optimized resumes, AI cover letters, interview prep, and smart job matching — everything you need in one platform.</p>
        <div className="mt-8 flex justify-center gap-4"><Link href="/auth/signup" className="px-8 py-3.5 text-base font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-full transition shadow-lg shadow-brand-600/25">Get started — it's free</Link></div>
        <div className="mt-20 grid grid-cols-3 gap-6 text-left">
          {[{t:'Resume AI',d:'ATS audit scoring + AI rewrite targeting 95+ on Workday, Greenhouse, Lever'},{t:'Smart Job Search',d:'Search across multiple job boards, score matches, and track applications'},{t:'Interview Prep',d:'AI-generated questions, STAR stories, and company research briefs'}].map(f=>(<div key={f.t} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"><h3 className="text-base font-bold text-gray-900">{f.t}</h3><p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.d}</p></div>))}
        </div>
      </main>
    </div>
  );
}
