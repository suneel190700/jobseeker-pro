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
      <h1 className="text-2xl font-bold text-slate-900">LinkedIn Optimizer</h1>
      <p className="mt-1 text-sm text-slate-500">Generate an optimized headline, about section, and skills list for your LinkedIn profile.</p>

      <div className="mt-8">
        {!profile ? (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">Upload your base resume in <a href="/profile" className="font-medium underline">Profile</a> first.</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-100 p-3">
              <div className="flex items-center gap-2 text-xs text-green-700"><CheckCircle className="h-4 w-4" /> Using: {profile.fileName}
                {titles.length > 0 && <span className="text-green-500">| Targeting: {titles.join(', ')}</span>}
              </div>
            </div>
            <button onClick={handleGenerate} disabled={generating} className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2">
              {generating ? (<><Loader2 className="h-4 w-4 animate-spin" />Generating...</>) : (<><Linkedin className="h-4 w-4" />Generate LinkedIn Content</>)}
            </button>
          </div>
        )}

        {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        {result && (
          <div className="mt-8 space-y-6">
            {/* Headline */}
            <div className="rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-slate-900">Headline</h2>
                <button onClick={() => copyField(result.headline, 'Headline')} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition">
                  {copiedField === 'Headline' ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />} Copy
                </button>
              </div>
              <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
                <p className="text-sm font-medium text-blue-900">{result.headline}</p>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">{result.headline?.length || 0}/220 characters</p>
            </div>

            {/* About */}
            <div className="rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-slate-900">About / Summary</h2>
                <button onClick={() => copyField(result.about, 'About')} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition">
                  {copiedField === 'About' ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />} Copy
                </button>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{result.about}</div>
              <p className="mt-1 text-[10px] text-slate-400">{result.about?.length || 0}/2000 characters</p>
            </div>

            {/* Skills */}
            <div className="rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-slate-900">Top Skills</h2>
                <button onClick={() => copyField(result.skills?.join(', ') || '', 'Skills')} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition">
                  {copiedField === 'Skills' ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />} Copy
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.skills?.map((s: string) => (<span key={s} className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs text-blue-700">{s}</span>))}
              </div>
            </div>

            {/* Tips */}
            {result.tips?.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-500" /> Additional Tips</h2>
                <div className="mt-3 space-y-2">
                  {result.tips.map((tip: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-600"><span className="text-amber-500 font-bold">{i + 1}.</span>{tip}</div>
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
