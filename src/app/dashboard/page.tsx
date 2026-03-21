import { FileText, Search, ArrowRight, User, FileSignature, Linkedin, Zap, MessageSquare, History, Kanban } from 'lucide-react';
import Link from 'next/link';
const a = [
  { href: '/profile', label: 'Set Up Profile', desc: 'Details, resume, target roles', icon: User, color: 'text-brand-600' },
  { href: '/jobs', label: 'Search Jobs', desc: 'Find and score opportunities', icon: Search, color: 'text-brand-600' },
  { href: '/resume-optimizer', label: 'Optimize Resume', desc: 'Deep ATS audit + AI rewrite', icon: Zap, color: 'text-purple-600' },
  { href: '/resume-versions', label: 'Resume Versions', desc: 'All tailored resumes', icon: History, color: 'text-slate-600' },
  { href: '/cover-letter', label: 'Cover Letter', desc: 'Tailored per job', icon: FileSignature, color: 'text-green-600' },
  { href: '/interview-prep', label: 'Interview Prep', desc: 'Questions + STAR stories', icon: MessageSquare, color: 'text-blue-600' },
  { href: '/linkedin', label: 'LinkedIn', desc: 'Optimize your profile', icon: Linkedin, color: 'text-blue-600' },
  { href: '/tracker', label: 'Track Applications', desc: 'Kanban pipeline', icon: Kanban, color: 'text-amber-600' },
];
export default function DashboardPage() {
  return (<div><h1 className="text-2xl font-bold text-slate-900">Dashboard</h1><p className="mt-1 text-sm text-slate-500">Your job search command center.</p>
    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{a.map((x) => (<Link key={x.href} href={x.href} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50 transition group"><div className="flex items-center gap-3"><x.icon className={['h-5 w-5', x.color].join(' ')} /><div><p className="text-sm font-medium text-slate-700">{x.label}</p><p className="text-xs text-slate-400">{x.desc}</p></div></div><ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500" /></Link>))}</div>
  </div>);
}
