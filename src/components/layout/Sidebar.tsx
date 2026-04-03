'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import NotificationCenter from './NotificationCenter';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href:'/dashboard', icon:'dashboard', label:'Home' },
  { href:'/jobs', icon:'work', label:'Search' },
  { href:'/tracker', icon:'assignment', label:'Tracker' },
  { href:'/resume-optimizer', icon:'psychology', label:'Resume AI' },
  { href:'/mock-interview', icon:'record_voice_over', label:'Mock Interview' },
  { href:'/interview-prep', icon:'quiz', label:'Interview Prep' },
  { href:'/cover-letter', icon:'auto_stories', label:'Cover Letter' },
  { href:'/networking', icon:'group', label:'Networking' },
  { href:'/analytics', icon:'insights', label:'Analytics' },
  { href:'/linkedin', icon:'share', label:'LinkedIn' },
  { href:'/resume-versions', icon:'folder_open', label:'My Resumes' },
  { href:'/compare', icon:'compare_arrows', label:'Compare Jobs' },
  { href:'/skill-gap', icon:'trending_up', label:'Skill Gap' },
  { href:'/salary-negotiator', icon:'payments', label:'Salary Negotiator' },
  { href:'/company-research', icon:'apartment', label:'Company Research' },
  { href:'/resume-templates', icon:'dashboard_customize', label:'Templates' },
  { href:'/extension', icon:'extension', label:'Chrome Extension' },
];

export default function Sidebar() {
  const path = usePathname();
  const r = useRouter();
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState('dark');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'dark'; setTheme(t); document.documentElement.className = t;
    createClient().auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const toggleTheme = () => { const next = theme === 'dark' ? 'light' : 'dark'; setTheme(next); localStorage.setItem('theme', next); document.documentElement.className = next; };
  const logout = async () => { await createClient().auth.signOut(); r.push('/'); };

  return (<>
    {/* TOP BAR */}
    <header className="fixed top-0 left-0 right-0 md:left-56 h-14 z-40 flex items-center justify-between px-6" style={{background:'rgba(16,19,26,0.8)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
      <div className="md:hidden flex items-center gap-3">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[#8e90a2]"><span className="material-symbols-outlined">menu</span></button>
        <span className="text-sm font-bold text-[#bbc3ff]">JobSeeker Pro</span>
      </div>
      <div className="hidden md:block">
        <button onClick={() => { const e = new KeyboardEvent('keydown', { key: 'k', metaKey: true }); window.dispatchEvent(e); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[#8e90a2] text-xs hover:bg-white/10 transition">
          <span className="material-symbols-outlined text-sm">search</span>Search...<kbd className="ml-4 px-1.5 py-0.5 rounded bg-white/5 text-[9px] border border-white/10">⌘K</kbd>
        </button>
      </div>
      <div className="flex items-center gap-2">
        <NotificationCenter />
        <button onClick={toggleTheme} className="p-2 rounded-lg text-[#8e90a2] hover:text-[#cdbdff] hover:bg-white/5 transition">
          <span className="material-symbols-outlined text-xl">{theme==='dark'?'light_mode':'dark_mode'}</span>
        </button>
        <button onClick={() => r.push('/profile')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition">
          <div className="w-7 h-7 rounded-full bg-[#3c59fd] flex items-center justify-center text-white text-xs font-bold">{user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}</div>
          <span className="hidden lg:block text-xs text-[#c4c5d9]">{user?.user_metadata?.full_name?.split(' ')[0] || 'Profile'}</span>
        </button>
        <button onClick={logout} className="p-2 rounded-lg text-[#8e90a2] hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/5 transition">
          <span className="material-symbols-outlined text-xl">logout</span>
        </button>
      </div>
    </header>

    {/* SIDEBAR - Desktop */}
    <aside className="hidden md:flex fixed top-0 left-0 h-screen w-56 flex-col z-50" style={{background:'rgba(16,19,26,0.95)',borderRight:'1px solid rgba(255,255,255,0.05)'}}>
      <div className="p-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#3c59fd] flex items-center justify-center"><span className="material-symbols-outlined text-white text-lg" style={{fontVariationSettings:"'FILL' 1"}}>rocket_launch</span></div>
          <div><h1 className="text-sm font-extrabold text-[#e1e2eb] tracking-tight">JobSeeker Pro</h1><p className="text-[#e1e2eb]/40 text-[10px]">AI Career Suite</p></div>
        </div>
      </div>
      <nav className="flex-1 flex flex-col gap-0.5 px-3 overflow-y-auto" style={{scrollbarWidth:'thin'}}>
        {navItems.map(item => {
          const active = path === item.href;
          return <a key={item.href} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all ${active?'bg-[#3c59fd]/15 text-[#bbc3ff] font-semibold':'text-[#8e90a2] hover:text-[#c4c5d9] hover:bg-white/[0.03]'}`}>
            <span className="material-symbols-outlined text-lg" style={active?{fontVariationSettings:"'FILL' 1"}:{}}>{item.icon}</span>{item.label}
          </a>;
        })}
      </nav>
    </aside>

    {/* MOBILE NAV */}
    {mobileOpen && <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
      <aside className="absolute left-0 top-0 h-full w-64 flex flex-col" style={{background:'#10131a'}}>
        <div className="p-5 flex items-center justify-between">
          <span className="text-sm font-bold text-[#bbc3ff]">JobSeeker Pro</span>
          <button onClick={() => setMobileOpen(false)} className="text-[#8e90a2]"><span className="material-symbols-outlined">close</span></button>
        </div>
        <nav className="flex-1 flex flex-col gap-0.5 px-3 overflow-y-auto">
          {navItems.map(item => (
            <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm ${path===item.href?'bg-[#3c59fd]/15 text-[#bbc3ff] font-semibold':'text-[#8e90a2]'}`}>
              <span className="material-symbols-outlined text-lg">{item.icon}</span>{item.label}
            </a>
          ))}
        </nav>
      </aside>
    </div>}
  </>);
}
