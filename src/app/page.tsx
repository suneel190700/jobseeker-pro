import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight text-brand-700">
          JobSeeker Pro
        </span>
        <div className="flex gap-3">
          <Link
            href="/auth/login"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Land your next role,{' '}
            <span className="text-brand-600">faster.</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            AI-powered resume optimization, smart job matching, and a pipeline
            tracker that keeps you organized from application to offer.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition"
            >
              Start for Free
            </Link>
            <Link
              href="#features"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              See how it works →
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div
          id="features"
          className="mx-auto mt-24 grid max-w-5xl gap-8 px-4 sm:grid-cols-3"
        >
          {[
            {
              title: 'Resume Optimizer',
              desc: 'Get an ATS score, keyword gap analysis, and AI rewrite suggestions tailored to each job.',
              icon: '📄',
            },
            {
              title: 'Smart Job Match',
              desc: 'Search thousands of US jobs and see AI-ranked match scores based on your resume.',
              icon: '🎯',
            },
            {
              title: 'Application Tracker',
              desc: 'Kanban board to manage your pipeline from saved → applied → interview → offer.',
              icon: '📊',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-slate-200 p-6 text-left hover:shadow-md transition"
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} JobSeeker Pro. Built for US job seekers.
      </footer>
    </div>
  );
}
