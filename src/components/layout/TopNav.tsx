'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Briefcase,
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
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Overview' },
  { href: '/jobs', label: 'Jobs', icon: Search, desc: 'Search roles' },
  { href: '/resume-optimizer', label: 'Resume AI', icon: Sparkles, desc: 'ATS optimization' },
  { href: '/cover-letter', label: 'Cover Letter', icon: FileSignature, desc: 'Tailored drafts' },
  { href: '/mock-interview', label: 'Mock Interview', icon: Mic, desc: 'Voice practice' },
  { href: '/tracker', label: 'Tracker', icon: Kanban, desc: 'Application pipeline' },
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

function SidebarContent({
  path,
  name,
  onNavigate,
  onLogout,
}: {
  path: string;
  name: string;
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  const isActive = (href: string) => path === href || (href !== '/dashboard' && path.startsWith(href));

  return (
    <>
      <div className="mb-6 flex items-center gap-3 rounded-[28px] border border-white/10 bg-white/[0.03] px-4 py-4 shadow-[0_18px_50px_-28px_rgba(99,102,241,0.45)]">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#8b5cf6_0%,#6366f1_45%,#22d3ee_100%)] text-[#050816] shadow-[0_10px_30px_-14px_rgba(99,102,241,0.8)]">
          <Sparkles className="h-5 w-5" strokeWidth={2.3} />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold tracking-tight text-white">JobSeeker Pro</p>
          <p className="text-xs text-white/45">Premium career workspace</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-white/35">Workspace</p>
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
                  ? 'border-white/14 bg-white/[0.08] shadow-[0_16px_40px_-24px_rgba(99,102,241,0.75)]'
                  : 'border-transparent bg-transparent hover:border-white/10 hover:bg-white/[0.04]',
              ].join(' ')}
            >
              <div
                className={[
                  'flex h-10 w-10 items-center justify-center rounded-xl border transition-colors',
                  active
                    ? 'border-indigo-400/30 bg-[linear-gradient(135deg,rgba(99,102,241,.25),rgba(34,211,238,.18))] text-white'
                    : 'border-white/8 bg-white/[0.03] text-white/60 group-hover:text-white/90',
                ].join(' ')}
              >
                <item.icon className="h-[18px] w-[18px]" strokeWidth={2.1} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={active ? 'text-sm font-semibold text-white' : 'text-sm font-medium text-white/78'}>{item.label}</p>
                <p className="truncate text-[12px] text-white/38">{item.desc}</p>
              </div>
              <ChevronRight className={active ? 'h-4 w-4 text-white/70' : 'h-4 w-4 text-white/20 transition group-hover:text-white/50'} />
            </Link>
          );
        })}
      </div>

      <div className="mt-6 space-y-1.5">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-white/35">Tools</p>
        {secondaryItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={[
                'group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200',
                active ? 'bg-white/[0.06] text-white' : 'text-white/60 hover:bg-white/[0.04] hover:text-white',
              ].join(' ')}
            >
              <item.icon className="h-4 w-4" strokeWidth={2} />
              <span className="text-[13px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto pt-6">
        <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.03))] p-4 shadow-[0_20px_50px_-34px_rgba(34,211,238,0.7)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(99,102,241,.9),rgba(34,211,238,.95))] text-[13px] font-bold text-[#06101f]">
              {name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{name || 'Your workspace'}</p>
              <p className="truncate text-xs text-white/45">Premium plan visuals</p>
            </div>
            <Link href="/profile" onClick={onNavigate} className="rounded-xl border border-white/10 p-2 text-white/55 transition hover:border-white/20 hover:text-white">
              <Settings className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-3">
            <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/35">
              <span>Daily momentum</span>
              <span>78%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/8">
              <div className="h-full w-[78%] rounded-full bg-[linear-gradient(90deg,#818cf8,#22d3ee)]" />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-white/48">Clean shell, stronger hierarchy, and a more premium product feel across every core workflow.</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white/72 transition hover:bg-white/[0.07] hover:text-white"
          >
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
    createClient()
      .auth.getUser()
      .then(({ data }) => setName(data?.user?.user_metadata?.full_name || data?.user?.email?.split('@')[0] || ''));
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [path]);

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
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[292px] border-r border-white/8 bg-[rgba(7,9,15,0.92)] px-5 py-5 backdrop-blur-2xl xl:flex xl:flex-col">
        <SidebarContent path={path} name={name} onLogout={logout} />
      </aside>

      <header className="sticky top-0 z-30 border-b border-white/8 bg-[rgba(7,9,15,0.78)] backdrop-blur-2xl xl:ml-[292px]">
        <div className="flex min-h-[76px] items-center justify-between px-4 sm:px-6 xl:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/75 xl:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/35">Premium workspace</p>
              <h1 className="truncate text-[22px] font-semibold tracking-tight text-white">{currentTitle}</h1>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/35">Focus</p>
              <p className="text-sm text-white/80">Design-first premium rebuild</p>
            </div>
            <Link href="/jobs" className="inline-flex items-center gap-2 rounded-2xl border border-indigo-400/25 bg-[linear-gradient(135deg,rgba(99,102,241,.25),rgba(34,211,238,.16))] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_-22px_rgba(99,102,241,0.85)] transition hover:scale-[1.01]">
              <Briefcase className="h-4 w-4" />
              Search jobs
            </Link>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button type="button" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} className="absolute inset-0 bg-black/65" />
          <div className="absolute inset-y-0 left-0 flex w-[92vw] max-w-[320px] flex-col border-r border-white/10 bg-[rgba(7,9,15,0.97)] px-5 py-5 backdrop-blur-2xl">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/70"
              >
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
