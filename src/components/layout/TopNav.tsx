'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, LogOut, ChevronDown, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useRef } from 'react';

const tabs = [
  { href:'/dashboard', label:'Home' },
  { href:'/jobs', label:'Jobs' },
  { href:'/resume-optimizer', label:'Resume AI' },
  { href:'/mock-interview', label:'Interview' },
  { href:'/tracker', label:'Tracker' },
];
const moreItems = [
  { href:'/cover-letter', label:'Cover Letter' },
  { href:'/interview-prep', label:'Q&A Prep' },
  { href:'/linkedin', label:'LinkedIn' },
  { href:'/analytics', label:'Analytics' },
  { href:'/networking', label:'Networking' },
  { href:'/resume-versions', label:'My Resumes' },
  { href:'/profile', label:'Profile' },
];

export default function TopNav() {
  const path = usePathname(); const router = useRouter();
  const [name, setName] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => { createClient().auth.getUser().then(({ data }) => setName(data?.user?.user_metadata?.full_name || data?.user?.email?.split('@')[0] || '')); }, []);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (moreRef.current && !moreRef.current.contains(e.target as Node)) setShowMore(false); if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);

  const logout = async () => { await createClient().auth.signOut(); router.push('/'); };
  const isActive = (href: string) => path === href || (href !== '/dashboard' && path.startsWith(href));

  return (
    <header className="sticky top-0 z-50 vibrancy border-b" style={{ borderColor: 'var(--separator)' }}>
      <div className="max-w-[1280px] mx-auto flex items-center h-[52px] px-5">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 mr-8 press">
          <div className="h-[28px] w-[28px] rounded-[8px] flex items-center justify-center" style={{background:'var(--accent)'}}><Sparkles className="h-[14px] w-[14px] text-white" /></div>
          <span className="text-[15px] font-semibold text-white tracking-tight hidden sm:block">JobSeeker Pro</span>
        </Link>

        {/* Segmented-style tabs */}
        <nav className="flex items-center gap-1">
          {tabs.map(t => (
            <Link key={t.href} href={t.href} className={`px-3 py-[6px] rounded-[8px] text-[13px] font-medium transition-all duration-200 ${isActive(t.href) ? 'text-white' : 'text-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.8)]'}`} style={isActive(t.href) ? { background: 'var(--surface-2)' } : {}}>
              {t.label}
            </Link>
          ))}
          <div ref={moreRef} className="relative">
            <button onClick={() => setShowMore(!showMore)} className={`flex items-center gap-1 px-3 py-[6px] rounded-[8px] text-[13px] font-medium transition-all ${showMore || moreItems.some(m => path.startsWith(m.href)) ? 'text-white' : 'text-[rgba(255,255,255,0.5)]'}`} style={showMore || moreItems.some(m => path.startsWith(m.href)) ? { background: 'var(--surface-2)' } : {}}>
              More <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showMore ? 'rotate-180' : ''}`} />
            </button>
            {showMore && (
              <div className="absolute top-full left-0 mt-2 w-52 surface-elevated p-[6px] z-50 shadow-2xl">
                {moreItems.map(n => (
                  <Link key={n.href} href={n.href} onClick={() => setShowMore(false)} className={`block px-3 py-[10px] rounded-[10px] text-[14px] font-medium transition-all ${isActive(n.href) ? 'text-white bg-[var(--surface-2)]' : 'text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-[var(--surface-1)]'}`}>
                    {n.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex-1" />

        {/* User menu */}
        <div ref={userRef} className="relative">
          <button onClick={() => setShowUser(!showUser)} className="flex items-center gap-2 px-2 py-1 rounded-[8px] press hover:bg-[var(--surface-1)] transition-all">
            <div className="h-[28px] w-[28px] rounded-full flex items-center justify-center text-[11px] font-semibold text-white" style={{background:'linear-gradient(135deg, #5E5CE6, #BF5AF2)'}}>{name?.[0]?.toUpperCase() || 'U'}</div>
            <span className="text-[13px] font-medium text-[rgba(255,255,255,0.6)] hidden sm:block">{name}</span>
          </button>
          {showUser && (
            <div className="absolute top-full right-0 mt-2 w-48 surface-elevated p-[6px] z-50 shadow-2xl">
              <Link href="/profile" onClick={() => setShowUser(false)} className="flex items-center gap-2 px-3 py-[10px] rounded-[10px] text-[14px] text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-[var(--surface-1)]"><User className="h-4 w-4" />Profile</Link>
              <div className="divider my-[4px]" />
              <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-[10px] rounded-[10px] text-[14px] text-[var(--destructive)] hover:bg-[rgba(255,69,58,0.1)]"><LogOut className="h-4 w-4" />Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
