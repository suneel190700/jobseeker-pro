'use client';

import { useState, useEffect } from 'react';
import {
  Search, MapPin, Loader2, Bookmark, BookmarkCheck,
  ExternalLink, Building2, Clock, DollarSign, Briefcase,
  CheckCircle, Zap, AlertCircle, Target,
} from 'lucide-react';
import { useTracker } from '@/hooks/useTracker';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { getCachedScores, setCachedScore } from '@/lib/db';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Job {
  id: string; title: string; company: string; location: string;
  remote_type: string; description: string;
  salary_min: number | null; salary_max: number | null;
  posted_date: string; source_url: string; employment_type: string;
}

interface ScoreData { score: number; reason: string; }

export default function JobsPage() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [datePosted, setDatePosted] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [error, setError] = useState('');
  const [scores, setScores] = useState<Record<string, ScoreData>>({});
  const [scoringId, setScoringId] = useState<string | null>(null);

  const tracker = useTracker();
  const { profile } = useResumeProfile();
  const router = useRouter();

  // Load cached scores on mount
  useEffect(() => {
    setScores(getCachedScores());
  }, []);

  // Persist search state to sessionStorage so back button works
  useEffect(() => {
    if (jobs.length > 0) {
      sessionStorage.setItem('jobseeker_search_results', JSON.stringify({ query, location, remoteOnly, datePosted, jobs }));
    }
  }, [jobs, query, location, remoteOnly, datePosted]);

  // Restore search state on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('jobseeker_search_results');
      if (saved) {
        const { query: q, location: l, remoteOnly: r, datePosted: d, jobs: j } = JSON.parse(saved);
        setQuery(q); setLocation(l); setRemoteOnly(r); setDatePosted(d); setJobs(j); setSearched(true);
      }
    } catch {}
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setSearched(true); setError(''); setSelectedJob(null);
    try {
      const params = new URLSearchParams({ query });
      if (location) params.set('location', location);
      if (remoteOnly) params.set('remote', 'true');
      if (datePosted) params.set('date_posted', datePosted);
      const res = await fetch(`/api/jobs/search?${params}`);
      const data = await res.json();
      if (data.error) { setError(data.error); setJobs([]); }
      else setJobs(data.jobs || []);
    } catch {
      setError('Failed to search jobs.'); setJobs([]);
    } finally { setLoading(false); }
  };

  const scoreJob = async (job: Job) => {
    if (!profile?.text) { toast.error('Upload your base resume first', { action: { label: 'Go to Profile', onClick: () => router.push('/profile') } }); return; }
    setScoringId(job.id);
    try {
      const res = await fetch('/api/resume/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: profile.text, jobDescription: job.description }),
      });
      if (!res.ok) throw new Error('Scoring failed');
      const data = await res.json();
      const scoreData: ScoreData = {
        score: data.overall_score,
        reason: data.score_summary || `ATS Score: ${data.overall_score}/100`,
      };
      setScores((prev) => ({ ...prev, [job.id]: scoreData }));
      setCachedScore(job.id, scoreData.score, scoreData.reason);
      toast.success(`Score: ${scoreData.score}/100`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to score');
    } finally { setScoringId(null); }
  };

  const toggleSave = (job: Job) => {
    const isSaved = tracker.cards.some((c) => c.url === job.source_url);
    if (isSaved) { tracker.unsaveJob(job.source_url); toast('Removed from tracker'); }
    else {
      const jobScore = scores[job.id];
      tracker.saveJob({
        title: job.title, company: job.company, url: job.source_url,
        location: job.location, salary: formatSalary(job.salary_min, job.salary_max) || undefined,
        match_score: jobScore?.score, match_reason: jobScore?.reason,
      });
      toast.success('Saved to tracker!', { action: { label: 'View', onClick: () => router.push('/tracker') } });
    }
  };

  const optimizeForJob = (job: Job) => {
    sessionStorage.setItem('optimize_jd', job.description);
    sessionStorage.setItem('optimize_title', `${job.title} at ${job.company}`);
    router.push('/resume-optimizer');
  };

  const isJobSaved = (job: Job) => tracker.cards.some((c) => c.url === job.source_url);

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`; return `Up to ${fmt(max!)}`;
  };

  const timeAgo = (date: string) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (days === 0) return 'Today'; if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`; if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 60) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Search</h1>
          <p className="mt-1 text-sm text-slate-500">Find jobs and score them against your resume.</p>
        </div>
        <div className="flex items-center gap-2">
          {!profile && (
            <a href="/profile" className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100 transition">
              <AlertCircle className="h-3.5 w-3.5" /> Upload resume for scoring
            </a>
          )}
          {tracker.cards.length > 0 && (
            <a href="/tracker" className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700 hover:bg-brand-100 transition">
              <BookmarkCheck className="h-3.5 w-3.5" /> {tracker.cards.length} saved
            </a>
          )}
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mt-6 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Job title, keywords, or company" className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div className="relative min-w-[180px]">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, state, or remote" className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <button type="submit" disabled={loading || !query.trim()} className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition flex items-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Search
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} className="rounded" /> Remote only
          </label>
          <select value={datePosted} onChange={(e) => setDatePosted(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600">
            <option value="">Any time</option><option value="today">Today</option><option value="3days">Last 3 days</option><option value="week">This week</option><option value="month">This month</option>
          </select>
        </div>
      </form>

      {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <div className="mt-6 flex gap-6">
        <div className="flex-1 space-y-3">
          {loading && <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-brand-600" /></div>}
          {!loading && searched && jobs.length === 0 && !error && (
            <div className="text-center py-16 text-sm text-slate-400">No jobs found.</div>
          )}
          {!loading && jobs.map((job) => {
            const saved = isJobSaved(job);
            const jobScore = scores[job.id];
            const isScoring = scoringId === job.id;
            return (
              <div key={job.id} onClick={() => setSelectedJob(job)}
                className={['rounded-xl border p-4 cursor-pointer transition', selectedJob?.id === job.id ? 'border-brand-300 bg-brand-50/30 shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'].join(' ')}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">{job.title}</h3>
                      {saved && <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />}
                      {jobScore && (
                        <span className={['inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border', getScoreColor(jobScore.score)].join(' ')}>
                          {jobScore.score}% ATS
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 flex items-center gap-1 mt-0.5"><Building2 className="h-3 w-3" /> {job.company}</p>
                    {jobScore && <p className="text-xs text-slate-400 mt-1 italic">{jobScore.reason}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                      {job.remote_type === 'remote' && <span className="rounded-full bg-green-50 px-2 py-0.5 text-green-600 font-medium">Remote</span>}
                      {formatSalary(job.salary_min, job.salary_max) && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {formatSalary(job.salary_min, job.salary_max)}</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(job.posted_date)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 ml-2">
                    <button onClick={(e) => { e.stopPropagation(); toggleSave(job); }} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 transition">
                      {saved ? <BookmarkCheck className="h-5 w-5 text-brand-600" /> : <Bookmark className="h-5 w-5" />}
                    </button>
                    {!jobScore && profile && (
                      <button onClick={(e) => { e.stopPropagation(); scoreJob(job); }} disabled={isScoring}
                        className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-50 hover:text-brand-600 transition disabled:opacity-50">
                        {isScoring ? <Loader2 className="h-3 w-3 animate-spin" /> : <Target className="h-3 w-3" />}
                        {isScoring ? 'Scoring...' : 'Get Score'}
                      </button>
                    )}
                    {profile && (
                      <button onClick={(e) => { e.stopPropagation(); optimizeForJob(job); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 transition" title="Optimize resume">
                        <Zap className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        {selectedJob && (
          <div className="hidden lg:block w-[400px] flex-shrink-0">
            <div className="sticky top-0 rounded-xl border border-slate-200 p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <h2 className="text-lg font-bold text-slate-900">{selectedJob.title}</h2>
              <p className="text-sm text-slate-600 mt-1">{selectedJob.company}</p>

              {scores[selectedJob.id] && (
                <div className={['mt-3 rounded-lg p-3 border', getScoreColor(scores[selectedJob.id].score)].join(' ')}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{scores[selectedJob.id].score}%</span>
                    <span className="text-xs font-medium">ATS Score</span>
                  </div>
                  <p className="text-xs mt-1 opacity-80">{scores[selectedJob.id].reason}</p>
                </div>
              )}

              {!scores[selectedJob.id] && profile && (
                <button onClick={() => scoreJob(selectedJob)} disabled={scoringId === selectedJob.id}
                  className="mt-3 w-full rounded-lg border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-100 transition flex items-center justify-center gap-2 disabled:opacity-50">
                  {scoringId === selectedJob.id ? (<><Loader2 className="h-4 w-4 animate-spin" />Scoring...</>) : (<><Target className="h-4 w-4" />Get ATS Score</>)}
                </button>
              )}

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{selectedJob.location}</span>
                {selectedJob.remote_type === 'remote' && <span className="rounded-full bg-green-50 px-2.5 py-1 text-green-600">Remote</span>}
                {formatSalary(selectedJob.salary_min, selectedJob.salary_max) && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-600">{formatSalary(selectedJob.salary_min, selectedJob.salary_max)}</span>}
              </div>

              <div className="mt-4 flex gap-2">
                <a href={selectedJob.source_url} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white text-center hover:bg-brand-700 transition flex items-center justify-center gap-2">
                  <ExternalLink className="h-4 w-4" /> Apply
                </a>
                <button onClick={() => toggleSave(selectedJob)} className={['rounded-lg border px-3 py-2.5 text-sm font-medium transition', isJobSaved(selectedJob) ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'].join(' ')}>
                  {isJobSaved(selectedJob) ? '✓' : 'Save'}
                </button>
              </div>

              {profile && (
                <button onClick={() => optimizeForJob(selectedJob)} className="mt-2 w-full rounded-lg border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-100 transition flex items-center justify-center gap-2">
                  <Zap className="h-4 w-4" /> Optimize Resume for This Job
                </button>
              )}

              <div className="mt-6 border-t pt-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Job Description</h3>
                <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto">{selectedJob.description}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
