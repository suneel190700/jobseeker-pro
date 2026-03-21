'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, Search, Kanban, LogOut, User, FileSignature, Linkedin, MessageCircle, FolderOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/jobs', label: 'Jobs', icon: Search },
  { href: '/resume-optimizer', label: 'Optimizer', icon: Sparkles },
  { href: '/resume-versions', label: 'Versions', icon: FolderOpen },
  { href: '/cover-letter', label: 'Cover Letter', icon: FileSignature },
  { href: '/interview-prep', label: 'Interview', icon: MessageCircle },
  { href: '/linkedin', label: 'LinkedIn', icon: Linkedin },
  { href: '/tracker', label: 'Tracker', icon: Kanban },
];

export default function Sidebar() {
  const p = usePathname(); const r = useRouter();
  const logout = async () => { await createClient().auth.signOut(); r.push('/'); };
  return (
    <aside className="flex h-screen w-56 flex-col border-r border-zinc-800/80 bg-zinc-950">
      <div className="flex h-14 items-center px-5 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-indigo-600 flex items-center justify-center"><Sparkles className="h-3.5 w-3.5 text-white" /></div>
          <span className="text-sm font-bold text-zinc-100 tracking-tight">JobSeeker Pro</span>
        </div>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: I }) => {
          const active = p.startsWith(href);
          return (
            <Link key={href} href={href} className={cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all',
              active ? 'bg-indigo-600/10 text-indigo-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
            )}>
              <I className={cn('h-4 w-4', active ? 'text-indigo-400' : 'text-zinc-600')} />{label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-800/80 px-2 py-3">
        <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/50 transition">
          <LogOut className="h-4 w-4" />Sign out
        </button>
      </div>
    </aside>
  );
}
