'use client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CompanyResearchPage() {
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const research = async () => {
    if (!company.trim()) { toast.error('Enter company name'); return; }
    setLoading(true);
    try {
      const r = await fetch('/api/company-research', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, jobTitle }) });
      if (!r.ok) throw new Error('Failed');
      setData(await r.json()); toast.success('Research ready!');
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-extrabold tracking-tighter text-[#bbc3ff]">Company Research</h2>
      <p className="text-[#c4c5d9] mt-1 text-sm">AI-generated company brief for interview preparation.</p>

      <div className="mt-6 glass-card rounded-2xl p-5">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div><label className="kinetic-label">Company *</label><input value={company} onChange={e => setCompany(e.target.value)} className="kinetic-input" placeholder="e.g. Google" /></div>
          <div><label className="kinetic-label">Role</label><input value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="kinetic-input" placeholder="e.g. AI Engineer" /></div>
        </div>
        <button onClick={research} disabled={loading || !company.trim()} className="kinetic-btn w-full py-3 text-sm disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Researching...</> : <><span className="material-symbols-outlined text-sm">apartment</span>Research Company</>}
        </button>
      </div>

      {data && (
        <div className="mt-6 space-y-4">
          {data.overview && <div className="glass-card rounded-2xl p-5"><p className="text-[10px] font-bold text-[#bbc3ff] uppercase tracking-widest mb-2">Overview</p><p className="text-sm text-[#c4c5d9] leading-relaxed">{data.overview}</p></div>}
          {data.industry && <div className="glass-card rounded-2xl p-5 grid grid-cols-3 gap-4">
            <div><p className="text-[10px] font-bold text-[#8e90a2] uppercase">Industry</p><p className="text-sm text-[#e1e2eb] mt-1">{data.industry}</p></div>
            <div><p className="text-[10px] font-bold text-[#8e90a2] uppercase">Size</p><p className="text-sm text-[#e1e2eb] mt-1">{data.size || 'N/A'}</p></div>
            <div><p className="text-[10px] font-bold text-[#8e90a2] uppercase">Rating</p><p className="text-sm text-[#e1e2eb] mt-1">{data.glassdoor_rating || 'N/A'}</p></div>
          </div>}
          {data.culture && <div className="glass-card rounded-2xl p-5"><p className="text-[10px] font-bold text-[#cdbdff] uppercase tracking-widest mb-2">Culture</p><p className="text-sm text-[#c4c5d9] leading-relaxed">{data.culture}</p></div>}
          {data.values?.length > 0 && <div className="glass-card rounded-2xl p-5"><p className="text-[10px] font-bold text-[#00daf3] uppercase tracking-widest mb-3">Core Values</p><div className="flex flex-wrap gap-2">{data.values.map((v: string, i: number) => <span key={i} className="px-3 py-1 rounded-lg text-xs bg-[#007886]/15 text-[#00daf3] border border-[#00daf3]/20">{v}</span>)}</div></div>}
          {data.tech_stack?.length > 0 && <div className="glass-card rounded-2xl p-5"><p className="text-[10px] font-bold text-[#bbc3ff] uppercase tracking-widest mb-3">Tech Stack</p><div className="flex flex-wrap gap-2">{data.tech_stack.map((t: string, i: number) => <span key={i} className="px-3 py-1 rounded-lg text-xs bg-[#3c59fd]/15 text-[#bbc3ff] border border-[#bbc3ff]/20">{t}</span>)}</div></div>}
          {data.recent_news && <div className="glass-card rounded-2xl p-5"><p className="text-[10px] font-bold text-[#cdbdff] uppercase tracking-widest mb-2">Recent News</p><p className="text-sm text-[#c4c5d9] leading-relaxed">{data.recent_news}</p></div>}
          {data.interview_tips?.length > 0 && <div className="glass-card rounded-2xl p-5"><p className="text-[10px] font-bold text-[#00daf3] uppercase tracking-widest mb-3">Interview Tips</p><div className="space-y-2">{data.interview_tips.map((t: string, i: number) => <p key={i} className="text-sm text-[#c4c5d9] flex items-start gap-2"><span className="material-symbols-outlined text-[#00daf3] text-sm mt-0.5">lightbulb</span>{t}</p>)}</div></div>}
          {data.questions_to_ask?.length > 0 && <div className="glass-card rounded-2xl p-5 border-[#00daf3]/20" style={{background:'rgba(0,218,243,0.03)'}}><p className="text-[10px] font-bold text-[#00daf3] uppercase tracking-widest mb-3">Questions to Ask</p><div className="space-y-2">{data.questions_to_ask.map((q: string, i: number) => <p key={i} className="text-sm text-[#c4c5d9]">• {q}</p>)}</div></div>}
        </div>
      )}
    </div>
  );
}
