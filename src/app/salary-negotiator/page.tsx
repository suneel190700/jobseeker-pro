'use client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SalaryNegotiatorPage() {
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [offer, setOffer] = useState('');
  const [target, setTarget] = useState('');
  const [experience, setExperience] = useState('mid');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const negotiate = async () => {
    if (!role || !offer) { toast.error('Role and current offer required'); return; }
    setLoading(true);
    try {
      const r = await fetch('/api/negotiate', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, company, currentOffer: offer, targetSalary: target, experience, context }) });
      if (!r.ok) throw new Error('Failed');
      setResult(await r.json());
      toast.success('Strategy ready!');
    } catch { toast.error('Failed to generate'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-extrabold tracking-tighter text-[#bbc3ff]">Salary Negotiator</h2>
      <p className="text-[#c4c5d9] mt-1 text-sm">AI-powered negotiation strategy with talking points and email templates.</p>

      <div className="mt-6 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div><label className="kinetic-label">Role *</label><input value={role} onChange={e => setRole(e.target.value)} className="kinetic-input" placeholder="e.g. Senior AI Engineer" /></div>
            <div><label className="kinetic-label">Company</label><input value={company} onChange={e => setCompany(e.target.value)} className="kinetic-input" placeholder="e.g. Google" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="kinetic-label">Current Offer *</label><input value={offer} onChange={e => setOffer(e.target.value)} className="kinetic-input" placeholder="$150,000" /></div>
              <div><label className="kinetic-label">Your Target</label><input value={target} onChange={e => setTarget(e.target.value)} className="kinetic-input" placeholder="$180,000" /></div>
            </div>
            <div><label className="kinetic-label">Experience Level</label>
              <select value={experience} onChange={e => setExperience(e.target.value)} className="kinetic-select w-full">
                <option value="junior">Junior (0-2 yrs)</option><option value="mid">Mid (2-5 yrs)</option><option value="senior">Senior (5-10 yrs)</option><option value="staff">Staff/Lead (10+ yrs)</option>
              </select>
            </div>
            <div><label className="kinetic-label">Context</label><textarea value={context} onChange={e => setContext(e.target.value)} rows={3} className="kinetic-input resize-none" placeholder="Other offers, relocation, equity, etc." /></div>
            <button onClick={negotiate} disabled={loading || !role || !offer} className="kinetic-btn w-full py-3 text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Generating Strategy...</> : <><span className="material-symbols-outlined text-sm">psychology</span>Generate Negotiation Strategy</>}
            </button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7 space-y-4">
          {!result && !loading && <div className="glass-card rounded-2xl p-12 text-center"><span className="material-symbols-outlined text-4xl text-[#8e90a2] mb-4">payments</span><p className="text-[#8e90a2]">Enter your offer details to get a negotiation strategy</p></div>}
          {loading && <div className="glass-card rounded-2xl p-12 text-center"><Loader2 className="h-6 w-6 animate-spin text-[#bbc3ff] mx-auto" /></div>}
          {result && (
            <div className="space-y-4">
              {result.market_range && <div className="glass-card rounded-2xl p-5">
                <p className="text-[10px] font-bold text-[#bbc3ff] uppercase tracking-widest mb-3">Market Range</p>
                <div className="flex items-center gap-4">
                  <div className="text-center"><p className="text-xs text-[#8e90a2]">Min</p><p className="text-lg font-bold text-[#c4c5d9]">${typeof result.market_range.min === 'number' ? result.market_range.min.toLocaleString() : result.market_range.min}</p></div>
                  <div className="flex-1 h-2 bg-white/10 rounded-full relative"><div className="absolute h-full bg-gradient-to-r from-[#5203d5] to-[#00daf3] rounded-full" style={{width:'60%',left:'20%'}}/></div>
                  <div className="text-center"><p className="text-xs text-[#8e90a2]">Max</p><p className="text-lg font-bold text-[#00daf3]">${typeof result.market_range.max === 'number' ? result.market_range.max.toLocaleString() : result.market_range.max}</p></div>
                </div>
              </div>}
              {result.assessment && <div className="glass-card rounded-2xl p-5"><p className="text-[10px] font-bold text-[#00daf3] uppercase tracking-widest mb-2">Assessment</p><p className="text-sm text-[#c4c5d9] leading-relaxed">{result.assessment}</p></div>}
              {result.strategy && <div className="glass-card rounded-2xl p-5"><p className="text-[10px] font-bold text-[#cdbdff] uppercase tracking-widest mb-2">Strategy</p><p className="text-sm text-[#c4c5d9] leading-relaxed">{result.strategy}</p></div>}
              {result.talking_points?.length > 0 && <div className="glass-card rounded-2xl p-5"><p className="text-[10px] font-bold text-[#bbc3ff] uppercase tracking-widest mb-3">Talking Points</p><div className="space-y-2">{result.talking_points.map((t: string, i: number) => <div key={i} className="flex items-start gap-2"><span className="text-[#bbc3ff] font-bold text-xs mt-0.5">{i+1}.</span><p className="text-sm text-[#c4c5d9]">{t}</p></div>)}</div></div>}
              {result.counter_offer && <div className="glass-card rounded-2xl p-5 border-[#00daf3]/20" style={{background:'rgba(0,218,243,0.05)'}}><p className="text-[10px] font-bold text-[#00daf3] uppercase tracking-widest mb-2">Recommended Counter</p><p className="text-2xl font-black text-[#00daf3]">{result.counter_offer}</p></div>}
              {result.email_template && <div className="glass-card rounded-2xl p-5"><p className="text-[10px] font-bold text-[#cdbdff] uppercase tracking-widest mb-2">Email Template</p><pre className="text-xs text-[#c4c5d9] leading-relaxed whitespace-pre-wrap font-sans">{result.email_template}</pre><button onClick={() => { navigator.clipboard.writeText(result.email_template); toast.success('Copied!'); }} className="mt-3 kinetic-btn-ghost px-4 py-2 text-xs flex items-center gap-1"><span className="material-symbols-outlined text-sm">content_copy</span>Copy</button></div>}
              {result.risks && <div className="glass-card rounded-2xl p-5"><p className="text-[10px] font-bold text-[#ffb4ab] uppercase tracking-widest mb-2">Risks to Consider</p><p className="text-sm text-[#c4c5d9]">{result.risks}</p></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
