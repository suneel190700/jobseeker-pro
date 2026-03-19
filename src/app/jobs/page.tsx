'use client';

import { useState } from 'react';
import {
  Search, MapPin, Loader2, Bookmark, BookmarkCheck,
  ExternalLink, Building2, Clock, DollarSign, Briefcase,
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  company_logo: string | null;
  location: string;
  remote_type: string;
  description: string;
  salary_min: number | null;
  salary_max: number | null;
  posted_date: string;
  source_url: string;
  employment_type: string;
}

export default function JobsPage() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [datePosted, setDatePosted] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setError('');
    setSelectedJob(null);

    try {
      const params = new URLSearchParams({ query });
      if (location) params.set('location', location);
      if (remoteOnly) params.set('remote', 'true');
      if (datePosted) params.set('date_posted', datePosted);

      const res = await fetch(`/api/jobs/search?${params}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setJobs([]);
      } else {
        setJobs(data.jobs || []);
      }
    } catch {
      setError('Failed to search jobs. Please try again.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = (jobId: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    return `Up to ${fmt(max!)}`;
  };

  const timeAgo = (date: string) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Job Search</h1>
      <p className="mt-1 text-sm text-slate-500">Find jobs across the US and save ones you like.</p>

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
            <option value="">Any time</option>
            <option value="today">Today</option>
            <option value="3days">Last 3 days</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
          </select>
        </div>
      </form>

      {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      {/* Results */}
      <div className="mt-6 flex gap-6">
        {/* Job List */}
        <div className="flex-1 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-brand-600" /></div>
          )}
          {!loading && searched && jobs.length === 0 && !error && (
            <div className="text-center py-16 text-sm text-slate-400">No jobs found. Try different keywords or location.</div>
          )}
          {!loading && jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className={['rounded-xl border p-4 cursor-pointer transition', selectedJob?.id === job.id ? 'border-brand-300 bg-brand-50/30 shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'].join(' ')}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">{job.title}</h3>
                  <p className="text-sm text-slate-600 flex items-center gap-1 mt-0.5"><Building2 className="h-3 w-3" /> {job.company}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                    {job.remote_type === 'remote' && <span className="rounded-full bg-green-50 px-2 py-0.5 text-green-600 font-medium">Remote</span>}
                    {formatSalary(job.salary_min, job.salary_max) && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {formatSalary(job.salary_min, job.salary_max)}</span>}
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(job.posted_date)}</span>
                    {job.employment_type && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {job.employment_type}</span>}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleSave(job.id); }} className="ml-2 p-1.5 rounded-lg text-slate-400 hover:text-brand-600 transition">
                  {savedIds.has(job.id) ? <BookmarkCheck className="h-5 w-5 text-brand-600" /> : <Bookmark className="h-5 w-5" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Job Detail Panel */}
        {selectedJob && (
          <div className="hidden lg:block w-[400px] flex-shrink-0">
            <div className="sticky top-0 rounded-xl border border-slate-200 p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <h2 className="text-lg font-bold text-slate-900">{selectedJob.title}</h2>
              <p className="text-sm text-slate-600 mt-1">{selectedJob.company}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{selectedJob.location}</span>
                {selectedJob.remote_type === 'remote' && <span className="rounded-full bg-green-50 px-2.5 py-1 text-green-600">Remote</span>}
                {formatSalary(selectedJob.salary_min, selectedJob.salary_max) && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-600">{formatSalary(selectedJob.salary_min, selectedJob.salary_max)}</span>}
              </div>
              <div className="mt-4 flex gap-2">
                <a href={selectedJob.source_url} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white text-center hover:bg-brand-700 transition flex items-center justify-center gap-2">
                  <ExternalLink className="h-4 w-4" /> Apply
                </a>
                <button onClick={() => toggleSave(selectedJob.id)} className={['rounded-lg border px-4 py-2.5 text-sm font-medium transition', savedIds.has(selectedJob.id) ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'].join(' ')}>
                  {savedIds.has(selectedJob.id) ? 'Saved' : 'Save'}
                </button>
              </div>
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
