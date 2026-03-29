'use client';

import { useState, useEffect } from 'react';
import { Loader2, FileSignature, Copy, CheckCircle, Download } from 'lucide-react';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { toast } from 'sonner';

export default function CoverLetterPage() {
  const { profile, details } = useResumeProfile();
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tone, setTone] = useState('professional');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ cover_letter: string; subject_line: string } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto-fill from optimizer or job search
  useEffect(() => {
    const jd = sessionStorage.getItem('cl_jd'); if (jd) { setJobDescription(jd); sessionStorage.removeItem('cl_jd'); }
    const t = sessionStorage.getItem('cl_title'); if (t) { setJobTitle(t); sessionStorage.removeItem('cl_title'); }
    const c = sessionStorage.getItem('cl_company'); if (c) { setCompanyName(c); sessionStorage.removeItem('cl_company'); }
  }, []);

  const handleGenerate = async () => {
    if (!profile?.text) { toast.error('Upload resume in Profile first.'); return; }
    if (!jobDescription.trim()) { toast.error('Paste a job description.'); return; }
    setGenerating(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/cover-letter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resumeText: profile.text, jobDescription, jobTitle, companyName, tone }) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed');
      setResult(await res.json());
      toast.success('Cover letter generated!');
    } catch (err: any) { setError(err.message); } finally { setGenerating(false); }
  };

  const handleCopy = () => { if (result) { navigator.clipboard.writeText(result.cover_letter); setCopied(true); setTimeout(() => setCopied(false), 2000); toast.success('Copied!'); } };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-white/90">Cover Letter Generator</h1>
      <p className="mt-1 text-sm text-white/35">Generate a tailored cover letter for any job.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {!profile && <div className="rounded-2xl bg-[#ff9f0a]/10 border border-[#ff9f0a]/20 p-3 text-sm text-[#ff9f0a]">Upload resume in <a href="/profile" className="font-medium underline">Profile</a> first.</div>}
          {profile && <div className="rounded-2xl bg-green-500/10 border border-green-100 p-3 text-xs text-green-400 flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Using: {profile.fileName}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-white/70 mb-1">Job Title</label><input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. AI Engineer" className="input-hig" /></div>
            <div><label className="block text-xs font-medium text-white/70 mb-1">Company</label><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Google" className="input-hig" /></div>
          </div>
          <div><label className="block text-xs font-medium text-white/70 mb-1">Tone</label>
            <div className="flex gap-2">{[{ v: 'professional', l: 'Professional' }, { v: 'formal', l: 'Formal' }, { v: 'enthusiastic', l: 'Enthusiastic' }].map((t) => (<button key={t.v} onClick={() => setTone(t.v)} className={['rounded-2xl border px-3 py-1.5 text-xs font-medium transition', tone === t.v ? 'border-emerald-500/30 bg-[#30d158]/10 text-[#30d158]' : 'border-[var(--separator)] text-white/35'].join(' ')}>{t.l}</button>))}</div>
          </div>
          <div><label className="block text-xs font-medium text-white/70 mb-1">Job Description</label><textarea rows={10} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste full JD..." className="input-hig" /></div>
          <button onClick={handleGenerate} disabled={generating || !profile || !jobDescription.trim()} className="w-full rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white/90 hover:bg-brand-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
            {generating ? (<><Loader2 className="h-4 w-4 animate-spin" />Generating...</>) : (<><FileSignature className="h-4 w-4" />Generate Cover Letter</>)}
          </button>
          {error && <div className="rounded-2xl bg-[#ff453a]/10 p-3 text-sm text-[#ff453a]">{error}</div>}
        </div>

        <div className="rounded-2xl border border-[var(--separator)] p-6 min-h-[500px]">
          {!result ? (
            <div className="flex h-full items-center justify-center text-sm text-white/25">{generating ? <Loader2 className="h-6 w-6 animate-spin text-[#30d158]" /> : 'Cover letter will appear here.'}</div>
          ) : (
            <div className="space-y-4">
              {result.subject_line && (<div className="rounded-2xl bg-[var(--surface-1)] p-3"><p className="text-[10px] font-medium text-white/25 uppercase">Email Subject</p><p className="text-sm font-medium text-white/70 mt-0.5">{result.subject_line}</p></div>)}
              <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{result.cover_letter}</div>
              <div className="flex gap-2 pt-2 border-t">
                <button onClick={handleCopy} className="flex-1 rounded-2xl border border-[var(--separator)] px-4 py-2 text-sm font-medium text-white/50 hover:bg-[var(--surface-1)] transition flex items-center justify-center gap-2">
                  {copied ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
