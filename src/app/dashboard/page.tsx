import { FileText, Search, ArrowRight, User, FileSignature, Linkedin, Sparkles, MessageCircle, History, Kanban } from 'lucide-react';
import Link from 'next/link';
const a = [
  { href: '/profile', label: 'Profile', desc: 'Details & resume', icon: User, color: 'text-indigo-400' },
  { href: '/jobs', label: 'Job Search', desc: 'Find & score jobs', icon: Search, color: 'text-blue-400' },
  { href: '/resume-optimizer', label: 'Optimizer', desc: 'ATS audit + AI rewrite', icon: Sparkles, color: 'text-violet-400' },
  { href: '/resume-versions', label: 'Versions', desc: 'Saved resumes', icon: History, color: 'text-zinc-400' },
  { href: '/cover-letter', label: 'Cover Letter', desc: 'AI-generated', icon: FileSignature, color: 'text-emerald-400' },
  { href: '/interview-prep', label: 'Interview Prep', desc: 'Questions & STAR', icon: MessageCircle, color: 'text-cyan-400' },
  { href: '/linkedin', label: 'LinkedIn', desc: 'Profile optimizer', icon: Linkedin, color: 'text-blue-400' },
  { href: '/tracker', label: 'Tracker', desc: 'Application pipeline', icon: Kanban, color: 'text-amber-400' },
];
export default function DashboardPage() {
  return (<div>
    <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
    <p className="mt-1 text-sm text-zinc-500">Your job search command center.</p>
    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {a.map(x => (
        <Link key={x.href} href={x.href} className="group rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-zinc-800/80 p-2 group-hover:bg-zinc-800 transition"><x.icon className={['h-4 w-4', x.color].join(' ')} /></div>
            <div><p className="text-sm font-medium text-zinc-200">{x.label}</p><p className="text-xs text-zinc-600">{x.desc}</p></div>
          </div>
        </Link>
      ))}
    </div>
  </div>);
}
