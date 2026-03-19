import { FileText, Send, MessageSquare, Trophy } from 'lucide-react';

const stats = [
  { label: 'Total Applications', value: '—', icon: Send, color: 'text-blue-600 bg-blue-50' },
  { label: 'Interviews', value: '—', icon: MessageSquare, color: 'text-purple-600 bg-purple-50' },
  { label: 'Offers', value: '—', icon: Trophy, color: 'text-green-600 bg-green-50' },
  { label: 'Avg ATS Score', value: '—', icon: FileText, color: 'text-amber-600 bg-amber-50' },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Your job search at a glance.
      </p>

      {/* Stats Grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 p-5"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Activity
          </h2>
          <div className="mt-4 flex items-center justify-center py-12 text-sm text-slate-400">
            No activity yet. Start by uploading your resume!
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Quick Actions
          </h2>
          <div className="mt-4 space-y-3">
            <a
              href="/resume-optimizer"
              className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <FileText className="h-4 w-4 text-brand-600" />
              Upload & Optimize Resume
            </a>
            <a
              href="/jobs"
              className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <Send className="h-4 w-4 text-brand-600" />
              Search Jobs
            </a>
            <a
              href="/tracker"
              className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <MessageSquare className="h-4 w-4 text-brand-600" />
              Track Applications
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
