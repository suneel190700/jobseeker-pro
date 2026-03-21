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
      <h1 className="text-2xl font-bold text-white">Cover Letter Generator</h1>
      <p className="mt-1 text-sm text-zinc-400">Generate a tailored cover letter for any job.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {!profile && <div className="rounded-lg bg-amber-900/20 border border-amber-800/30 p-3 text-sm text-amber-400">Upload resume in <a href="/profile" className="font-medium underline">Profile</a> first.</div>}
          {profile && <div className="rounded-lg bg-green-900/20 border border-green-800/30 p-3 text-xs text-green-400 flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Using: {profile.fileName}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-zinc-300 mb-1">Job Title</label><input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. AI Engineer" className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-indigo-500/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/30" /></div>
            <div><label className="block text-xs font-medium text-zinc-300 mb-1">Company</label><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Google" className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-indigo-500/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/30" /></div>
          </div>
          <div><label className="block text-xs font-medium text-zinc-300 mb-1">Tone</label>
            <div className="flex gap-2">{[{ v: 'professional', l: 'Professional' }, { v: 'formal', l: 'Formal' }, { v: 'enthusiastic', l: 'Enthusiastic' }].map((t) => (<button key={t.v} onClick={() => setTone(t.v)} className={['rounded-lg border px-3 py-1.5 text-xs font-medium transition', tone === t.v ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400' : 'border-zinc-800 text-zinc-400'].join(' ')}>{t.l}</button>))}</div>
          </div>
          <div><label className="block text-xs font-medium text-zinc-300 mb-1">Job Description</label><textarea rows={10} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste full JD..." className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white focus:border-indigo-500/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/30" /></div>
          <button onClick={handleGenerate} disabled={generating || !profile || !jobDescription.trim()} className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition flex items-center justify-center gap-2">
            {generating ? (<><Loader2 className="h-4 w-4 animate-spin" />Generating...</>) : (<><FileSignature className="h-4 w-4" />Generate Cover Letter</>)}
          </button>
          {error && <div className="rounded-lg bg-red-900/20 p-3 text-sm text-red-400">{error}</div>}
        </div>

        <div className="rounded-xl border border-zinc-800 p-6 min-h-[500px]">
          {!result ? (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">{generating ? <Loader2 className="h-6 w-6 animate-spin text-indigo-400" /> : 'Cover letter will appear here.'}</div>
          ) : (
            <div className="space-y-4">
              {result.subject_line && (<div className="rounded-lg bg-zinc-900 p-3"><p className="text-[10px] font-medium text-zinc-500 uppercase">Email Subject</p><p className="text-sm font-medium text-zinc-200 mt-0.5">{result.subject_line}</p></div>)}
              <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{result.cover_letter}</div>
              <div className="flex gap-2 pt-2 border-t">
                <button onClick={handleCopy} className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900 transition flex items-center justify-center gap-2">
                  {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
