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
      <h1 className="text-2xl font-bold text-white/90">LinkedIn Optimizer</h1>
      <p className="mt-1 text-sm text-white/35">Generate an optimized headline, about section, and skills list for your LinkedIn profile.</p>

      <div className="mt-8">
        {!profile ? (
          <div className="rounded-2xl bg-[#ff9f0a]/10 border border-[#ff9f0a]/20 p-4 text-sm text-[#ff9f0a]">Upload your base resume in <a href="/profile" className="font-medium underline">Profile</a> first.</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-[var(--radius-lg)] bg-[var(--success)]/10 border border-[var(--success)]/25 p-3">
              <div className="flex items-center gap-2 text-xs text-green-400"><CheckCircle className="h-4 w-4" /> Using: {profile.fileName}
                {titles.length > 0 && <span className="text-green-400">| Targeting: {titles.join(', ')}</span>}
              </div>
            </div>
            <button onClick={handleGenerate} disabled={generating} className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2">
              {generating ? (<><Loader2 className="h-4 w-4 animate-spin" />Generating...</>) : (<><Linkedin className="h-4 w-4" />Generate LinkedIn Content</>)}
            </button>
          </div>
        )}

        {error && <div className="mt-4 rounded-2xl bg-[#ff453a]/10 p-3 text-sm text-[#ff453a]">{error}</div>}

        {result && (
          <div className="mt-8 space-y-6">
            {/* Headline */}
            <div className="rounded-2xl border border-[var(--separator)] p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-white/90">Headline</h2>
                <button onClick={() => copyField(result.headline, 'Headline')} className="flex items-center gap-1 text-xs text-white/25 hover:text-white/50 transition">
                  {copiedField === 'Headline' ? <CheckCircle className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />} Copy
                </button>
              </div>
              <div className="rounded-[var(--radius-lg)] bg-[rgba(96,165,250,0.1)] border border-[var(--info)]/25 p-4">
                <p className="text-sm font-medium text-blue-900">{result.headline}</p>
              </div>
              <p className="mt-1 text-[10px] text-white/25">{result.headline?.length || 0}/220 characters</p>
            </div>

            {/* About */}
            <div className="rounded-2xl border border-[var(--separator)] p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-white/90">About / Summary</h2>
                <button onClick={() => copyField(result.about, 'About')} className="flex items-center gap-1 text-xs text-white/25 hover:text-white/50 transition">
                  {copiedField === 'About' ? <CheckCircle className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />} Copy
                </button>
              </div>
              <div className="rounded-2xl bg-[var(--surface-1)] border border-[var(--separator)] p-4 text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{result.about}</div>
              <p className="mt-1 text-[10px] text-white/25">{result.about?.length || 0}/2000 characters</p>
            </div>

            {/* Skills */}
            <div className="rounded-2xl border border-[var(--separator)] p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-white/90">Top Skills</h2>
                <button onClick={() => copyField(result.skills?.join(', ') || '', 'Skills')} className="flex items-center gap-1 text-xs text-white/25 hover:text-white/50 transition">
                  {copiedField === 'Skills' ? <CheckCircle className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />} Copy
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.skills?.map((s: string) => (<span key={s} className="rounded-full bg-[#0a84ff]/10 border border-[#0a84ff]/20 px-3 py-1 text-xs text-blue-700">{s}</span>))}
              </div>
            </div>

            {/* Tips */}
            {result.tips?.length > 0 && (
              <div className="rounded-2xl border border-[#ff9f0a]/20 bg-[#ff9f0a]/10/50 p-5">
                <h2 className="text-base font-semibold text-white/90 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-500" /> Additional Tips</h2>
                <div className="mt-3 space-y-2">
                  {result.tips.map((tip: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-white/50"><span className="text-amber-500 font-bold">{i + 1}.</span>{tip}</div>
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
