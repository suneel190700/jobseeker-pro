'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Home, Mail, Search, Star, UserRound, BarChart3, LogOut, CalendarDays, FolderKanban } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { APP_CONTENT_MAX } from './constants';

const items = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/jobs', icon: Search, label: 'Jobs' },
  { href: '/resume-optimizer', icon: Star, label: 'Resume AI' },
  { href: '/tracker', icon: FolderKanban, label: 'Tracker' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/networking', icon: Mail, label: 'Networking' },
  { href: '/profile', icon: UserRound, label: 'Profile' },
  { href: '/cover-letter', icon: CalendarDays, label: 'Cover Letter' },
];

export default function TopNav() {
  const path = usePathname();
  const router = useRouter();
  const [name, setName] = useState('');

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setName(data?.user?.user_metadata?.full_name || data?.user?.email?.split('@')[0] || ''));
  }, []);

  const logout = async () => {
    await createClient().auth.signOut();
    router.push('/');
  };

  const isActive = (href: string) => path === href || (href !== '/dashboard' && path.startsWith(href));

  return (
    <>
      <aside className="sidebar-pill fixed bottom-6 left-6 top-6 z-40 hidden w-[72px] flex-col justify-between p-3 lg:flex">
        <div className="space-y-3">
          {items.map((item) => (
            <Link key={item.href} href={item.href} title={item.label} className={[
              'flex h-12 w-12 items-center justify-center rounded-2xl border transition',
              isActive(item.href) ? 'border-slate-200 bg-slate-100 text-[var(--text-primary)] shadow-inner' : 'border-transparent text-slate-500 hover:bg-slate-50',
            ].join(' ')}>
              <item.icon className="h-5 w-5" strokeWidth={1.9} />
            </Link>
          ))}
        </div>
        <div className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700">{name?.[0]?.toUpperCase() || 'U'}</div>
          <button type="button" onClick={logout} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-transparent text-slate-500 transition hover:bg-slate-50" title="Sign out"><LogOut className="h-5 w-5" strokeWidth={1.9} /></button>
        </div>
      </aside>
      <div className={`${APP_CONTENT_MAX} mx-auto px-4 pt-6 sm:px-6 lg:pl-[96px] xl:px-8`}>
        <header className="soft-card flex min-h-[84px] items-center justify-between px-6">
          <div>
            <h1 className="serif-display text-[28px] font-semibold tracking-tight text-[var(--text-primary)]">Job Seeker Dashboard</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Premium SaaS minimalism with real profile-driven content</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600"><Bell className="h-4 w-4" /></button>
            <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600"><Mail className="h-4 w-4" /></button>
            <Link href="/profile" className="flex h-11 min-w-[44px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700">{name || 'Profile'}</Link>
          </div>
        </header>
      </div>
    </>
  );
}
