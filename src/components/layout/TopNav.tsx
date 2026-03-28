'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BriefcaseBusiness, FolderKanban, LayoutDashboard, LogOut, Menu, Search, Sparkles, User, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useMemo, useState } from 'react';
import { APP_CONTENT_MAX } from './constants';

const tabs = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs', label: 'Jobs', icon: Search },
  { href: '/resume-optimizer', label: 'Resume AI', icon: Sparkles },
  { href: '/tracker', label: 'Tracker', icon: FolderKanban },
];

export default function TopNav() {
  const path = usePathname();
  const router = useRouter();
  const [name, setName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setName(data?.user?.user_metadata?.full_name || data?.user?.email?.split('@')[0] || ''));
  }, []);

  const isActive = (href: string) => path === href || (href !== '/dashboard' && path.startsWith(href));
  const title = useMemo(() => {
    const active = tabs.find((tab) => isActive(tab.href));
    return active?.label || 'Workspace';
  }, [path]);

  const logout = async () => {
    await createClient().auth.signOut();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[rgba(11,13,17,0.78)] backdrop-blur-xl">
      <div className={`${APP_CONTENT_MAX} mx-auto flex min-h-[78px] items-center justify-between gap-4 px-4 sm:px-6 xl:px-8`}>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setMenuOpen(true)} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/75 md:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-400/25 bg-[linear-gradient(135deg,rgba(99,102,241,.22),rgba(124,58,237,.18))] text-indigo-200 shadow-[0_18px_36px_-24px_rgba(99,102,241,0.45)]">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="serif-display text-[15px] font-semibold tracking-tight text-white">JobSeeker Dashboard & Portfolio</p>
              <p className="text-xs text-white/42">Data-driven sophistication</p>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {tabs.map((tab) => (
            <Link key={tab.href} href={tab.href} className={[
              'inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition',
              isActive(tab.href)
                ? 'border-indigo-400/18 bg-indigo-400/10 text-white shadow-[0_16px_32px_-26px_rgba(99,102,241,0.4)]'
                : 'border-white/8 bg-white/[0.03] text-white/62 hover:bg-white/[0.05] hover:text-white',
            ].join(' ')}>
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-right lg:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/34">Current module</p>
            <p className="text-sm text-white/78">{title}</p>
          </div>
          <Link href="/profile" className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/72 transition hover:text-white sm:inline-flex">
            <User className="h-4 w-4" />
          </Link>
          <button type="button" onClick={logout} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/62 transition hover:text-white">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} className="absolute inset-0 bg-black/65" />
          <div className="absolute inset-y-0 left-0 flex w-[90vw] max-w-[320px] flex-col border-r border-white/10 bg-[rgba(11,13,17,0.96)] p-5 backdrop-blur-xl">
            <div className="mb-4 flex justify-end">
              <button type="button" onClick={() => setMenuOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/70">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {tabs.map((tab) => (
                <Link key={tab.href} href={tab.href} onClick={() => setMenuOpen(false)} className={[
                  'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition',
                  isActive(tab.href) ? 'border-indigo-400/18 bg-indigo-400/10 text-white' : 'border-white/10 bg-white/[0.03] text-white/70',
                ].join(' ')}>
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
