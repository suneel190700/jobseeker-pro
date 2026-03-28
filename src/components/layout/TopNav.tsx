'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, BrainCircuit, Briefcase, FileSignature, FolderOpen, Kanban, LayoutDashboard, Linkedin, LogOut, Menu, MessageSquare, Mic, Search, Sparkles, User, Users, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useMemo, useState } from 'react';

const railItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs', label: 'Jobs', icon: Search },
  { href: '/resume-optimizer', label: 'Resume AI', icon: Sparkles },
  { href: '/cover-letter', label: 'Cover Letter', icon: FileSignature },
  { href: '/mock-interview', label: 'Mock Interview', icon: Mic },
  { href: '/tracker', label: 'Tracker', icon: Kanban },
  { href: '/interview-prep', label: 'Interview Prep', icon: MessageSquare },
  { href: '/linkedin', label: 'LinkedIn', icon: Linkedin },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/networking', label: 'Networking', icon: Users },
  { href: '/resume-versions', label: 'Versions', icon: FolderOpen },
  { href: '/profile', label: 'Profile', icon: User },
];

const titleMap: Record<string, string> = {
  '/dashboard': 'AI Command Center',
  '/jobs': 'Jobs Intelligence',
  '/resume-optimizer': 'Resume Analysis',
  '/cover-letter': 'Cover Letter Studio',
  '/mock-interview': 'Interview Studio',
  '/tracker': 'Pipeline Tracker',
  '/interview-prep': 'Interview Prep',
  '/linkedin': 'LinkedIn Optimizer',
  '/analytics': 'Analytics Grid',
  '/networking': 'Networking',
  '/resume-versions': 'Resume Versions',
  '/profile': 'Profile',
};

function Rail({ path, onNavigate }: { path: string; onNavigate?: () => void }) {
  const isActive = (href: string) => path === href || (href !== '/dashboard' && path.startsWith(href));
  return (
    <div className="flex h-full flex-col items-center gap-3 py-3">
      <Link href="/dashboard" onClick={onNavigate} className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/25 bg-[linear-gradient(135deg,rgba(0,194,255,.22),rgba(124,58,237,.18))] text-cyan-200 shadow-[0_18px_36px_-24px_rgba(0,194,255,0.55)]">
        <BrainCircuit className="h-5 w-5" />
      </Link>
      {railItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate} className={[
            'group relative flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-200',
            active ? 'border-cyan-400/24 bg-cyan-400/10 text-cyan-200 shadow-[0_16px_34px_-22px_rgba(0,194,255,0.4)]' : 'border-white/8 bg-white/[0.02] text-white/55 hover:border-white/14 hover:bg-white/[0.05] hover:text-white/85',
          ].join(' ')} aria-label={item.label} title={item.label}>
            <item.icon className="h-[18px] w-[18px]" strokeWidth={2.1} />
            <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 hidden -translate-y-1/2 rounded-xl border border-white/10 bg-[rgba(12,17,23,0.95)] px-3 py-2 text-[12px] font-medium text-white/88 shadow-xl group-hover:block xl:block xl:opacity-0 xl:group-hover:opacity-100 xl:transition-opacity">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default function TopNav() {
  const path = usePathname();
  const router = useRouter();
  const [name, setName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { createClient().auth.getUser().then(({ data }) => setName(data?.user?.user_metadata?.full_name || data?.user?.email?.split('@')[0] || '')); }, []);
  useEffect(() => setMenuOpen(false), [path]);

  const currentTitle = useMemo(() => {
    const exact = Object.entries(titleMap).find(([href]) => path === href || (href !== '/dashboard' && path.startsWith(href)));
    return exact?.[1] || 'AI Command Center';
  }, [path]);

  const logout = async () => { await createClient().auth.signOut(); router.push('/'); };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[84px] border-r border-white/8 bg-[rgba(10,15,20,0.88)] backdrop-blur-xl xl:flex xl:flex-col xl:items-center xl:justify-between">
        <Rail path={path} />
        <div className="mb-5 flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-bold text-cyan-200">{name?.[0]?.toUpperCase() || 'U'}</div>
          <button type="button" onClick={logout} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/60 transition hover:border-white/14 hover:bg-white/[0.06] hover:text-white">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-white/8 bg-[rgba(11,15,20,0.76)] backdrop-blur-xl xl:ml-[84px]">
        <div className="flex min-h-[72px] items-center justify-between gap-4 px-4 sm:px-6 xl:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setMenuOpen(true)} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/75 xl:hidden"><Menu className="h-5 w-5" /></button>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/32">Live workspace</p>
              <h1 className="truncate text-[22px] font-semibold tracking-tight text-white">{currentTitle}</h1>
            </div>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/32">System mode</p>
              <p className="text-sm text-white/78">Futuristic AI tool</p>
            </div>
            <Link href="/jobs" className="btn-filled btn-sm !min-h-0 px-4 py-3"><Briefcase className="h-4 w-4" />Search jobs</Link>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} className="absolute inset-0 bg-black/65" />
          <div className="absolute inset-y-0 left-0 flex w-[92vw] max-w-[340px] flex-col border-r border-white/10 bg-[rgba(11,15,20,0.96)] p-5 backdrop-blur-xl">
            <div className="mb-4 flex justify-end"><button type="button" onClick={() => setMenuOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/70"><X className="h-4 w-4" /></button></div>
            <div className="mb-6 flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(0,194,255,.22),rgba(124,58,237,.18))] text-cyan-200"><BrainCircuit className="h-5 w-5" /></div>
              <div><p className="text-[15px] font-semibold tracking-tight text-white">JobSeeker Pro</p><p className="text-xs text-white/42">AI Command Center</p></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {railItems.map((item) => {
                const active = path === item.href || (item.href !== '/dashboard' && path.startsWith(item.href));
                return <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={['flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition', active ? 'border-cyan-400/24 bg-cyan-400/10 text-cyan-200' : 'border-white/10 bg-white/[0.03] text-white/70'].join(' ')}><item.icon className="h-5 w-5" /><span className="text-[11px] font-medium">{item.label}</span></Link>;
              })}
            </div>
            <button type="button" onClick={logout} className="mt-auto flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white/76"><LogOut className="h-4 w-4" />Sign out</button>
          </div>
        </div>
      )}
    </>
  );
}
