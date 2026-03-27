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
      <h1 className="text-2xl font-bold text-slate-200 tracking-tight">Networking</h1>
      <p className="mt-1 text-sm text-slate-600">Find recruiters, generate outreach emails & discover referral paths</p>

      <div className="mt-5 flex gap-2">
        {[{id:'recruiter' as Tab,label:'Find Recruiter',icon:UserCheck},{id:'email' as Tab,label:'Cold Email',icon:Mail},{id:'referral' as Tab,label:'Referral Tips',icon:Users}].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setResult(null); }} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${tab === t.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs' : 'text-slate-500 hover:bg-[rgba(255,255,255,0.04)] border border-transparent'}`}>
            <t.icon className="h-4 w-4" />{t.label}
          </button>
        ))}
      </div>

      <div className="mt-5 glass p-6">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs font-semibold text-slate-500 mb-1.5">Company</label><input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google, Meta" className="input-dark" /></div>
          <div><label className="block text-xs font-semibold text-slate-500 mb-1.5">Job Title</label><input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. AI Engineer" className="input-dark" /></div>
        </div>
        {tab === 'email' && <div className="mt-4"><label className="block text-xs font-semibold text-slate-500 mb-1.5">Job Description (optional)</label><textarea rows={4} value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste JD for personalized email..." className="input-dark" /></div>}
        <button onClick={tab === 'recruiter' ? findRecruiter : tab === 'email' ? generateEmail : findReferrals} disabled={loading || !company.trim()} className="mt-4 btn-brand px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : tab === 'recruiter' ? <Search className="h-4 w-4" /> : tab === 'email' ? <Mail className="h-4 w-4" /> : <Users className="h-4 w-4" />}
          {loading ? 'Generating...' : tab === 'recruiter' ? 'Find Recruiters' : tab === 'email' ? 'Generate Email' : 'Find Referral Paths'}
        </button>
      </div>

      {result && (
        <div className="mt-5 glass p-6">
          {tab === 'recruiter' && result.recruiters && (
            <div>
              <h3 className="text-sm font-bold text-slate-300 mb-3">Likely Hiring Contacts at {company}</h3>
              <div className="space-y-3">
                {result.recruiters.map((r: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 bg-[rgba(255,255,255,0.02)] rounded-xl p-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/15 flex items-center justify-center"><UserCheck className="h-5 w-5 text-emerald-400" /></div>
                    <div className="flex-1"><p className="text-sm font-semibold text-slate-300">{r.name || r.title}</p><p className="text-xs text-slate-600">{r.role || r.department}</p></div>
                    {r.linkedin_search && <a href={r.linkedin_search} target="_blank" rel="noopener noreferrer" className="badge-dark bg-blue-500/10 text-blue-400 border border-blue-500/20 gap-1 cursor-pointer hover:bg-blue-100"><Linkedin className="h-3 w-3" />Find</a>}
                  </div>
                ))}
              </div>
              {result.tips && <div className="mt-3 bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/10"><p className="text-xs text-emerald-400">{result.tips}</p></div>}
            </div>
          )}
          {tab === 'email' && result.email && (
            <div>
              <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-slate-300">Cold Outreach Email</h3><button onClick={() => copy(result.subject + '\n\n' + result.email)} className="badge-dark bg-[rgba(255,255,255,0.02)] text-slate-400 border border-white/[0.06] gap-1 cursor-pointer hover:bg-[rgba(255,255,255,0.04)]"><Copy className="h-3 w-3" />Copy</button></div>
              {result.subject && <p className="text-xs text-slate-600 mb-2">Subject: <span className="text-slate-400 font-semibold">{result.subject}</span></p>}
              <div className="bg-[rgba(255,255,255,0.02)] rounded-xl p-4 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{result.email}</div>
            </div>
          )}
          {tab === 'referral' && result.strategies && (
            <div>
              <h3 className="text-sm font-bold text-slate-300 mb-3">Referral Strategies for {company}</h3>
              <div className="space-y-2">
                {result.strategies.map((s: any, i: number) => (
                  <div key={i} className="bg-[rgba(255,255,255,0.02)] rounded-xl p-3"><p className="text-sm font-semibold text-slate-300">{s.title}</p><p className="text-xs text-slate-500 mt-1">{s.description}</p></div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
