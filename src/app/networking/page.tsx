'use client';
import { useState } from 'react';
import { Users, Mail, Search, Loader2, Copy, ExternalLink, UserCheck, Building2, Linkedin } from 'lucide-react';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { toast } from 'sonner';

type Tab = 'recruiter' | 'email' | 'referral';

export default function NetworkingPage() {
  const { profile } = useResumeProfile();
  const [tab, setTab] = useState<Tab>('recruiter');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const findRecruiter = async () => {
    if (!company.trim()) return;
    setLoading(true); setResult(null);
    try {
      const r = await fetch('/api/networking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'find_recruiter', company, jobTitle }) });
      const d = await r.json();
      setResult(d);
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  const generateEmail = async () => {
    if (!company.trim() || !jobTitle.trim()) return;
    setLoading(true); setResult(null);
    try {
      const r = await fetch('/api/networking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cold_email', company, jobTitle, jobDescription: jd, resumeText: profile?.text || '' }) });
      const d = await r.json();
      setResult(d);
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  const findReferrals = async () => {
    if (!company.trim()) return;
    setLoading(true); setResult(null);
    try {
      const r = await fetch('/api/networking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'referral_tips', company, jobTitle }) });
      const d = await r.json();
      setResult(d);
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copied!'); };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[#e1e2eb] tracking-tight">Networking</h1>
      <p className="mt-1 text-sm text-[#434656]">Find recruiters, generate outreach emails & discover referral paths</p>

      <div className="mt-5 flex gap-2">
        {[{id:'recruiter' as Tab,label:'Find Recruiter',icon:UserCheck},{id:'email' as Tab,label:'Cold Email',icon:Mail},{id:'referral' as Tab,label:'Referral Tips',icon:Users}].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setResult(null); }} className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all ${tab === t.id ? 'bg-[#007886]/10 text-[#00daf3] border border-[#30d158]/20 shadow-xs' : 'text-[#8e90a2] hover:bg-[rgba(255,255,255,0.05)] border border-transparent'}`}>
            <t.icon className="h-4 w-4" />{t.label}
          </button>
        ))}
      </div>

      <div className="mt-5 glass-card p-6">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs font-semibold text-[#8e90a2] mb-1.5">Company</label><input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google, Meta" className="kinetic-input" /></div>
          <div><label className="block text-xs font-semibold text-[#8e90a2] mb-1.5">Job Title</label><input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. AI Engineer" className="kinetic-input" /></div>
        </div>
        {tab === 'email' && <div className="mt-4"><label className="block text-xs font-semibold text-[#8e90a2] mb-1.5">Job Description (optional)</label><textarea rows={4} value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste JD for personalized email..." className="kinetic-input" /></div>}
        <button onClick={tab === 'recruiter' ? findRecruiter : tab === 'email' ? generateEmail : findReferrals} disabled={loading || !company.trim()} className="mt-4 kinetic-btn px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : tab === 'recruiter' ? <Search className="h-4 w-4" /> : tab === 'email' ? <Mail className="h-4 w-4" /> : <Users className="h-4 w-4" />}
          {loading ? 'Generating...' : tab === 'recruiter' ? 'Find Recruiters' : tab === 'email' ? 'Generate Email' : 'Find Referral Paths'}
        </button>
      </div>

      {result && (
        <div className="mt-5 glass-card p-6">
          {tab === 'recruiter' && result.recruiters && (
            <div>
              <h3 className="text-sm font-bold text-[#c4c5d9] mb-3">Likely Hiring Contacts at {company}</h3>
              <div className="space-y-3">
                {result.recruiters.map((r: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 bg-[rgba(255,255,255,0.03)] rounded-2xl p-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/15 flex items-center justify-center"><UserCheck className="h-5 w-5 text-[#00daf3]" /></div>
                    <div className="flex-1"><p className="text-sm font-semibold text-[#c4c5d9]">{r.name || r.title}</p><p className="text-xs text-[#434656]">{r.role || r.department}</p></div>
                    {r.linkedin_search && <a href={r.linkedin_search} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 rounded-lg text-xs bg-[#3c59fd]/10 text-[#bbc3ff] border border-[#0a84ff]/20 gap-1 cursor-pointer hover:bg-blue-100"><Linkedin className="h-3 w-3" />Find</a>}
                  </div>
                ))}
              </div>
              {result.tips && <div className="mt-3 bg-[#007886]/10 rounded-2xl p-3 border border-emerald-500/10"><p className="text-xs text-[#00daf3]">{result.tips}</p></div>}
            </div>
          )}
          {tab === 'email' && result.email && (
            <div>
              <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-[#c4c5d9]">Cold Outreach Email</h3><button onClick={() => copy(result.subject + '\n\n' + result.email)} className="px-2 py-0.5 rounded-lg text-xs bg-[rgba(255,255,255,0.03)] text-[#c4c5d9] border border-[rgba(255,255,255,0.08)] gap-1 cursor-pointer hover:bg-[rgba(255,255,255,0.05)]"><Copy className="h-3 w-3" />Copy</button></div>
              {result.subject && <p className="text-xs text-[#434656] mb-2">Subject: <span className="text-[#c4c5d9] font-semibold">{result.subject}</span></p>}
              <div className="bg-[rgba(255,255,255,0.03)] rounded-2xl p-4 text-sm text-[#c4c5d9] whitespace-pre-wrap leading-relaxed">{result.email}</div>
            </div>
          )}
          {tab === 'referral' && result.strategies && (
            <div>
              <h3 className="text-sm font-bold text-[#c4c5d9] mb-3">Referral Strategies for {company}</h3>
              <div className="space-y-2">
                {result.strategies.map((s: any, i: number) => (
                  <div key={i} className="bg-[rgba(255,255,255,0.03)] rounded-2xl p-3"><p className="text-sm font-semibold text-[#c4c5d9]">{s.title}</p><p className="text-xs text-[#8e90a2] mt-1">{s.description}</p></div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
