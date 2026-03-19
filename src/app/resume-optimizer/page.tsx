'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload, FileText, Loader2, CheckCircle2, AlertTriangle,
  XCircle, ChevronDown, ChevronUp,
} from 'lucide-react';

export default function ResumeOptimizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSuggestions, setExpandedSuggestions] = useState(true);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
      setAnalysis(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleAnalyze = async () => {
    if (!file || !jobDescription.trim()) return;
    setAnalyzing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jobDescription);
      const res = await fetch('/api/resume/analyze', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Analysis failed');
      }
      setAnalysis(await res.json());
    } catch (err: any) {
      setError(err.message || 'Failed to analyze resume.');
    } finally {
      setAnalyzing(false);
    }
  };

  const barColor = (s: number) => s >= 80 ? 'bg-green-500' : s >= 60 ? 'bg-amber-500' : 'bg-red-500';
  const scoreColor = (s: number) => s >= 80 ? 'text-green-600 bg-green-50' : s >= 60 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Resume Optimizer</h1>
      <p className="mt-1 text-sm text-slate-500">Upload your resume and paste a job description to get an ATS score with actionable suggestions.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div {...getRootProps()} className={['flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition', isDragActive ? 'border-brand-400 bg-brand-50' : file ? 'border-green-300 bg-green-50' : 'border-slate-300 hover:border-slate-400'].join(' ')}>
            <input {...getInputProps()} />
            {file ? (
              <><FileText className="h-8 w-8 text-green-600" /><p className="mt-2 text-sm font-medium text-green-700">{file.name}</p><p className="text-xs text-slate-400">Click or drag to replace</p></>
            ) : (
              <><Upload className="h-8 w-8 text-slate-400" /><p className="mt-2 text-sm font-medium text-slate-600">Drop your resume here, or click to browse</p><p className="text-xs text-slate-400">PDF, DOCX, or TXT — up to 10 MB</p></>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Job Description</label>
            <textarea rows={10} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the full job description here..." className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <button onClick={handleAnalyze} disabled={!file || !jobDescription.trim() || analyzing} className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
            {analyzing ? (<><Loader2 className="h-4 w-4 animate-spin" />Analyzing with AI...</>) : 'Analyze Resume'}
          </button>
          {error && <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600"><XCircle className="h-4 w-4 flex-shrink-0" />{error}</div>}
        </div>

        <div className="rounded-xl border border-slate-200 p-6 min-h-[500px]">
          {!analysis ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              {analyzing ? (
                <div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-brand-600 mx-auto" /><p className="mt-3 text-sm text-slate-500">AI is analyzing your resume...</p><p className="mt-1 text-xs text-slate-400">This usually takes 10-15 seconds</p></div>
              ) : 'Upload your resume and paste a job description to see your ATS analysis.'}
            </div>
          ) : (
            <div className="space-y-6 overflow-y-auto max-h-[700px]">
              <div className="text-center">
                <div className={['inline-flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold', scoreColor(analysis.overall_score)].join(' ')}>{analysis.overall_score}</div>
                <p className="mt-2 text-sm text-slate-500">ATS Score</p>
                <p className="text-xs text-slate-400">{analysis.overall_score >= 80 ? 'Great match!' : analysis.overall_score >= 60 ? 'Good start, room for improvement.' : 'Needs work. Follow suggestions below.'}</p>
              </div>

              {analysis.keyword_match && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">Keywords ({analysis.keyword_match.match_percentage}% match)</h3>
                  <div className="mt-1 h-2 rounded-full bg-slate-100"><div className={barColor(analysis.keyword_match.match_percentage)} style={{ width: `${analysis.keyword_match.match_percentage}%`, height: '100%', borderRadius: '9999px' }} /></div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {analysis.keyword_match.matched?.map((kw: string) => (<span key={kw} className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs text-green-700"><CheckCircle2 className="h-3 w-3" /> {kw}</span>))}
                    {analysis.keyword_match.missing?.map((kw: string) => (<span key={kw} className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-600"><AlertTriangle className="h-3 w-3" /> {kw}</span>))}
                  </div>
                </div>
              )}

              {analysis.section_scores && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">Section Scores</h3>
                  <div className="mt-2 space-y-3">
                    {analysis.section_scores.map((s: any) => (
                      <div key={s.section}>
                        <div className="flex justify-between text-xs text-slate-600"><span>{s.section}</span><span className="font-medium">{s.score}/100</span></div>
                        <div className="mt-1 h-2 rounded-full bg-slate-100"><div className={barColor(s.score)} style={{ width: `${s.score}%`, height: '100%', borderRadius: '9999px' }} /></div>
                        <p className="mt-0.5 text-xs text-slate-400">{s.feedback}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.suggestions?.length > 0 && (
                <div>
                  <button onClick={() => setExpandedSuggestions(!expandedSuggestions)} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    Suggestions ({analysis.suggestions.length}) {expandedSuggestions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {expandedSuggestions && (
                    <div className="mt-2 space-y-2">
                      {analysis.suggestions.map((s: any, i: number) => (
                        <div key={i} className={['rounded-lg p-3 text-xs border', s.type === 'critical' ? 'bg-red-50 text-red-700 border-red-100' : s.type === 'important' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-600 border-slate-100'].join(' ')}>
                          <div className="flex items-center gap-2"><span className="font-semibold uppercase text-[10px] tracking-wide">{s.type}</span><span className="text-[10px] opacity-60">{s.category}</span></div>
                          <p className="mt-1">{s.message}</p>
                          {s.suggested && <div className="mt-2 rounded bg-white/50 p-2"><p className="text-[10px] font-medium uppercase tracking-wide opacity-50">Suggested</p><p className="mt-0.5 italic">{s.suggested}</p></div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
