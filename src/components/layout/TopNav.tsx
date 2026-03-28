'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, LogOut, ChevronDown, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useRef } from 'react';
import { APP_CONTENT_MAX } from '@/components/layout/constants';

const tabs = [
  { href: '/dashboard', label: 'Home' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/resume-optimizer', label: 'Resume AI' },
  { href: '/mock-interview', label: 'Interview' },
  { href: '/tracker', label: 'Tracker' },
];
const moreItems = [
  { href: '/cover-letter', label: 'Cover Letter' },
  { href: '/interview-prep', label: 'Q&A Prep' },
  { href: '/linkedin', label: 'LinkedIn' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/networking', label: 'Networking' },
  { href: '/resume-versions', label: 'My Resumes' },
  { href: '/profile', label: 'Profile' },
];

export default function TopNav() {
  const path = usePathname();
  const router = useRouter();
  const [name, setName] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setName(data?.user?.user_metadata?.full_name || data?.user?.email?.split('@')[0] || ''));
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setShowMore(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const logout = async () => {
    await createClient().auth.signOut();
    router.push('/');
  };

  const isActive = (href: string) => path === href || (href !== '/dashboard' && path.startsWith(href));

  const navLink = (active: boolean) =>
    [
      'relative px-3 py-2 rounded-[var(--radius-sm)] text-[13px] font-semibold transition-colors',
      active
        ? 'text-[var(--bg-primary)] bg-[var(--accent)] shadow-glow-sm'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)]',
    ].join(' ');

  return (
    <header className="sticky top-0 z-50 border-b" style={{ borderColor: 'var(--separator)', background: 'rgba(5,6,8,0.85)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}>
      <div className={`${APP_CONTENT_MAX} mx-auto flex items-center min-h-[56px] px-4 md:px-5 gap-2`}>
        <Link href="/dashboard" className="flex items-center gap-2.5 mr-4 md:mr-8 press flex-shrink-0">
          <div
            className="h-9 w-9 rounded-[var(--radius-sm)] flex items-center justify-center ring-1 ring-white/10"
            style={{ background: 'linear-gradient(145deg, var(--accent), var(--accent-secondary))' }}
          >
            <Sparkles className="h-[18px] w-[18px] text-[var(--bg-primary)]" strokeWidth={2.2} />
          </div>
          <span className="text-[15px] font-bold tracking-tight hidden sm:block bg-gradient-to-r from-white to-[var(--text-secondary)] bg-clip-text text-transparent">
            JobSeeker
            <span className="text-[var(--accent)]"> Pro</span>
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 flex-1 min-w-0 overflow-x-auto no-scrollbar py-1">
          {tabs.map((t) => (
            <Link key={t.href} href={t.href} className={navLink(isActive(t.href))}>
              {t.label}
            </Link>
          ))}
          <div ref={moreRef} className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              className={[
                'flex items-center gap-1 px-3 py-2 rounded-[var(--radius-sm)] text-[13px] font-semibold transition-colors',
                showMore || moreItems.some((m) => path.startsWith(m.href))
                  ? 'text-[var(--text-primary)] bg-[var(--surface-2)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)]',
              ].join(' ')}
            >
              More
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showMore ? 'rotate-180' : ''}`} />
            </button>
            {showMore && (
              <div
                className="absolute top-full left-0 mt-2 w-56 rounded-[var(--radius-md)] p-1.5 z-50 border shadow-glow"
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--separator)' }}
              >
                {moreItems.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setShowMore(false)}
                    className={[
                      'block px-3 py-2.5 rounded-[10px] text-[14px] font-medium transition-colors',
                      isActive(n.href)
                        ? 'text-[var(--accent)] bg-[var(--accent-dim)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)]',
                    ].join(' ')}
                  >
                    {n.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div ref={userRef} className="relative flex-shrink-0 pl-2">
          <button
            type="button"
            onClick={() => setShowUser(!showUser)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-[var(--radius-md)] press transition-colors hover:bg-[var(--surface-1)] border border-transparent hover:border-[var(--separator)]"
          >
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold text-[var(--bg-primary)] ring-2 ring-[var(--accent)]/30"
              style={{ background: 'linear-gradient(145deg, var(--accent-secondary), var(--accent))' }}
            >
              {name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-[13px] font-semibold text-[var(--text-secondary)] hidden md:block max-w-[120px] truncate">
              {name}
            </span>
          </button>
          {showUser && (
            <div
              className="absolute top-full right-0 mt-2 w-52 rounded-[var(--radius-md)] p-1.5 z-50 border shadow-glow"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--separator)' }}
            >
              <Link
                href="/profile"
                onClick={() => setShowUser(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-[10px] text-[14px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-1)]"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <div className="divider my-1" />
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-[10px] text-[14px] text-[var(--destructive)] hover:bg-[rgba(251,113,133,0.08)]"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
