'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, LogOut, ChevronDown, Search, Zap, Kanban, BarChart3, Users, Mic, MoreHorizontal } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useRef } from 'react';

const primary = [
  { href:'/dashboard', label:'Home' },
  { href:'/jobs', label:'Jobs' },
  { href:'/resume-optimizer', label:'Resume AI' },
  { href:'/tracker', label:'Tracker' },
  { href:'/mock-interview', label:'Interview' },
];
const more = [
  { href:'/cover-letter', label:'Cover Letter' },
  { href:'/interview-prep', label:'Q&A Prep' },
  { href:'/linkedin', label:'LinkedIn' },
  { href:'/analytics', label:'Analytics' },
  { href:'/networking', label:'Networking' },
  { href:'/resume-versions', label:'My Resumes' },
  { href:'/profile', label:'Profile' },
];

export default function TopNav() {
  const p = usePathname(); const r = useRouter();
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

  const logout = async () => { await createClient().auth.signOut(); r.push('/'); };

  return (
    <header className="sticky top-0 z-50 h-12 border-b border-zinc-800/80 bg-bg-0/80 backdrop-blur-xl">
      <div className="h-full max-w-[1400px] mx-auto flex items-center px-5 gap-1">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 mr-6 flex-shrink-0">
          <div className="h-6 w-6 rounded-md flex items-center justify-center" style={{background:'linear-gradient(135deg,#6366f1,#7c3aed)'}}><Sparkles className="h-3 w-3 text-white" /></div>
          <span className="text-sm font-bold text-white hidden sm:block">JobSeeker Pro</span>
        </Link>

        {/* Primary Nav */}
        <nav className="flex items-center gap-0.5">
          {primary.map(n => {
            const a = p === n.href || (n.href !== '/dashboard' && p.startsWith(n.href));
            return <Link key={n.href} href={n.href} className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${a ? 'text-white bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}>{n.label}</Link>;
          })}

          {/* More dropdown */}
          <div ref={moreRef} className="relative">
            <button onClick={() => setShowMore(!showMore)} className={`px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all flex items-center gap-1 ${showMore || more.some(m => p.startsWith(m.href)) ? 'text-white bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}>
              More <ChevronDown className={`h-3 w-3 transition-transform ${showMore ? 'rotate-180' : ''}`} />
            </button>
            {showMore && (
              <div className="absolute top-full left-0 mt-1.5 w-48 bg-bg-1 border border-zinc-800 rounded-xl shadow-elevated p-1.5 z-50">
                {more.map(n => (
                  <Link key={n.href} href={n.href} onClick={() => setShowMore(false)} className={`block px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${p.startsWith(n.href) ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'}`}>{n.label}</Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex-1" />

        {/* User */}
        <div ref={userRef} className="relative">
          <button onClick={() => setShowUser(!showUser)} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-zinc-800/50 transition">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-accent-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">{name?.[0]?.toUpperCase() || 'U'}</div>
            <span className="text-xs font-medium text-zinc-400 hidden sm:block">{name}</span>
          </button>
          {showUser && (
            <div className="absolute top-full right-0 mt-1.5 w-44 bg-bg-1 border border-zinc-800 rounded-xl shadow-elevated p-1.5 z-50">
              <Link href="/profile" onClick={() => setShowUser(false)} className="block px-3 py-2 rounded-lg text-[13px] text-zinc-400 hover:text-white hover:bg-zinc-800/60">Profile</Link>
              <button onClick={logout} className="w-full text-left px-3 py-2 rounded-lg text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/10">Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
