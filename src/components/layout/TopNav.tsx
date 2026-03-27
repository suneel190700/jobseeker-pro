'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, LogOut, ChevronDown, Mic, MoreHorizontal } from 'lucide-react';
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
    <header className="sticky top-0 z-50 flex items-center justify-between h-14 px-6 border-b border-white/[0.04]" style={{ background: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{background:'linear-gradient(135deg,#3b82f6,#6366f1)'}}><Sparkles className="h-3.5 w-3.5 text-white" /></div>
          <span className="text-[15px] font-bold text-white hidden sm:block">JobSeeker Pro</span>
        </Link>
        <nav className="flex items-center gap-0.5">
          {primary.map(n => {
            const a = p === n.href || (n.href !== '/dashboard' && p.startsWith(n.href));
            return <Link key={n.href} href={n.href} className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all ${a ? 'text-white bg-white/[0.08]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'}`}>{n.label}</Link>;
          })}
          <div ref={moreRef} className="relative">
            <button onClick={() => setShowMore(!showMore)} className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all flex items-center gap-1 ${showMore || more.some(m => p.startsWith(m.href)) ? 'text-white bg-white/[0.08]' : 'text-slate-500 hover:text-slate-300'}`}>
              More <ChevronDown className={`h-3 w-3 transition-transform ${showMore ? 'rotate-180' : ''}`} />
            </button>
            {showMore && (
              <div className="absolute top-full left-0 mt-2 w-48 glass p-1.5 z-50" style={{boxShadow:'0 8px 30px rgba(0,0,0,0.4)'}}>
                {more.map(n => (
                  <Link key={n.href} href={n.href} onClick={() => setShowMore(false)} className={`block px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${p.startsWith(n.href) ? 'text-white bg-white/[0.08]' : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'}`}>{n.label}</Link>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
      <div ref={userRef} className="relative">
        <button onClick={() => setShowUser(!showUser)} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/[0.04] transition">
          <div className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{background:'linear-gradient(135deg,#3b82f6,#6366f1)'}}>{name?.[0]?.toUpperCase() || 'U'}</div>
          <span className="text-xs font-medium text-slate-400 hidden sm:block">{name}</span>
        </button>
        {showUser && (
          <div className="absolute top-full right-0 mt-2 w-44 glass p-1.5 z-50" style={{boxShadow:'0 8px 30px rgba(0,0,0,0.4)'}}>
            <Link href="/profile" onClick={() => setShowUser(false)} className="block px-3 py-2 rounded-lg text-[13px] text-slate-400 hover:text-white hover:bg-white/[0.06]">Profile</Link>
            <button onClick={logout} className="w-full text-left px-3 py-2 rounded-lg text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/10">Sign out</button>
          </div>
        )}
      </div>
    </header>
  );
}
