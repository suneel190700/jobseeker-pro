'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, Search, Kanban, Settings, LogOut, User, FileSignature, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/profile', label: 'My Profile', icon: User },
  { href: '/resume-optimizer', label: 'Resume Optimizer', icon: FileText },
  { href: '/jobs', label: 'Job Search', icon: Search },
  { href: '/tracker', label: 'Application Tracker', icon: Kanban },
  { href: '/cover-letter', label: 'Cover Letter', icon: FileSignature },
  { href: '/linkedin', label: 'LinkedIn Optimizer', icon: Linkedin },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const handleLogout = async () => { const s = createClient(); await s.auth.signOut(); router.push('/'); };

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-slate-50">
      <div className="flex h-16 items-center px-6 border-b"><span className="text-lg font-bold tracking-tight text-brand-700">JobSeeker Pro</span></div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map(({ href, label, icon: Icon }) => (<Link key={href} href={href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition', pathname.startsWith(href) ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100')}><Icon className="h-4 w-4" />{label}</Link>))}
      </nav>
      <div className="border-t px-3 py-4 space-y-1">
        <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100"><Settings className="h-4 w-4" />Settings</Link>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100"><LogOut className="h-4 w-4" />Log out</button>
      </div>
    </aside>
  );
}
