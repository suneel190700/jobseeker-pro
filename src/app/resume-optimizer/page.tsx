'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload, FileText, Loader2, CheckCircle2, AlertTriangle,
  XCircle, ChevronDown, ChevronUp, Zap, Download, Sparkles,
  AlertCircle, ArrowRight, Target,
} from 'lucide-react';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { toast } from 'sonner';

export default function ResumeOptimizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [useBaseResume, setUseBaseResume] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'bullets' | 'fixes'>('overview');
  const [generating, setGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  const { profile } = useResumeProfile();

  useEffect(() => {
    const jd = sessionStorage.getItem('optimize_jd');
    const title = sessionStorage.getItem('optimize_title');
    if (jd) {
      setJobDescription(jd); sessionStorage.removeItem('optimize_jd');
      if (title) { setJobTitle(title); sessionStorage.removeItem('optimize_title'); }
      if (profile?.text) { setUseBaseResume(true); toast.info('JD loaded. Using your base resume.'); }
      else { toast.info('JD loaded. Upload a resume to analyze.'); }
    }
  }, [profile]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) { setFile(acceptedFiles[0]); setUseBaseResume(false); setAnalysis(null); setError(null); setGeneratedResume(null); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] },
    maxFiles: 1, maxSize: 10 * 1024 * 1024,
  });

  const canAnalyze = (file || useBaseResume) && jobDescription.trim();

  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    setAnalyzing(true); setError(null); setGeneratedResume(null); setActiveTab('overview');
    try {
      let res;
      if (useBaseResume && profile?.text) {
        res = await fetch('/api/resume/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resumeText: profile.text, jobDescription }) });
      } else if (file) {
        const fd = new FormData(); fd.append('resume', file); fd.append('jobDescription', jobDescription);
        res = await fetch('/api/resume/analyze', { method: 'POST', body: fd });
      } else throw new Error('No resume selected');
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Analysis failed'); }
      setAnalysis(await res.json());
    } catch (err: any) { setError(err.message || 'Failed to analyze.'); } finally { setAnalyzing(false); }
  };

  const handleGenerate = async () => {
    const resumeText = useBaseResume ? profile?.text : null;
    if (!resumeText && !file) { setError('No resume available'); return; }
    setGenerating(true); setError(null);
    try {
      let text = resumeText || '';
      if (file && !resumeText) {
        const pf = new FormData(); pf.append('resume', file);
        const pr = await fetch('/api/resume/parse', { method: 'POST', body: pf });
        if (!pr.ok) throw new Error('Failed to parse resume');
        text = (await pr.json()).text;
      }
      const res = await fetch('/api/resume/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resumeText: text, jobDescription, jobTitle }) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Generation failed'); }
      setGeneratedResume((await res.json()).resume);
      toast.success('Optimized resume generated!');
    } catch (err: any) { setError(err.message || 'Failed to generate.'); } finally { setGenerating(false); }
  };

  const handleDownload = async () => {
    if (!generatedResume) return;
    setDownloading(true);
    try {
      const res = await fetch('/api/resume/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resume: generatedResume }) });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = url; a.download = `optimized_resume.docx`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      toast.success('Resume downloaded!');
    } catch (err: any) { setError(err.message); } finally { setDownloading(false); }
  };

  const scoreColor = (s: number, max: number = 100) => {
    const pct = max === 10 ? s * 10 : s;
    if (pct >= 80) return 'text-green-600';
    if (pct >= 60) return 'text-amber-600';
    return 'text-red-600';
  };
  const scoreBg = (s: number, max: number = 100) => {
    const pct = max === 10 ? s * 10 : s;
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Resume Optimizer</h1>
      <p className="mt-1 text-sm text-slate-500">{jobTitle ? `Optimizing for: ${jobTitle}` : 'Get a detailed ATS audit with category scores, priority fixes, and AI-powered rewrite.'}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* Left Panel - Inputs */}
        <div className="lg:col-span-2 space-y-5">
          {profile && (
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-medium text-slate-500 mb-2">Resume Source</p>
              <div className="flex gap-2">
                <button onClick={() => { setUseBaseResume(true); setFile(null); }} className={['flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition flex items-center justify-center gap-1.5', useBaseResume ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'].join(' ')}><Zap className="h-3.5 w-3.5" /> Base Resume</button>
                <button onClick={() => setUseBaseResume(false)} className={['flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition flex items-center justify-center gap-1.5', !useBaseResume ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'].join(' ')}><Upload className="h-3.5 w-3.5" /> Upload</button>
              </div>
              {useBaseResume && <p className="mt-1.5 text-[10px] text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{profile.fileName}</p>}
            </div>
          )}

          {!useBaseResume && (
            <div {...getRootProps()} className={['flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition', isDragActive ? 'border-brand-400 bg-brand-50' : file ? 'border-green-300 bg-green-50' : 'border-slate-300 hover:border-slate-400'].join(' ')}>
              <input {...getInputProps()} />
              {file ? (<><FileText className="h-6 w-6 text-green-600" /><p className="mt-1.5 text-xs font-medium text-green-700">{file.name}</p></>) : (<><Upload className="h-6 w-6 text-slate-400" /><p className="mt-1.5 text-xs text-slate-500">Drop resume or click to browse</p></>)}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Job Description</label>
            <textarea rows={8} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the full job description..." className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>

          <button onClick={handleAnalyze} disabled={!canAnalyze || analyzing} className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
            {analyzing ? (<><Loader2 className="h-4 w-4 animate-spin" />Analyzing (15-20 sec)...</>) : (<><Target className="h-4 w-4" />Run Full ATS Audit</>)}
          </button>

          {/* Generate section */}
          {analysis && (
            <div className="rounded-xl border-2 border-purple-200 bg-purple-50/50 p-4">
              <h3 className="text-sm font-semibold text-purple-800 flex items-center gap-2"><Sparkles className="h-4 w-4" /> AI Resume Rewriter</h3>
              <p className="mt-1 text-xs text-purple-600">Generate a fully tailored resume with all fixes applied. Download as DOCX.</p>
              <div className="mt-3 flex gap-2">
                <button onClick={handleGenerate} disabled={generating} className="flex-1 rounded-lg bg-purple-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
                  {generating ? (<><Loader2 className="h-4 w-4 animate-spin" />Generating...</>) : (<><Sparkles className="h-4 w-4" />Generate</>)}
                </button>
                {generatedResume && (
                  <button onClick={handleDownload} disabled={downloading} className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
                    {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} DOCX
                  </button>
                )}
              </div>
              {generatedResume?.ats_match_summary && (
                <div className="mt-3 rounded-lg bg-white border border-purple-100 p-3">
                  <p className="text-xs font-semibold text-purple-700">ATS Match: {generatedResume.ats_match_summary.estimated_score}/100</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {generatedResume.ats_match_summary.matched_keywords?.slice(0, 10).map((kw: string) => (
                      <span key={kw} className="rounded-full bg-green-50 px-2 py-0.5 text-[9px] text-green-700">{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {error && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600"><XCircle className="h-4 w-4 flex-shrink-0" />{error}</div>}
        </div>

        {/* Right Panel - Results */}
        <div className="lg:col-span-3 rounded-xl border border-slate-200 p-5 min-h-[600px]">
          {!analysis ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              {analyzing ? (<div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-brand-600 mx-auto" /><p className="mt-3 text-sm text-slate-500">Running full ATS audit...</p><p className="mt-1 text-xs text-slate-400">Analyzing keywords, bullets, formatting, and more</p></div>) : 'Upload resume + paste JD to run audit.'}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Score Header */}
              <div className="flex items-center gap-5">
                <div className={['flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold', analysis.overall_score >= 80 ? 'bg-green-50 text-green-600' : analysis.overall_score >= 60 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'].join(' ')}>
                  {analysis.overall_score}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{analysis.score_summary}</p>
                  <p className="text-xs text-red-500 mt-1">{analysis.score_weakness}</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 border-b border-slate-200">
                {[
                  { key: 'overview', label: 'Keywords' },
                  { key: 'categories', label: 'Category Scores' },
                  { key: 'fixes', label: 'Priority Fixes' },
                  { key: 'bullets', label: 'Bullet Rewrites' },
                ].map((tab) => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} className={['px-3 py-2 text-xs font-medium border-b-2 transition', activeTab === tab.key ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-400 hover:text-slate-600'].join(' ')}>
                    {tab.label}
                    {tab.key === 'fixes' && analysis.priority_fixes && <span className="ml-1 text-[9px] bg-red-50 text-red-600 rounded-full px-1.5">{analysis.priority_fixes.length}</span>}
                    {tab.key === 'bullets' && analysis.weak_bullets && <span className="ml-1 text-[9px] bg-amber-50 text-amber-600 rounded-full px-1.5">{analysis.weak_bullets.length}</span>}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="overflow-y-auto max-h-[500px]">
                {activeTab === 'overview' && analysis.keyword_match && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700">Keywords ({analysis.keyword_match.match_percentage}% match)</h3>
                      <div className="mt-1 h-2 rounded-full bg-slate-100"><div className={scoreBg(analysis.keyword_match.match_percentage)} style={{ width: `${analysis.keyword_match.match_percentage}%`, height: '100%', borderRadius: '9999px' }} /></div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-700 mb-1.5">Matched</p>
                      <div className="flex flex-wrap gap-1.5">{analysis.keyword_match.matched?.map((kw: string) => (<span key={kw} className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs text-green-700"><CheckCircle2 className="h-3 w-3" />{kw}</span>))}</div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-red-600 mb-1.5">Missing</p>
                      <div className="flex flex-wrap gap-1.5">{analysis.keyword_match.missing?.map((kw: string) => (<span key={kw} className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-600"><AlertTriangle className="h-3 w-3" />{kw}</span>))}</div>
                    </div>
                    {analysis.keyword_match.partial?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-amber-600 mb-1.5">Partial Match (needs emphasis)</p>
                        <div className="flex flex-wrap gap-1.5">{analysis.keyword_match.partial.map((kw: string) => (<span key={kw} className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-600">{kw}</span>))}</div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'categories' && analysis.category_scores && (
                  <div className="space-y-3">
                    {analysis.category_scores.map((cat: any) => (
                      <div key={cat.category} className="rounded-lg border border-slate-100 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-800">{cat.category}</span>
                          <span className={['text-lg font-bold', scoreColor(cat.score, 10)].join(' ')}>{cat.score}/10</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-slate-100"><div className={scoreBg(cat.score, 10)} style={{ width: `${cat.score * 10}%`, height: '100%', borderRadius: '9999px' }} /></div>
                        <p className="mt-2 text-xs text-slate-500">{cat.explanation}</p>
                        {cat.fixes?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {cat.fixes.map((fix: string, i: number) => (
                              <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600"><ArrowRight className="h-3 w-3 mt-0.5 text-brand-500 flex-shrink-0" />{fix}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'fixes' && analysis.priority_fixes && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500">Top changes ranked by impact — most important first.</p>
                    {analysis.priority_fixes.map((fix: any) => (
                      <div key={fix.rank} className="rounded-lg border border-slate-100 p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-red-600">{fix.rank}</div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800">{fix.section}</p>
                            <p className="text-xs text-slate-600 mt-0.5">{fix.action}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'bullets' && analysis.weak_bullets && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500">Weak bullets with suggested rewrites — no fabricated metrics.</p>
                    {analysis.weak_bullets.map((b: any, i: number) => (
                      <div key={i} className="rounded-lg border border-slate-100 p-3 space-y-2">
                        <div>
                          <p className="text-[10px] font-medium text-red-400 uppercase tracking-wide">Original</p>
                          <p className="text-xs text-slate-600 mt-0.5">{b.original}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium text-green-500 uppercase tracking-wide">Rewritten</p>
                          <p className="text-xs text-slate-800 mt-0.5 font-medium">{b.rewritten}</p>
                        </div>
                        {b.reason && <p className="text-[10px] text-slate-400 italic">{b.reason}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
