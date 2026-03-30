'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const commands = [
  { label: 'Job Search', href: '/jobs', icon: 'work' },
  { label: 'Resume AI Optimizer', href: '/resume-optimizer', icon: 'psychology' },
  { label: 'Mock Interview', href: '/mock-interview', icon: 'record_voice_over' },
  { label: 'Application Tracker', href: '/tracker', icon: 'assignment' },
  { label: 'Cover Letter', href: '/cover-letter', icon: 'auto_stories' },
  { label: 'Networking', href: '/networking', icon: 'group' },
  { label: 'Analytics', href: '/analytics', icon: 'insights' },
  { label: 'Interview Prep', href: '/interview-prep', icon: 'quiz' },
  { label: 'LinkedIn Optimizer', href: '/linkedin', icon: 'share' },
  { label: 'My Resumes', href: '/resume-versions', icon: 'folder_open' },
  { label: 'Profile & Settings', href: '/profile', icon: 'settings' },
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(o => !o); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => { if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);

  const filtered = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));
  const go = (href: string) => { setOpen(false); router.push(href); };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh]" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg" onClick={e => e.stopPropagation()} style={{background:'rgba(29,32,38,0.95)',backdropFilter:'blur(40px)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'20px',boxShadow:'0 25px 80px rgba(0,0,0,0.6)'}}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          <span className="material-symbols-outlined text-[#8e90a2] text-xl">search</span>
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search commands..." className="flex-1 bg-transparent border-none text-[#e1e2eb] text-sm outline-none placeholder:text-[#8e90a2]/50" />
          <kbd className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-bold text-[#8e90a2] border border-white/10">ESC</kbd>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filtered.map(c => (
            <button key={c.href} onClick={() => go(c.href)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-white/5 transition-all">
              <span className="material-symbols-outlined text-[#bbc3ff] text-lg">{c.icon}</span>
              <span className="text-sm font-medium text-[#e1e2eb]">{c.label}</span>
            </button>
          ))}
          {filtered.length === 0 && <p className="text-center text-sm text-[#8e90a2] py-8">No results found</p>}
        </div>
        <div className="px-5 py-3 border-t border-white/5 flex items-center gap-4 text-[10px] text-[#8e90a2]">
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">↑↓</kbd> Navigate</span>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">↵</kbd> Select</span>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">⌘K</kbd> Toggle</span>
        </div>
      </div>
    </div>
  );
}
