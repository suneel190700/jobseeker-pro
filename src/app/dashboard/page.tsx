import { FileText, Send, MessageSquare, Trophy, ArrowRight, User, FileSignature, Linkedin, Zap } from 'lucide-react';
import Link from 'next/link';

const quickActions = [
  { href: '/profile', label: 'Upload Base Resume', desc: 'Set up your profile and target roles', icon: User, color: 'text-brand-600' },
  { href: '/jobs', label: 'Search Jobs', desc: 'Find and score matching opportunities', icon: Send, color: 'text-brand-600' },
  { href: '/resume-optimizer', label: 'Optimize Resume', desc: 'ATS audit + AI rewrite for any JD', icon: Zap, color: 'text-purple-600' },
  { href: '/cover-letter', label: 'Cover Letter', desc: 'Generate tailored cover letters', icon: FileSignature, color: 'text-green-600' },
  { href: '/linkedin', label: 'LinkedIn Optimizer', desc: 'Headline, about, and skills', icon: Linkedin, color: 'text-blue-600' },
  { href: '/tracker', label: 'Application Tracker', desc: 'Manage your pipeline', icon: MessageSquare, color: 'text-amber-600' },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Your job search command center.</p>

      {/* Getting Started */}
      <div className="mt-8 rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Getting Started</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { step: '1', label: 'Upload base resume', desc: 'Profile → Upload PDF/DOCX', href: '/profile' },
            { step: '2', label: 'Add target job titles', desc: 'Profile → Add roles you want', href: '/profile' },
            { step: '3', label: 'Search & score jobs', desc: 'Find jobs, get ATS scores', href: '/jobs' },
            { step: '4', label: 'Optimize your resume', desc: 'AI rewrite for specific JDs', href: '/resume-optimizer' },
            { step: '5', label: 'Generate cover letter', desc: 'Tailored to each application', href: '/cover-letter' },
            { step: '6', label: 'Track applications', desc: 'Kanban board: saved to offer', href: '/tracker' },
          ].map((item) => (
            <Link key={item.step} href={item.href} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 hover:border-slate-300 hover:shadow-sm transition">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">{item.step}</div>
              <div><p className="text-sm font-medium text-slate-700">{item.label}</p><p className="text-xs text-slate-400">{item.desc}</p></div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((a) => (
            <Link key={a.href} href={a.href} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50 transition group">
              <div className="flex items-center gap-3">
                <a.icon className={['h-5 w-5', a.color].join(' ')} />
                <div><p className="text-sm font-medium text-slate-700">{a.label}</p><p className="text-xs text-slate-400">{a.desc}</p></div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
