'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Bookmark, BookmarkCheck, ExternalLink, Building2, Clock, DollarSign, CheckCircle, Zap, AlertCircle, Target, Filter } from 'lucide-react';
import { useTracker } from '@/hooks/useTracker';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { getCachedScores, setCachedScore } from '@/lib/db';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Job { id: string; title: string; company: string; location: string; remote_type: string; description: string; salary_min: number | null; salary_max: number | null; posted_date: string; source_url: string; employment_type: string; }
interface ScoreData { score: number; reason: string; }

export default function JobsPage() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [remoteFilter, setRemoteFilter] = useState('');
  const [datePosted, setDatePosted] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [error, setError] = useState('');
  const [scores, setScores] = useState<Record<string, ScoreData>>({});
  const [scoringId, setScoringId] = useState<string | null>(null);
  const autoLoaded = useRef(false);
  const tracker = useTracker();
  const { profile, titles, loaded: pLoaded } = useResumeProfile();
  const router = useRouter();

  useEffect(() => { setScores(getCachedScores()); }, []);

  useEffect(() => {
    try { const n = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (n?.type === 'back_forward') { const s = sessionStorage.getItem('jobseeker_search'); if (s) { const d = JSON.parse(s); setQuery(d.query||''); setLocation(d.location||''); setJobs(d.jobs||[]); setSearched(true); autoLoaded.current = true; return; } }
    } catch {}
  }, []);

  useEffect(() => {
    if (pLoaded && !autoLoaded.current && !searched) {
      autoLoaded.current = true;
      if (titles.length > 0) { setQuery(titles[0]); doSearch(titles[0], ''); }
      else if (profile?.text) { setQuery('AI Engineer'); doSearch('AI Engineer', ''); }
    }
  }, [pLoaded, titles, searched]);

  const doSearch = async (q: string, loc: string) => {
    if (!q.trim()) return;
    setLoading(true); setSearched(true); setError(''); setSelectedJob(null);
    try {
      const p = new URLSearchParams({ query: experienceLevel ? `${experienceLevel} ${q}` : q });
      if (loc) p.set('location', loc);
      if (remoteFilter === 'remote') p.set('remote', 'true');
      if (datePosted) p.set('date_posted', datePosted);
      if (employmentType) p.set('type', employmentType);
      const r = await fetch(`/api/jobs/search?${p}`);
      const d = await r.json();
      if (d.error) { setError(d.error); setJobs([]); } else { setJobs(d.jobs||[]); sessionStorage.setItem('jobseeker_search', JSON.stringify({ query: q, location: loc, jobs: d.jobs||[] })); }
    } catch { setError('Failed.'); setJobs([]); } finally { setLoading(false); }
  };

  const handleSearch = (e?: React.FormEvent, oq?: string) => { if (e) e.preventDefault(); autoLoaded.current = true; const q = oq || query; if (oq) setQuery(oq); doSearch(q, location); };

  const scoreJob = async (job: Job) => {
    if (!profile?.text) { toast.error('Upload resume first'); return; }
    setScoringId(job.id);
    try {
      const r = await fetch('/api/resume/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resumeText: profile.text, jobDescription: job.description }) });
      if (!r.ok) throw new Error('Failed');
      const d = await r.json();
      const sd: ScoreData = { score: d.overall_score, reason: d.score_summary || '' };
      setScores(p => ({ ...p, [job.id]: sd })); setCachedScore(job.id, sd.score, sd.reason);
      try { sessionStorage.setItem(`ats_analysis_${job.id}`, JSON.stringify(d)); } catch {}
      toast.success(`Score: ${sd.score}/100`);
    } catch (e: any) { toast.error(e.message); } finally { setScoringId(null); }
  };

  const optimizeForJob = (job: Job) => {
    sessionStorage.setItem('optimize_jd', job.description); sessionStorage.setItem('optimize_title', `${job.title} at ${job.company}`); sessionStorage.setItem('optimize_company', job.company);
    const s = scores[job.id]; if (s) sessionStorage.setItem('optimize_cached_score', JSON.stringify(s));
    const a = sessionStorage.getItem(`ats_analysis_${job.id}`); if (a) sessionStorage.setItem('optimize_cached_analysis', a);
    router.push('/resume-optimizer');
  };

  const toggleSave = (job: Job) => {
    if (tracker.cards.some(c => c.url === job.source_url)) { tracker.unsaveJob(job.source_url); toast('Removed'); }
    else { const s = scores[job.id]; tracker.saveJob({ title: job.title, company: job.company, url: job.source_url, location: job.location, salary: fS(job.salary_min, job.salary_max)||undefined, match_score: s?.score }); toast.success('Saved!'); }
  };

  const isSaved = (j: Job) => tracker.cards.some(c => c.url === j.source_url);
  const fS = (a: number|null, b: number|null) => { if (!a&&!b) return null; const f=(n:number)=>`$${(n/1000).toFixed(0)}k`; if (a&&b) return `${f(a)}-${f(b)}`; return a?`From ${f(a)}`:`Up to ${f(b!)}`; };
  const tA = (d: string) => { const x=Math.floor((Date.now()-new Date(d).getTime())/864e5); if (x===0) return 'Today'; if (x===1) return 'Yesterday'; if (x<7) return `${x}d`; if (x<30) return `${Math.floor(x/7)}w`; return `${Math.floor(x/30)}mo`; };
  const sC = (s: number) => s>=80?'bg-green-100 text-green-700 border-green-200':s>=60?'bg-amber-100 text-amber-700 border-amber-200':'bg-red-100 text-red-700 border-red-200';

  return (
    <div>
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Job Search</h1><p className="mt-1 text-sm text-slate-500">Find jobs and score them against your resume.</p></div>
        <div className="flex items-center gap-2">
          {!profile && <a href="/profile" className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700"><AlertCircle className="h-3.5 w-3.5" /> Upload resume</a>}
          {tracker.cards.length > 0 && <a href="/tracker" className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700"><BookmarkCheck className="h-3.5 w-3.5" /> {tracker.cards.length} saved</a>}
        </div>
      </div>
      {titles.length > 1 && <div className="mt-3 flex flex-wrap gap-2">{titles.map(t => (<button key={t} onClick={() => handleSearch(undefined, t)} className={['rounded-full border px-3 py-1 text-xs font-medium transition', query===t&&searched?'border-brand-300 bg-brand-50 text-brand-700':'border-slate-200 text-slate-500 hover:bg-slate-50'].join(' ')}>{t}</button>))}</div>}
      <form onSubmit={e => handleSearch(e)} className="mt-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Job title, keywords, or company" className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
          <div className="relative min-w-[160px]"><MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, state" className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" /></div>
          <button type="submit" disabled={loading||!query.trim()} className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition flex items-center gap-2">{loading?<Loader2 className="h-4 w-4 animate-spin" />:<Search className="h-4 w-4" />} Search</button>
          <button type="button" onClick={() => setShowFilters(!showFilters)} className={['rounded-lg border px-3 py-2.5 text-sm transition flex items-center gap-1.5', showFilters?'border-brand-300 bg-brand-50 text-brand-700':'border-slate-300 text-slate-600'].join(' ')}><Filter className="h-4 w-4" /> Filters</button>
        </div>
        {showFilters && <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div><label className="block text-[10px] font-medium text-slate-500 mb-1">Work Type</label><select value={remoteFilter} onChange={e => setRemoteFilter(e.target.value)} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"><option value="">Any</option><option value="remote">Remote</option><option value="onsite">On-site</option></select></div>
          <div><label className="block text-[10px] font-medium text-slate-500 mb-1">Employment</label><select value={employmentType} onChange={e => setEmploymentType(e.target.value)} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"><option value="">Any</option><option value="fulltime">Full-time</option><option value="contract">Contract</option><option value="parttime">Part-time</option><option value="intern">Internship</option></select></div>
          <div><label className="block text-[10px] font-medium text-slate-500 mb-1">Experience</label><select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"><option value="">Any</option><option value="Entry Level">Entry</option><option value="Mid Level">Mid</option><option value="Senior">Senior</option><option value="Lead">Lead/Staff</option></select></div>
          <div><label className="block text-[10px] font-medium text-slate-500 mb-1">Date</label><select value={datePosted} onChange={e => setDatePosted(e.target.value)} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"><option value="">Any</option><option value="today">Today</option><option value="3days">3 days</option><option value="week">Week</option><option value="month">Month</option></select></div>
          <button type="button" onClick={() => { setRemoteFilter(''); setEmploymentType(''); setExperienceLevel(''); setDatePosted(''); }} className="text-xs text-slate-400 hover:text-slate-600 mt-4">Clear</button>
        </div>}
      </form>
      {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      <div className="mt-6 flex gap-6">
        <div className="flex-1 space-y-3">
          {loading && <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-brand-600" /></div>}
          {!loading && searched && jobs.length===0 && !error && <div className="text-center py-16 text-sm text-slate-400">No jobs found.</div>}
          {!loading && jobs.map(job => {
            const saved=isSaved(job); const sc=scores[job.id]; const scoring=scoringId===job.id;
            return (
              <div key={job.id} onClick={() => setSelectedJob(job)} className={['rounded-xl border p-4 cursor-pointer transition', selectedJob?.id===job.id?'border-brand-300 bg-brand-50/30 shadow-sm':'border-slate-200 hover:border-slate-300 hover:shadow-sm'].join(' ')}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">{job.title}</h3>
                      {saved && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
                      {sc && <span className={['inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border', sC(sc.score)].join(' ')}>{sc.score}% ATS</span>}
                    </div>
                    <p className="text-sm text-slate-600 flex items-center gap-1 mt-0.5"><Building2 className="h-3 w-3" /> {job.company}</p>
                    {sc && <p className="text-xs text-slate-400 mt-1 italic">{sc.reason}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                      {job.remote_type==='remote' && <span className="rounded-full bg-green-50 px-2 py-0.5 text-green-600 font-medium">Remote</span>}
                      {fS(job.salary_min,job.salary_max) && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {fS(job.salary_min,job.salary_max)}</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {tA(job.posted_date)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 ml-2">
                    <button onClick={e => { e.stopPropagation(); toggleSave(job); }} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 transition">{saved?<BookmarkCheck className="h-5 w-5 text-brand-600" />:<Bookmark className="h-5 w-5" />}</button>
                    {!sc && profile && <button onClick={e => { e.stopPropagation(); scoreJob(job); }} disabled={scoring} className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-50 hover:text-brand-600 transition disabled:opacity-50">{scoring?<Loader2 className="h-3 w-3 animate-spin" />:<Target className="h-3 w-3" />}{scoring?'...':'Get Score'}</button>}
                    {profile && <button onClick={e => { e.stopPropagation(); optimizeForJob(job); }} className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 transition" title="Optimize"><Zap className="h-4 w-4" /></button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {selectedJob && (
          <div className="hidden lg:block w-[400px] flex-shrink-0">
            <div className="sticky top-0 rounded-xl border border-slate-200 p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <h2 className="text-lg font-bold text-slate-900">{selectedJob.title}</h2>
              <p className="text-sm text-slate-600 mt-1">{selectedJob.company}</p>
              {scores[selectedJob.id] && <div className={['mt-3 rounded-lg p-3 border', sC(scores[selectedJob.id].score)].join(' ')}><div className="flex items-center gap-2"><span className="text-lg font-bold">{scores[selectedJob.id].score}%</span><span className="text-xs font-medium">ATS</span></div><p className="text-xs mt-1 opacity-80">{scores[selectedJob.id].reason}</p></div>}
              {!scores[selectedJob.id] && profile && <button onClick={() => scoreJob(selectedJob)} disabled={scoringId===selectedJob.id} className="mt-3 w-full rounded-lg border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-100 transition flex items-center justify-center gap-2 disabled:opacity-50">{scoringId===selectedJob.id?<><Loader2 className="h-4 w-4 animate-spin" />Scoring...</>:<><Target className="h-4 w-4" />Get ATS Score</>}</button>}
              <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{selectedJob.location}</span>{selectedJob.remote_type==='remote' && <span className="rounded-full bg-green-50 px-2.5 py-1 text-green-600">Remote</span>}{fS(selectedJob.salary_min,selectedJob.salary_max) && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-600">{fS(selectedJob.salary_min,selectedJob.salary_max)}</span>}</div>
              <div className="mt-4 flex gap-2"><a href={selectedJob.source_url} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white text-center hover:bg-brand-700 transition flex items-center justify-center gap-2"><ExternalLink className="h-4 w-4" /> Apply</a><button onClick={() => toggleSave(selectedJob)} className={['rounded-lg border px-3 py-2.5 text-sm font-medium transition', isSaved(selectedJob)?'border-brand-300 bg-brand-50 text-brand-700':'border-slate-300 text-slate-600'].join(' ')}>{isSaved(selectedJob)?'✓':'Save'}</button></div>
              {profile && <button onClick={() => optimizeForJob(selectedJob)} className="mt-2 w-full rounded-lg border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-100 transition flex items-center justify-center gap-2"><Zap className="h-4 w-4" /> Optimize Resume</button>}
              <div className="mt-6 border-t pt-4"><h3 className="text-sm font-semibold text-slate-700 mb-2">Job Description</h3><div className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto">{selectedJob.description}</div></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
