'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, Zap, Download, Sparkles, Target, ArrowRight, TrendingUp, FileSignature } from 'lucide-react';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ResumeOptimizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [useBaseResume, setUseBaseResume] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [generating, setGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'docx' | 'pdf'>('docx');
  const [newScore, setNewScore] = useState<number | null>(null);

  const { profile } = useResumeProfile();
  const router = useRouter();

  useEffect(() => {
    const jd = sessionStorage.getItem('optimize_jd');
    const title = sessionStorage.getItem('optimize_title');
    const company = sessionStorage.getItem('optimize_company');
    const cachedAnalysis = sessionStorage.getItem('optimize_cached_analysis');
    if (jd) { setJobDescription(jd); sessionStorage.removeItem('optimize_jd'); if (title) { setJobTitle(title); sessionStorage.removeItem('optimize_title'); } if (company) { setCompanyName(company); sessionStorage.removeItem('optimize_company'); } if (profile?.text) setUseBaseResume(true);
      if (cachedAnalysis) { try { setAnalysis(JSON.parse(cachedAnalysis)); sessionStorage.removeItem('optimize_cached_analysis'); toast.info('Score loaded — skip to Generate.'); } catch {} }
    }
    sessionStorage.removeItem('optimize_cached_score');
  }, [profile]);

  const onDrop = useCallback((acceptedFiles: File[]) => { if (acceptedFiles[0]) { setFile(acceptedFiles[0]); setUseBaseResume(false); setAnalysis(null); setError(null); setGeneratedResume(null); setNewScore(null); } }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] }, maxFiles: 1, maxSize: 10 * 1024 * 1024 });
  const canAnalyze = (file || useBaseResume) && jobDescription.trim();

  const getResumeText = async (): Promise<string> => {
    if (useBaseResume && profile?.text) return profile.text;
    if (file) { const fd = new FormData(); fd.append('resume', file); const r = await fetch('/api/resume/parse', { method: 'POST', body: fd }); if (!r.ok) throw new Error('Parse failed'); return (await r.json()).text; }
    throw new Error('No resume');
  };

  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    setAnalyzing(true); setError(null); setGeneratedResume(null); setNewScore(null); setActiveTab('overview');
    try {
      let res;
      if (useBaseResume && profile?.text) res = await fetch('/api/resume/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resumeText: profile.text, jobDescription }) });
      else if (file) { const fd = new FormData(); fd.append('resume', file); fd.append('jobDescription', jobDescription); res = await fetch('/api/resume/analyze', { method: 'POST', body: fd }); }
      else throw new Error('No resume');
      if (!res!.ok) throw new Error((await res!.json().catch(() => ({}))).error || 'Failed');
      setAnalysis(await res!.json());
    } catch (err: any) { setError(err.message); } finally { setAnalyzing(false); }
  };

  const handleGenerate = async () => {
    setGenerating(true); setError(null); setNewScore(null);
    try {
      const text = await getResumeText();
      const res = await fetch('/api/resume/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resumeText: text, jobDescription, jobTitle }) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed');
      const data = await res.json();
      setGeneratedResume(data.resume);
      // Algorithmic score for new resume (free)
      const resumeFlat = [data.resume.name, data.resume.summary, (data.resume.skills||[]).join(', '), ...(data.resume.experience||[]).flatMap((e:any) => [e.title, ...(e.bullets||[])]), ...(data.resume.education||[]).map((e:any) => e.degree)].filter(Boolean).join('\n');
      try { const sr = await fetch('/api/resume/score-algorithmic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resumeText: resumeFlat, jobDescription }) }); if (sr.ok) setNewScore((await sr.json()).overall_score); } catch {}
      toast.success('Optimized resume generated!');
    } catch (err: any) { setError(err.message); } finally { setGenerating(false); }
  };

  const handleDownload = async (format: 'docx' | 'pdf') => {
    if (!generatedResume) return;
    setDownloading(true); setDownloadFormat(format);
    try {
      const endpoint = format === 'pdf' ? '/api/resume/download?format=pdf' : '/api/resume/download';
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resume: generatedResume }) });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob(); const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `optimized_resume.${format}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} downloaded!`);
    } catch (err: any) { setError(err.message); } finally { setDownloading(false); }
  };

  const goToCoverLetter = () => {
    sessionStorage.setItem('cl_jd', jobDescription);
    sessionStorage.setItem('cl_title', jobTitle);
    sessionStorage.setItem('cl_company', companyName);
    router.push('/cover-letter');
  };

  const barColor = (s: number, max: number = 100) => { const p = max === 10 ? s*10 : s; return p >= 80 ? 'bg-green-500' : p >= 60 ? 'bg-amber-500' : 'bg-red-500'; };
  const scoreColor = (s: number) => s >= 80 ? 'text-green-600 bg-green-50' : s >= 60 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Resume Optimizer</h1>
      <p className="mt-1 text-sm text-slate-500">{jobTitle ? `Optimizing for: ${jobTitle}` : 'ATS audit + AI rewrite + download.'}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
          {profile && (
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-medium text-slate-500 mb-2">Resume Source</p>
              <div className="flex gap-2">
                <button onClick={() => { setUseBaseResume(true); setFile(null); }} className={['flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition flex items-center justify-center gap-1.5', useBaseResume ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500'].join(' ')}><Zap className="h-3.5 w-3.5" /> Base Resume</button>
                <button onClick={() => setUseBaseResume(false)} className={['flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition flex items-center justify-center gap-1.5', !useBaseResume ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500'].join(' ')}><Upload className="h-3.5 w-3.5" /> Upload</button>
              </div>
              {useBaseResume && <p className="mt-1.5 text-[10px] text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{profile.fileName}</p>}
            </div>
          )}
          {!useBaseResume && (
            <div {...getRootProps()} className={['flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition', isDragActive ? 'border-brand-400 bg-brand-50' : file ? 'border-green-300 bg-green-50' : 'border-slate-300'].join(' ')}>
              <input {...getInputProps()} />
              {file ? (<><FileText className="h-6 w-6 text-green-600" /><p className="mt-1 text-xs font-medium text-green-700">{file.name}</p></>) : (<><Upload className="h-6 w-6 text-slate-400" /><p className="mt-1 text-xs text-slate-500">Drop resume</p></>)}
            </div>
          )}
          <div><label className="block text-xs font-medium text-slate-700 mb-1">Job Description</label><textarea rows={6} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste full JD..." className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>

          <button onClick={handleAnalyze} disabled={!canAnalyze || analyzing} className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
            {analyzing ? (<><Loader2 className="h-4 w-4 animate-spin" />Analyzing...</>) : (<><Target className="h-4 w-4" />{analysis ? 'Re-run Audit' : 'Run Full ATS Audit'}</>)}
          </button>

          {/* Generate + Download */}
          {(analysis || canAnalyze) && (
            <div className="rounded-xl border-2 border-purple-200 bg-purple-50/50 p-4 space-y-3">
              <div><h3 className="text-sm font-semibold text-purple-800 flex items-center gap-2"><Sparkles className="h-4 w-4" /> AI Resume Rewriter</h3><p className="mt-0.5 text-xs text-purple-600">Generate optimized resume. Download as DOCX or PDF.</p></div>
              <button onClick={handleGenerate} disabled={generating || !canAnalyze} className="w-full rounded-lg bg-purple-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
                {generating ? (<><Loader2 className="h-4 w-4 animate-spin" />Generating...</>) : (<><Sparkles className="h-4 w-4" />{analysis ? 'Generate Optimized Resume' : 'Skip Audit — Generate Resume'}</>)}
              </button>

              {generatedResume && (
                <>
                  {/* Before/After Score */}
                  {(analysis?.overall_score || newScore) && (
                    <div className="rounded-lg bg-white border border-purple-100 p-3 flex items-center gap-3">
                      {analysis?.overall_score && <div className="text-center"><p className="text-[10px] text-slate-400">Before</p><p className={['text-lg font-bold', analysis.overall_score >= 60 ? 'text-amber-600' : 'text-red-600'].join(' ')}>{analysis.overall_score}</p></div>}
                      {analysis?.overall_score && newScore && <TrendingUp className="h-5 w-5 text-green-500" />}
                      {newScore && <div className="text-center"><p className="text-[10px] text-slate-400">After</p><p className="text-lg font-bold text-green-600">{newScore}</p></div>}
                      {analysis?.overall_score && newScore && <span className="ml-auto rounded-full bg-green-50 px-2 py-0.5 text-xs font-bold text-green-700">+{newScore - analysis.overall_score}</span>}
                    </div>
                  )}

                  {/* Download Buttons */}
                  <div className="flex gap-2">
                    <button onClick={() => handleDownload('docx')} disabled={downloading} className="flex-1 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
                      {downloading && downloadFormat === 'docx' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} DOCX
                    </button>
                    <button onClick={() => handleDownload('pdf')} disabled={downloading} className="flex-1 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2">
                      {downloading && downloadFormat === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} PDF
                    </button>
                  </div>

                  {/* Cover Letter Button */}
                  <button onClick={goToCoverLetter} className="w-full rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-100 transition flex items-center justify-center gap-2">
                    <FileSignature className="h-4 w-4" /> Generate Cover Letter
                  </button>

                  {/* Preview */}
                  <div className="rounded-lg bg-white border border-purple-100 p-3 max-h-48 overflow-y-auto">
                    <p className="text-[10px] font-medium text-purple-400 uppercase mb-1">Preview</p>
                    <p className="text-sm font-bold text-slate-900">{generatedResume.name}</p>
                    {generatedResume.summary && <p className="text-xs text-slate-600 mt-1 line-clamp-3">{generatedResume.summary}</p>}
                    {generatedResume.skills && <div className="mt-2 flex flex-wrap gap-1">{generatedResume.skills.slice(0, 12).map((s: string) => (<span key={s} className="rounded-full bg-purple-50 px-2 py-0.5 text-[9px] text-purple-700">{s}</span>))}</div>}
                  </div>
                </>
              )}
            </div>
          )}

          {error && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600"><XCircle className="h-4 w-4" />{error}</div>}
        </div>

        {/* Right - Analysis Results */}
        <div className="lg:col-span-3 rounded-xl border border-slate-200 p-5 min-h-[600px]">
          {!analysis ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              {analyzing ? (<div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-brand-600 mx-auto" /><p className="mt-3">Running ATS audit...</p></div>) : 'Run audit or generate directly.'}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-5">
                <div className={['flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold', scoreColor(analysis.overall_score)].join(' ')}>{analysis.overall_score}</div>
                <div className="flex-1"><p className="text-sm font-medium text-slate-900">{analysis.score_summary}</p><p className="text-xs text-red-500 mt-1">{analysis.score_weakness}</p></div>
              </div>
              <div className="flex gap-1 border-b border-slate-200">
                {[{ key: 'overview', label: 'Keywords' }, { key: 'categories', label: 'Scores' }, { key: 'fixes', label: 'Fixes', c: analysis.priority_fixes?.length }, { key: 'bullets', label: 'Rewrites', c: analysis.weak_bullets?.length }].map((t: any) => (
                  <button key={t.key} onClick={() => setActiveTab(t.key)} className={['px-3 py-2 text-xs font-medium border-b-2 transition', activeTab === t.key ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-400'].join(' ')}>{t.label}{t.c ? <span className="ml-1 text-[9px] bg-red-50 text-red-600 rounded-full px-1.5">{t.c}</span> : null}</button>
                ))}
              </div>
              <div className="overflow-y-auto max-h-[500px]">
                {activeTab === 'overview' && analysis.keyword_match && (
                  <div className="space-y-4">
                    <div><h3 className="text-sm font-semibold text-slate-700">Keywords ({analysis.keyword_match.match_percentage}%)</h3><div className="mt-1 h-2 rounded-full bg-slate-100"><div className={barColor(analysis.keyword_match.match_percentage)} style={{ width: `${analysis.keyword_match.match_percentage}%`, height: '100%', borderRadius: '9999px' }} /></div></div>
                    <div><p className="text-xs font-medium text-green-700 mb-1">Matched</p><div className="flex flex-wrap gap-1.5">{analysis.keyword_match.matched?.map((k: string) => (<span key={k} className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs text-green-700"><CheckCircle2 className="h-3 w-3" />{k}</span>))}</div></div>
                    <div><p className="text-xs font-medium text-red-600 mb-1">Missing</p><div className="flex flex-wrap gap-1.5">{analysis.keyword_match.missing?.map((k: string) => (<span key={k} className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-600"><AlertTriangle className="h-3 w-3" />{k}</span>))}</div></div>
                    {analysis.keyword_match.partial?.length > 0 && (<div><p className="text-xs font-medium text-amber-600 mb-1">Partial</p><div className="flex flex-wrap gap-1.5">{analysis.keyword_match.partial.map((k: string) => (<span key={k} className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-600">{k}</span>))}</div></div>)}
                  </div>
                )}
                {activeTab === 'categories' && analysis.category_scores && (
                  <div className="space-y-3">{analysis.category_scores.map((c: any) => (<div key={c.category} className="rounded-lg border border-slate-100 p-3"><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-800">{c.category}</span><span className={['text-lg font-bold', c.score >= 8 ? 'text-green-600' : c.score >= 6 ? 'text-amber-600' : 'text-red-600'].join(' ')}>{c.score}/10</span></div><div className="mt-1 h-1.5 rounded-full bg-slate-100"><div className={barColor(c.score, 10)} style={{ width: `${c.score*10}%`, height: '100%', borderRadius: '9999px' }} /></div><p className="mt-2 text-xs text-slate-500">{c.explanation}</p>{c.fixes?.map((f: string, i: number) => (<div key={i} className="flex items-start gap-1.5 text-xs text-slate-600 mt-1"><ArrowRight className="h-3 w-3 mt-0.5 text-brand-500 flex-shrink-0" />{f}</div>))}</div>))}</div>
                )}
                {activeTab === 'fixes' && analysis.priority_fixes && (<div className="space-y-3">{analysis.priority_fixes.map((f: any) => (<div key={f.rank} className="rounded-lg border border-slate-100 p-3 flex items-start gap-3"><div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-red-600">{f.rank}</div><div><p className="text-xs font-semibold text-slate-800">{f.section}</p><p className="text-xs text-slate-600 mt-0.5">{f.action}</p></div></div>))}</div>)}
                {activeTab === 'bullets' && analysis.weak_bullets && (<div className="space-y-3">{analysis.weak_bullets.map((b: any, i: number) => (<div key={i} className="rounded-lg border border-slate-100 p-3 space-y-2"><div><p className="text-[10px] font-medium text-red-400 uppercase">Original</p><p className="text-xs text-slate-600 mt-0.5">{b.original}</p></div><div><p className="text-[10px] font-medium text-green-500 uppercase">Rewritten</p><p className="text-xs text-slate-800 mt-0.5 font-medium">{b.rewritten}</p></div>{b.reason && <p className="text-[10px] text-slate-400 italic">{b.reason}</p>}</div>))}</div>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
