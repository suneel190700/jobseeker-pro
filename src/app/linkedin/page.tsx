'use client';

import { useState } from 'react';
import { Loader2, Linkedin, Copy, CheckCircle, Lightbulb } from 'lucide-react';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { toast } from 'sonner';

export default function LinkedInPage() {
  const { profile, titles } = useResumeProfile();
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState('');

  const handleGenerate = async () => {
    if (!profile?.text) { toast.error('Upload your base resume in Profile first.'); return; }
    setGenerating(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/linkedin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resumeText: profile.text, targetRoles: titles }) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed');
      setResult(await res.json());
      toast.success('LinkedIn content generated!');
    } catch (err: any) { setError(err.message); } finally { setGenerating(false); }
  };

  const copyField = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field); setTimeout(() => setCopiedField(''), 2000);
    toast.success(`${field} copied!`);
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-200">LinkedIn Optimizer</h1>
      <p className="mt-1 text-sm text-slate-500">Generate an optimized headline, about section, and skills list for your LinkedIn profile.</p>

      <div className="mt-8">
        {!profile ? (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-400">Upload your base resume in <a href="/profile" className="font-medium underline">Profile</a> first.</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-green-500/10 border border-green-100 p-3">
              <div className="flex items-center gap-2 text-xs text-green-400"><CheckCircle className="h-4 w-4" /> Using: {profile.fileName}
                {titles.length > 0 && <span className="text-green-400">| Targeting: {titles.join(', ')}</span>}
              </div>
            </div>
            <button onClick={handleGenerate} disabled={generating} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2">
              {generating ? (<><Loader2 className="h-4 w-4 animate-spin" />Generating...</>) : (<><Linkedin className="h-4 w-4" />Generate LinkedIn Content</>)}
            </button>
          </div>
        )}

        {error && <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}

        {result && (
          <div className="mt-8 space-y-6">
            {/* Headline */}
            <div className="rounded-xl border border-white/[0.06] p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-slate-200">Headline</h2>
                <button onClick={() => copyField(result.headline, 'Headline')} className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-400 transition">
                  {copiedField === 'Headline' ? <CheckCircle className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />} Copy
                </button>
              </div>
              <div className="rounded-xl bg-blue-500/10 border border-blue-100 p-4">
                <p className="text-sm font-medium text-blue-900">{result.headline}</p>
              </div>
              <p className="mt-1 text-[10px] text-slate-600">{result.headline?.length || 0}/220 characters</p>
            </div>

            {/* About */}
            <div className="rounded-xl border border-white/[0.06] p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-slate-200">About / Summary</h2>
                <button onClick={() => copyField(result.about, 'About')} className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-400 transition">
                  {copiedField === 'About' ? <CheckCircle className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />} Copy
                </button>
              </div>
              <div className="rounded-xl bg-[rgba(255,255,255,0.02)] border border-white/[0.06] p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{result.about}</div>
              <p className="mt-1 text-[10px] text-slate-600">{result.about?.length || 0}/2000 characters</p>
            </div>

            {/* Skills */}
            <div className="rounded-xl border border-white/[0.06] p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-slate-200">Top Skills</h2>
                <button onClick={() => copyField(result.skills?.join(', ') || '', 'Skills')} className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-400 transition">
                  {copiedField === 'Skills' ? <CheckCircle className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />} Copy
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.skills?.map((s: string) => (<span key={s} className="rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs text-blue-700">{s}</span>))}
              </div>
            </div>

            {/* Tips */}
            {result.tips?.length > 0 && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10/50 p-5">
                <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-500" /> Additional Tips</h2>
                <div className="mt-3 space-y-2">
                  {result.tips.map((tip: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-400"><span className="text-amber-500 font-bold">{i + 1}.</span>{tip}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
