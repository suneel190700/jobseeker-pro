import { FileText, Send, MessageSquare, ArrowRight, User, FileSignature, Linkedin, Zap, Search } from 'lucide-react';
import Link from 'next/link';

const actions = [
  { href: '/profile', label: 'Set Up Profile', desc: 'Personal details, resume, target roles', icon: User, color: 'text-brand-600' },
  { href: '/jobs', label: 'Search Jobs', desc: 'Find and score opportunities', icon: Search, color: 'text-brand-600' },
  { href: '/resume-optimizer', label: 'Optimize Resume', desc: 'ATS audit + AI rewrite', icon: Zap, color: 'text-purple-600' },
  { href: '/cover-letter', label: 'Cover Letter', desc: 'Tailored cover letters', icon: FileSignature, color: 'text-green-600' },
  { href: '/linkedin', label: 'LinkedIn', desc: 'Optimize your profile', icon: Linkedin, color: 'text-blue-600' },
  { href: '/tracker', label: 'Track Applications', desc: 'Kanban pipeline', icon: MessageSquare, color: 'text-amber-600' },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Your job search command center.</p>
      <div className="mt-8 rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Get Started</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {['1. Upload resume → Profile', '2. Add target titles → Profile', '3. Search & score jobs', '4. Optimize resume for JD', '5. Generate cover letter', '6. Track applications'].map((s, i) => (
            <Link key={i} href={actions[i]?.href || '/profile'} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 hover:shadow-sm transition">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">{i + 1}</div>
              <p className="text-sm text-slate-700">{s.split('. ')[1]}</p>
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-6"><h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((a) => (<Link key={a.href} href={a.href} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50 transition group"><div className="flex items-center gap-3"><a.icon className={['h-5 w-5', a.color].join(' ')} /><div><p className="text-sm font-medium text-slate-700">{a.label}</p><p className="text-xs text-slate-400">{a.desc}</p></div></div><ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500" /></Link>))}
        </div>
      </div>
    </div>
  );
}
