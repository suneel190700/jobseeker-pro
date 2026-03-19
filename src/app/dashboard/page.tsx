import { FileText, Send, MessageSquare, Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const stats = [
  { label: 'Total Applications', value: '0', icon: Send, color: 'text-blue-600 bg-blue-50', href: '/tracker' },
  { label: 'Interviews', value: '0', icon: MessageSquare, color: 'text-purple-600 bg-purple-50', href: '/tracker' },
  { label: 'Offers', value: '0', icon: Trophy, color: 'text-green-600 bg-green-50', href: '/tracker' },
  { label: 'Avg ATS Score', value: '—', icon: FileText, color: 'text-amber-600 bg-amber-50', href: '/resume-optimizer' },
];

const quickActions = [
  { href: '/resume-optimizer', label: 'Upload & Optimize Resume', desc: 'Get AI-powered ATS scoring', icon: FileText, color: 'text-brand-600' },
  { href: '/jobs', label: 'Search Jobs', desc: 'Find matching opportunities', icon: Send, color: 'text-brand-600' },
  { href: '/tracker', label: 'Track Applications', desc: 'Manage your pipeline', icon: MessageSquare, color: 'text-brand-600' },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Your job search at a glance.</p>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition">
            <div className="flex items-center gap-3">
              <div className={['rounded-lg p-2', s.color].join(' ')}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions + Getting Started */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
          <div className="mt-4 space-y-3">
            {quickActions.map((a) => (
              <Link key={a.href} href={a.href} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50 transition group">
                <div className="flex items-center gap-3">
                  <a.icon className={['h-5 w-5', a.color].join(' ')} />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{a.label}</p>
                    <p className="text-xs text-slate-400">{a.desc}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition" />
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Getting Started</h2>
          <div className="mt-4 space-y-4">
            {[
              { step: '1', label: 'Upload your resume', desc: 'PDF or DOCX format', done: false },
              { step: '2', label: 'Analyze against a job description', desc: 'Get your ATS score', done: false },
              { step: '3', label: 'Search for matching jobs', desc: 'Across the US', done: false },
              { step: '4', label: 'Track your applications', desc: 'From saved to offer', done: false },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
                  {item.step}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
