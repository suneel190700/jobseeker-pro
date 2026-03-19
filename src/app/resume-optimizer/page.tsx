'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ResumeOptimizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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

      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Analysis failed');

      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      setError('Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Resume Optimizer</h1>
      <p className="mt-1 text-sm text-slate-500">
        Upload your resume and paste a job description to get an ATS score with actionable suggestions.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Left: Upload + JD */}
        <div className="space-y-6">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition',
              isDragActive
                ? 'border-brand-400 bg-brand-50'
                : file
                  ? 'border-green-300 bg-green-50'
                  : 'border-slate-300 hover:border-slate-400'
            )}
          >
            <input {...getInputProps()} />
            {file ? (
              <>
                <FileText className="h-8 w-8 text-green-600" />
                <p className="mt-2 text-sm font-medium text-green-700">
                  {file.name}
                </p>
                <p className="text-xs text-slate-400">
                  Click or drag to replace
                </p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-slate-400" />
                <p className="mt-2 text-sm font-medium text-slate-600">
                  Drop your resume here, or click to browse
                </p>
                <p className="text-xs text-slate-400">
                  PDF, DOCX, or TXT — up to 10 MB
                </p>
              </>
            )}
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Job Description
            </label>
            <textarea
              rows={10}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!file || !jobDescription.trim() || analyzing}
            className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Resume'
            )}
          </button>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Right: Results */}
        <div className="rounded-xl border border-slate-200 p-6">
          {!analysis ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Upload your resume and paste a job description to see your ATS analysis.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="text-center">
                <div
                  className={cn(
                    'inline-flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold',
                    analysis.overall_score >= 80
                      ? 'bg-green-50 text-green-600'
                      : analysis.overall_score >= 60
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-red-50 text-red-600'
                  )}
                >
                  {analysis.overall_score}
                </div>
                <p className="mt-2 text-sm text-slate-500">ATS Score</p>
              </div>

              {/* Keyword Match */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700">
                  Keywords ({analysis.keyword_match?.match_percentage}% match)
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {analysis.keyword_match?.matched?.map((kw: string) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs text-green-700"
                    >
                      <CheckCircle2 className="h-3 w-3" /> {kw}
                    </span>
                  ))}
                  {analysis.keyword_match?.missing?.map((kw: string) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-600"
                    >
                      <AlertTriangle className="h-3 w-3" /> {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Section Scores */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700">
                  Section Scores
                </h3>
                <div className="mt-2 space-y-2">
                  {analysis.section_scores?.map((s: any) => (
                    <div key={s.section}>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>{s.section}</span>
                        <span>{s.score}/100</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-slate-100">
                        <div
                          className={cn(
                            'h-2 rounded-full',
                            s.score >= 80
                              ? 'bg-green-500'
                              : s.score >= 60
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                          )}
                          style={{ width: `${s.score}%` }}
                        />
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {s.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700">
                  Suggestions
                </h3>
                <div className="mt-2 space-y-2">
                  {analysis.suggestions?.map((s: any, i: number) => (
                    <div
                      key={i}
                      className={cn(
                        'rounded-lg p-3 text-xs',
                        s.type === 'critical'
                          ? 'bg-red-50 text-red-700'
                          : s.type === 'important'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-50 text-slate-600'
                      )}
                    >
                      <span className="font-semibold uppercase">
                        {s.type}
                      </span>{' '}
                      — {s.message}
                      {s.suggested && (
                        <p className="mt-1 text-xs italic">
                          Suggested: &quot;{s.suggested}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
