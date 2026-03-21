'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, Search, Kanban, Settings, LogOut, User, FileSignature, Linkedin, MessageCircle, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/profile', label: 'My Profile', icon: User },
  { href: '/jobs', label: 'Job Search', icon: Search },
  { href: '/resume-optimizer', label: 'Resume Optimizer', icon: FileText },
  { href: '/resume-versions', label: 'Saved Resumes', icon: FolderOpen },
  { href: '/cover-letter', label: 'Cover Letter', icon: FileSignature },
  { href: '/interview-prep', label: 'Interview Prep', icon: MessageCircle },
  { href: '/linkedin', label: 'LinkedIn Optimizer', icon: Linkedin },
  { href: '/tracker', label: 'Tracker', icon: Kanban },
];

export default function Sidebar() {
  const pathname = usePathname(); const router = useRouter();
  const logout = async () => { await createClient().auth.signOut(); router.push('/'); };
  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-slate-50">
      <div className="flex h-16 items-center px-6 border-b"><span className="text-lg font-bold tracking-tight text-brand-700">JobSeeker Pro</span></div>
      <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
        {nav.map(({ href, label, icon: I }) => (<Link key={href} href={href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition', pathname.startsWith(href) ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100')}><I className="h-4 w-4" />{label}</Link>))}
      </nav>
      <div className="border-t px-3 py-3">
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"><LogOut className="h-4 w-4" />Log out</button>
      </div>
    </aside>
  );
}
