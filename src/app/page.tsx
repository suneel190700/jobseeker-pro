import Link from 'next/link';
import { ArrowRight, BarChart3, Search, ShieldCheck, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] px-6 py-16 text-[#1E293B]">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 flex items-center justify-between rounded-[28px] border border-slate-200 bg-white px-6 py-4 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.18)]">
          <div>
            <p className="serif-display text-[24px] font-semibold tracking-tight">JobSeeker Dashboard &amp; Portfolio</p>
            <p className="mt-1 text-sm text-slate-500">Quiet luxury for technical storytelling</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn-gray btn-sm">Log in</Link>
            <Link href="/auth/signup" className="btn-filled btn-sm">Get started</Link>
          </div>
        </header>

        <section className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="page-eyebrow">Premium executive dashboard</p>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.04] tracking-[-0.04em] text-[#1E293B] md:text-6xl">
              Manage your job search like a modern SaaS product.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Track applications, optimize your resume, and discover better opportunities in one clean workspace with clearer hierarchy, stronger readability, and profile-driven data.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/dashboard" className="btn-filled">
                Open dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="btn-gray">
                Preview interface
              </Link>
            </div>
          </div>

          <div className="soft-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Live Preview</p>
                <p className="mt-1 text-[15px] text-slate-600">A cleaner, more readable dashboard foundation</p>
              </div>
              <Sparkles className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <div className="grid gap-4 rounded-[24px] bg-slate-50 p-4 sm:grid-cols-2">
              <div className="rounded-[20px] border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Search className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-500">Search jobs...</span>
                </div>
                <div className="h-24 rounded-[16px] bg-slate-100" />
              </div>
              <div className="rounded-[20px] border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[var(--accent)]" />
                  <span className="text-sm text-slate-500">Profile strength</span>
                </div>
                <div className="h-24 rounded-[16px] bg-[linear-gradient(180deg,#e8f5ef_0%,#f7fbf9_100%)]" />
              </div>
              <div className="rounded-[20px] border border-slate-200 bg-white p-5 sm:col-span-2">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
                  <span className="text-sm text-slate-500">Application pipeline</span>
                </div>
                <div className="space-y-3">
                  <div className="tracker-bar"><div className="tracker-fill" style={{ width: '62%' }} /></div>
                  <div className="tracker-bar"><div className="tracker-fill" style={{ width: '38%' }} /></div>
                  <div className="tracker-bar"><div className="tracker-fill" style={{ width: '22%' }} /></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
