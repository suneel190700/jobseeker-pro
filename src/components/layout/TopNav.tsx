'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  ChevronRight,
  FileSignature,
  FolderOpen,
  Kanban,
  LayoutDashboard,
  Linkedin,
  LogOut,
  Menu,
  MessageSquare,
  Mic,
  Search,
  Settings,
  Sparkles,
  User,
  Users,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useMemo, useState } from 'react';

const primaryItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Executive view' },
  { href: '/jobs', label: 'Jobs', icon: Search, desc: 'Research roles' },
  { href: '/resume-optimizer', label: 'Resume AI', icon: Sparkles, desc: 'Polish fit' },
  { href: '/cover-letter', label: 'Cover Letter', icon: FileSignature, desc: 'Tailor faster' },
  { href: '/mock-interview', label: 'Mock Interview', icon: Mic, desc: 'Practice live' },
  { href: '/tracker', label: 'Tracker', icon: Kanban, desc: 'Manage pipeline' },
];

const secondaryItems = [
  { href: '/interview-prep', label: 'Interview Prep', icon: MessageSquare },
  { href: '/linkedin', label: 'LinkedIn', icon: Linkedin },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/networking', label: 'Networking', icon: Users },
  { href: '/resume-versions', label: 'Resume Versions', icon: FolderOpen },
  { href: '/profile', label: 'Profile', icon: User },
];

const titleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/jobs': 'Jobs',
  '/resume-optimizer': 'Resume AI',
  '/cover-letter': 'Cover Letter',
  '/mock-interview': 'Mock Interview',
  '/tracker': 'Tracker',
  '/interview-prep': 'Interview Prep',
  '/linkedin': 'LinkedIn Optimizer',
  '/analytics': 'Analytics',
  '/networking': 'Networking',
  '/resume-versions': 'Resume Versions',
  '/profile': 'Profile',
};

function SidebarContent({ path, name, onNavigate, onLogout }: { path: string; name: string; onNavigate?: () => void; onLogout: () => void }) {
  const isActive = (href: string) => path === href || (href !== '/dashboard' && path.startsWith(href));

  return (
    <>
      <div className="mb-6 rounded-[28px] border border-[rgba(23,20,17,0.1)] bg-[rgba(255,252,247,0.86)] p-4 shadow-[0_22px_50px_-42px_rgba(23,20,17,0.24)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1f4fcc_0%,#3a73eb_100%)] text-white shadow-[0_18px_34px_-24px_rgba(41,88,214,0.55)]">
            <Sparkles className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">JobSeeker Pro</p>
            <p className="text-xs text-[var(--text-secondary)]">Editorial workspace</p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--text-tertiary)]">Workspace</p>
        {primaryItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={[
                'group flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all duration-200',
                active
                  ? 'border-[rgba(41,88,214,0.16)] bg-[rgba(41,88,214,0.08)] shadow-[0_16px_30px_-26px_rgba(41,88,214,0.22)]'
                  : 'border-transparent bg-transparent hover:border-[rgba(23,20,17,0.08)] hover:bg-[rgba(255,255,255,0.45)]',
              ].join(' ')}
            >
              <div className={[
                'flex h-10 w-10 items-center justify-center rounded-xl border transition-colors',
                active
                  ? 'border-[rgba(41,88,214,0.14)] bg-white text-[var(--accent)]'
                  : 'border-[rgba(23,20,17,0.08)] bg-white/70 text-[var(--text-secondary)]',
              ].join(' ')}>
                <item.icon className="h-[18px] w-[18px]" strokeWidth={2.1} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={active ? 'text-sm font-semibold text-[var(--text-primary)]' : 'text-sm font-medium text-[var(--text-primary)]'}>{item.label}</p>
                <p className="truncate text-[12px] text-[var(--text-tertiary)]">{item.desc}</p>
              </div>
              <ChevronRight className={active ? 'h-4 w-4 text-[var(--accent)]' : 'h-4 w-4 text-[var(--text-tertiary)]'} />
            </Link>
          );
        })}
      </div>

      <div className="mt-6 space-y-1.5">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--text-tertiary)]">Modules</p>
        {secondaryItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={[
                'group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200',
                active ? 'bg-white/70 text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-white/45 hover:text-[var(--text-primary)]',
              ].join(' ')}
            >
              <item.icon className="h-4 w-4" strokeWidth={2} />
              <span className="text-[13px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto pt-6">
        <div className="rounded-[26px] border border-[rgba(23,20,17,0.08)] bg-[rgba(255,252,247,0.82)] p-4 shadow-[0_22px_40px_-36px_rgba(23,20,17,0.22)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(41,88,214,0.12)] text-[13px] font-bold text-[var(--accent)]">
              {name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{name || 'Your workspace'}</p>
              <p className="truncate text-xs text-[var(--text-secondary)]">Unique visual system</p>
            </div>
            <Link href="/profile" onClick={onNavigate} className="rounded-xl border border-[rgba(23,20,17,0.08)] bg-white/70 p-2 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
              <Settings className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 rounded-2xl border border-[rgba(23,20,17,0.06)] bg-[#f9f6f0] p-3">
            <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
              <span>Design direction</span>
              <span>New</span>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">Warm editorial layout, calmer palette, stronger typography, and zero dark-glass SaaS cloning.</p>
          </div>
          <button type="button" onClick={onLogout} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(23,20,17,0.08)] bg-white/80 px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:bg-white">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}

export default function TopNav() {
  const path = usePathname();
  const router = useRouter();
  const [name, setName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setName(data?.user?.user_metadata?.full_name || data?.user?.email?.split('@')[0] || ''));
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [path]);

  const currentTitle = useMemo(() => {
    const exact = Object.entries(titleMap).find(([href]) => path === href || (href !== '/dashboard' && path.startsWith(href)));
    return exact?.[1] || 'JobSeeker Pro';
  }, [path]);

  const logout = async () => {
    await createClient().auth.signOut();
    router.push('/');
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[292px] border-r border-[rgba(23,20,17,0.08)] bg-[rgba(245,240,232,0.84)] px-5 py-5 backdrop-blur-xl xl:flex xl:flex-col">
        <SidebarContent path={path} name={name} onLogout={logout} />
      </aside>

      <header className="sticky top-0 z-30 border-b border-[rgba(23,20,17,0.08)] bg-[rgba(247,243,236,0.78)] backdrop-blur-xl xl:ml-[292px]">
        <div className="flex min-h-[76px] items-center justify-between px-4 sm:px-6 xl:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setSidebarOpen(true)} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(23,20,17,0.08)] bg-white/80 text-[var(--text-primary)] xl:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--text-tertiary)]">Premium workspace</p>
              <h1 className="truncate text-[22px] font-semibold tracking-tight text-[var(--text-primary)]">{currentTitle}</h1>
            </div>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-2xl border border-[rgba(23,20,17,0.08)] bg-white/70 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-tertiary)]">Theme</p>
              <p className="text-sm text-[var(--text-secondary)]">Editorial calm</p>
            </div>
            <Link href="/jobs" className="btn-filled btn-sm !min-h-0 px-4 py-3">Search jobs</Link>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button type="button" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-y-0 left-0 flex w-[92vw] max-w-[320px] flex-col border-r border-[rgba(23,20,17,0.08)] bg-[rgba(247,243,236,0.96)] px-5 py-5 backdrop-blur-xl">
            <div className="mb-3 flex justify-end">
              <button type="button" onClick={() => setSidebarOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(23,20,17,0.08)] bg-white/80 text-[var(--text-primary)]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarContent path={path} name={name} onNavigate={() => setSidebarOpen(false)} onLogout={logout} />
          </div>
        </div>
      )}
    </>
  );
}
