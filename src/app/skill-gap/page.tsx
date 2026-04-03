'use client';
import { useState, useMemo } from 'react';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { extractKeywords } from '@/lib/ats-scorer';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SkillGapPage() {
  const { profile } = useResumeProfile();
  const [jds, setJds] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);

  const resumeSkills = useMemo(() => {
    if (!profile?.text) return new Set<string>();
    return new Set(extractKeywords(profile.text));
  }, [profile]);

  const marketSkills = useMemo(() => {
    const all = jds.filter(j => j.trim()).flatMap(j => extractKeywords(j));
    const freq: Record<string, number> = {};
    for (const s of all) freq[s] = (freq[s] || 0) + 1;
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 30);
  }, [jds]);

  const gaps = useMemo(() => {
    return marketSkills.filter(([skill]) => !resumeSkills.has(skill));
  }, [marketSkills, resumeSkills]);

  const strengths = useMemo(() => {
    return marketSkills.filter(([skill]) => resumeSkills.has(skill));
  }, [marketSkills, resumeSkills]);

  const addJd = () => { if (jds.length < 5) setJds([...jds, '']); };
  const updateJd = (i: number, v: string) => { const n = [...jds]; n[i] = v; setJds(n); };

  const getAiInsights = async () => {
    if (gaps.length === 0) { toast.error('No gaps found'); return; }
    setLoading(true);
    try {
      const r = await fetch('/api/company-research', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: 'skill gap analysis', jobTitle: `Missing skills: ${gaps.slice(0, 10).map(g => g[0]).join(', ')}. Has: ${strengths.slice(0, 10).map(s => s[0]).join(', ')}` }) });
      if (r.ok) setAiInsights(await r.json());
    } catch {} finally { setLoading(false); }
  };

  const coverage = marketSkills.length > 0 ? Math.round((strengths.length / marketSkills.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-extrabold tracking-tighter text-[#bbc3ff]">Skill Gap Analysis</h2>
      <p className="text-[#c4c5d9] mt-1 text-sm">Compare your skills against market demand. Paste 2-5 target JDs.</p>

      {!profile && <div className="mt-4 glass-panel rounded-2xl p-4 border-[#cdbdff]/20 bg-[#5203d5]/10 text-sm text-[#cdbdff]">Upload your resume in <a href="/profile" className="underline font-bold">Profile</a> first.</div>}

      <div className="mt-6 space-y-3">
        {jds.map((jd, i) => (
          <div key={i} className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#bbc3ff]">JD {i + 1}</span>
              {jds.length > 1 && <button onClick={() => setJds(jds.filter((_, j) => j !== i))} className="text-[#8e90a2] hover:text-[#ffb4ab] text-xs">Remove</button>}
            </div>
            <textarea value={jd} onChange={e => updateJd(i, e.target.value)} rows={3} placeholder="Paste a target job description..." className="kinetic-input resize-none text-sm" />
          </div>
        ))}
        {jds.length < 5 && <button onClick={addJd} className="kinetic-btn-ghost px-4 py-2 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-sm">add</span>Add JD ({jds.length}/5)</button>}
      </div>

      {/* Results */}
      {marketSkills.length > 0 && profile && (
        <div className="mt-8 space-y-6">
          {/* Coverage meter */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/>
                  <circle cx="40" cy="40" r="34" fill="transparent" stroke={coverage >= 70 ? '#00daf3' : coverage >= 40 ? '#cdbdff' : '#ffb4ab'} strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${2*Math.PI*34}`} strokeDashoffset={`${2*Math.PI*34 - (coverage/100)*2*Math.PI*34}`}/>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-black" style={{color: coverage >= 70 ? '#00daf3' : coverage >= 40 ? '#cdbdff' : '#ffb4ab'}}>{coverage}%</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#e1e2eb]">Market Coverage</h3>
                <p className="text-sm text-[#c4c5d9]">You have {strengths.length} of {marketSkills.length} in-demand skills</p>
                <p className="text-xs text-[#8e90a2] mt-1">{gaps.length} skills to learn for better market fit</p>
              </div>
            </div>
          </div>

          {/* Strengths */}
          <div className="glass-card rounded-2xl p-5">
            <p className="text-[10px] font-bold text-[#00daf3] uppercase tracking-widest mb-3">Your Strengths ({strengths.length})</p>
            <div className="flex flex-wrap gap-2">
              {strengths.map(([skill, count]) => (
                <span key={skill} className="px-3 py-1 rounded-lg text-xs font-medium bg-[#007886]/15 text-[#00daf3] border border-[#00daf3]/20">
                  {skill} <span className="text-[#00daf3]/50 ml-1">({count}x)</span>
                </span>
              ))}
            </div>
          </div>

          {/* Gaps */}
          <div className="glass-card rounded-2xl p-5">
            <p className="text-[10px] font-bold text-[#ffb4ab] uppercase tracking-widest mb-3">Skills to Learn ({gaps.length})</p>
            <div className="flex flex-wrap gap-2">
              {gaps.map(([skill, count]) => (
                <span key={skill} className="px-3 py-1 rounded-lg text-xs font-medium bg-[#93000a]/15 text-[#ffb4ab] border border-[#ffb4ab]/20">
                  {skill} <span className="text-[#ffb4ab]/50 ml-1">({count}x)</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
