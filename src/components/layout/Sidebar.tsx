'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

const nav = [
  { href:'/dashboard', icon:'dashboard', label:'Home' },
  { href:'/jobs', icon:'work', label:'Search' },
  { href:'/tracker', icon:'assignment', label:'Tracker' },
  { href:'/resume-optimizer', icon:'psychology', label:'Resume AI' },
  { href:'/mock-interview', icon:'record_voice_over', label:'Mock Interview' },
  { href:'/networking', icon:'group', label:'Networking' },
  { href:'/analytics', icon:'insights', label:'Analytics' },
  { href:'/cover-letter', icon:'auto_stories', label:'Cover Letter' },
  { href:'/interview-prep', icon:'quiz', label:'Interview Prep' },
  { href:'/linkedin', icon:'share', label:'LinkedIn' },
  { href:'/resume-versions', icon:'folder_open', label:'My Resumes' },
  { href:'/profile', icon:'settings', label:'Settings' },
];

export default function Sidebar() {
  const p = usePathname();
  const r = useRouter();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState(false);
  useEffect(() => { createClient().auth.getUser().then(({ data }) => setName(data?.user?.user_metadata?.full_name || data?.user?.email?.split('@')[0] || '')); }, []);

  const [theme, setTheme] = useState('dark');
  useEffect(() => { const t = localStorage.getItem('theme') || 'dark'; setTheme(t); document.documentElement.className = t; }, []);
  const toggleTheme = () => { const next = theme === 'dark' ? 'light' : 'dark'; setTheme(next); localStorage.setItem('theme', next); document.documentElement.className = next; };
  const logout = async () => { await createClient().auth.signOut(); r.push('/'); };

  return (<>
    {/* Desktop Sidebar */}
    <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 z-[60] flex-col py-6 px-4 gap-2" style={{ background: 'rgba(8,10,15,0.4)', backdropFilter: 'blur(40px)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="mb-8 px-4 pt-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#3c59fd] flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-base" style={{fontVariationSettings:"'FILL' 1"}}>rocket_launch</span>
          </div>
          <h1 className="text-[#bbc3ff] font-bold text-lg tracking-tighter">JobSeeker Pro</h1>
        </div>
        <p className="text-[#e1e2eb]/50 text-xs">Premium AI Career Suite</p>
        <button onClick={() => { const e = new KeyboardEvent('keydown', { key: 'k', metaKey: true }); window.dispatchEvent(e); }} className="mt-4 w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-[#8e90a2] text-xs hover:bg-white/10 transition">
          <span className="material-symbols-outlined text-sm">search</span>Search...<kbd className="ml-auto px-1.5 py-0.5 rounded bg-white/5 text-[9px] border border-white/10">⌘K</kbd>
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {nav.map(n => {
          const active = p === n.href || (n.href !== '/dashboard' && p.startsWith(n.href));
          return (
            <Link key={n.href} href={n.href} className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${active ? 'bg-[#3c59fd]/15 text-[#bbc3ff] border-r-2 border-[#bbc3ff]' : 'text-[#e1e2eb]/50 hover:text-[#e1e2eb] hover:bg-white/5'}`}>
              <span className="material-symbols-outlined text-xl" style={active ? {fontVariationSettings:"'FILL' 1"} : {}}>{n.icon}</span>
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-[#3c59fd] flex items-center justify-center text-xs font-bold text-white">{name?.[0]?.toUpperCase()||'U'}</div>
          <div className="flex-1 min-w-0"><p className="text-sm font-medium text-[#e1e2eb] truncate">{name}</p></div>
        </div>
        <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#e1e2eb]/40 hover:text-[#cdbdff] hover:bg-[#cdbdff]/5 transition-all rounded-lg">
          <span className="material-symbols-outlined text-xl">{theme==='dark'?'light_mode':'dark_mode'}</span>{theme==='dark'?'Light Mode':'Dark Mode'}
        </button>
        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#e1e2eb]/40 hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/5 transition-all rounded-lg">
          <span className="material-symbols-outlined text-xl">logout</span>Sign out
        </button>
      </div>
    </aside>

    {/* Mobile Bottom Nav */}
    <nav className="md:hidden fixed bottom-0 w-full h-16 z-[70] flex justify-around items-center px-4" style={{ background: 'rgba(8,10,15,0.8)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      {[nav[0],nav[1],nav[2],nav[3],nav[11]].map(n => {
        const active = p === n.href || (n.href !== '/dashboard' && p.startsWith(n.href));
        return (
          <Link key={n.href} href={n.href} className={`flex flex-col items-center gap-1 ${active ? 'text-[#bbc3ff]' : 'text-[#e1e2eb]/50'}`}>
            <span className="material-symbols-outlined text-xl" style={active ? {fontVariationSettings:"'FILL' 1"} : {}}>{n.icon}</span>
            <span className="text-[10px] font-bold">{n.label}</span>
          </Link>
        );
      })}
    </nav>

    {/* Mobile Top Bar */}
    <header className="md:hidden fixed top-0 w-full h-14 z-50 flex items-center justify-between px-4" style={{ background: 'rgba(8,10,15,0.6)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span className="text-[#bbc3ff] font-bold text-lg tracking-tighter">JobSeeker Pro</span>
      <div className="w-8 h-8 rounded-full bg-[#3c59fd] flex items-center justify-center text-xs font-bold text-white">{name?.[0]?.toUpperCase()||'U'}</div>
    </header>
  </>);
}
