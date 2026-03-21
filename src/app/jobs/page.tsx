'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Bookmark, BookmarkCheck, ExternalLink, Building2, Clock, DollarSign, CheckCircle, Zap, Target, Filter, AlertCircle } from 'lucide-react';
import { useTracker } from '@/hooks/useTracker';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { getCachedScores, setCachedScore } from '@/lib/db';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Job { id:string; title:string; company:string; location:string; remote_type:string; description:string; salary_min:number|null; salary_max:number|null; posted_date:string; source_url:string; source:string; employment_type:string; }
interface ScoreData { score:number; reason:string; }

export default function JobsPage() {
  const [query,setQuery]=useState('');const [location,setLocation]=useState('');const [remoteFilter,setRemoteFilter]=useState('');const [datePosted,setDatePosted]=useState('');const [employmentType,setEmploymentType]=useState('');const [experienceLevel,setExperienceLevel]=useState('');const [showFilters,setShowFilters]=useState(false);
  const [jobs,setJobs]=useState<Job[]>([]);const [loading,setLoading]=useState(false);const [searched,setSearched]=useState(false);const [selectedJob,setSelectedJob]=useState<Job|null>(null);const [error,setError]=useState('');const [scores,setScores]=useState<Record<string,ScoreData>>({});const [scoringId,setScoringId]=useState<string|null>(null);
  const [page,setPage]=useState(1);const [hasMore,setHasMore]=useState(false);const [loadingMore,setLoadingMore]=useState(false);
  const autoLoaded=useRef(false);const tracker=useTracker();const {profile,titles,loaded:pLoaded}=useResumeProfile();const router=useRouter();

  useEffect(()=>{getCachedScores().then(s=>setScores(s)).catch(()=>{});},[]);
  useEffect(()=>{try{const n=performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;if(n?.type==='back_forward'){const s=sessionStorage.getItem('jobseeker_search');if(s){const d=JSON.parse(s);setQuery(d.query||'');setLocation(d.location||'');setJobs(d.jobs||[]);setSearched(true);autoLoaded.current=true;}}}catch{}},[]);
  useEffect(()=>{if(pLoaded&&!autoLoaded.current&&!searched){autoLoaded.current=true;if(titles.length>0){setQuery(titles[0]);doSearch(titles[0],'');}else if(profile?.text){setQuery('AI Engineer');doSearch('AI Engineer','');}}},[pLoaded,titles,searched]);

  // Auto-fetch full JD on select
  useEffect(()=>{if(selectedJob&&(!selectedJob.description||selectedJob.description.length<100)){fetchFullJD(selectedJob);}},[selectedJob?.id]);

  const fetchFullJD=async(job:Job):Promise<string>=>{
    if(job.description&&job.description.length>500)return job.description;
    // Try JSearch job-details first (for JSearch jobs)
    if(!job.id.startsWith('adz_')){
      try{const r=await fetch(`/api/jobs/search?job_id=${encodeURIComponent(job.id)}`);if(r.ok){const d=await r.json();if(d.job?.description?.length>200){const desc=d.job.description;setJobs(p=>p.map(j=>j.id===job.id?{...j,description:desc}:j));if(selectedJob?.id===job.id)setSelectedJob({...job,description:desc});return desc;}}}catch{}
    }
    // Try web scraping the job URL for full description
    if(job.source_url&&job.source_url!=='#'){
      try{const r=await fetch('/api/jobs/fetch-jd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:job.source_url,currentDescription:job.description})});if(r.ok){const d=await r.json();if(d.description&&d.description.length>(job.description?.length||0)+100){setJobs(p=>p.map(j=>j.id===job.id?{...j,description:d.description}:j));if(selectedJob?.id===job.id)setSelectedJob({...job,description:d.description});return d.description;}}}catch{}
    }
    return job.description||'';
  };

  const doSearch=async(q:string,loc:string,pg:number=1,append:boolean=false)=>{if(!q.trim())return;if(append)setLoadingMore(true);else{setLoading(true);setPage(1);}setSearched(true);setError('');if(!append)setSelectedJob(null);
    try{const p=new URLSearchParams({query:experienceLevel?`${experienceLevel} ${q}`:q});if(loc)p.set('location',loc);if(remoteFilter==='remote')p.set('remote','true');if(datePosted)p.set('date_posted',datePosted);if(employmentType)p.set('type',employmentType);
      p.set('page',String(pg));const r=await fetch(`/api/jobs/search?${p}`);const d=await r.json();if(d.error){setError(d.error);if(!append)setJobs([]);}else{if(append){setJobs(prev=>[...prev,...(d.jobs||[])]);}else{setJobs(d.jobs||[]);}setHasMore(d.hasMore===true);setPage(pg);if(!append)sessionStorage.setItem('jobseeker_search',JSON.stringify({query:q,location:loc,jobs:d.jobs||[]}));}}catch{setError('Failed.');if(!append)setJobs([]);}finally{setLoading(false);setLoadingMore(false);}};

  const handleSearch=(e?:React.FormEvent,oq?:string)=>{if(e)e.preventDefault();autoLoaded.current=true;const q=oq||query;if(oq)setQuery(oq);doSearch(q,location);};

  const scoreJob=async(job:Job)=>{if(!profile?.text){toast.error('Upload resume first');return;}setScoringId(job.id);
    try{const jd=await fetchFullJD(job);if(!jd||jd.length<20){toast.error('No job description available');setScoringId(null);return;}
      const r=await fetch('/api/resume/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({resumeText:profile.text,jobDescription:jd})});if(!r.ok)throw new Error('Failed');const d=await r.json();
      const sd:ScoreData={score:d.overall_score,reason:d.score_summary||''};setScores(p=>({...p,[job.id]:sd}));setCachedScore(job.id,sd.score,sd.reason);
      try{sessionStorage.setItem(`ats_analysis_${job.id}`,JSON.stringify(d));}catch{}toast.success(`Score: ${sd.score}/100`);
    }catch(e:any){toast.error(e.message);}finally{setScoringId(null);}};

  const optimizeForJob=async(job:Job)=>{const jd=await fetchFullJD(job);sessionStorage.setItem('optimize_jd',jd);sessionStorage.setItem('optimize_title',`${job.title} at ${job.company}`);sessionStorage.setItem('optimize_company',job.company);
    const s=scores[job.id];if(s)sessionStorage.setItem('optimize_cached_score',JSON.stringify(s));const a=sessionStorage.getItem(`ats_analysis_${job.id}`);if(a)sessionStorage.setItem('optimize_cached_analysis',a);router.push('/resume-optimizer');};

  const toggleSave=(job:Job)=>{if(tracker.cards.some(c=>c.url===job.source_url)){tracker.unsaveJob(job.source_url);toast('Removed');}else{const s=scores[job.id];tracker.saveJob({title:job.title,company:job.company,url:job.source_url,location:job.location,salary:fS(job.salary_min,job.salary_max)||undefined,match_score:s?.score});toast.success('Saved!');}};

  const isSaved=(j:Job)=>tracker.cards.some(c=>c.url===j.source_url);
  const fS=(a:number|null,b:number|null)=>{if(!a&&!b)return null;const f=(n:number)=>`$${(n/1000).toFixed(0)}k`;if(a&&b)return`${f(a)}-${f(b)}`;return a?`From ${f(a)}`:`Up to ${f(b!)}`;};
  const tA=(d:string)=>{const x=Math.floor((Date.now()-new Date(d).getTime())/864e5);if(x===0)return'Today';if(x===1)return'Yesterday';if(x<7)return`${x}d ago`;if(x<30)return`${Math.floor(x/7)}w ago`;return`${Math.floor(x/30)}mo ago`;};
  const sC=(s:number)=>s>=80?'bg-green-100 text-green-700 border-green-200':s>=60?'bg-amber-100 text-amber-700 border-amber-200':'bg-red-100 text-red-700 border-red-200';

  return(<div>
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold text-gray-900">Jobs</h1><p className="mt-0.5 text-sm text-gray-500">Search across JSearch & Adzuna • {jobs.length} results</p></div>
      {!profile&&<a href="/profile" className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-medium text-amber-700"><AlertCircle className="h-3.5 w-3.5"/>Upload resume</a>}
    </div>
    {titles.length>1&&<div className="mt-3 flex flex-wrap gap-2">{titles.map(t=>(<button key={t} onClick={()=>handleSearch(undefined,t)} className={['rounded-full border px-4 py-1.5 text-xs font-semibold transition',query===t&&searched?'border-brand-500 bg-brand-50 text-brand-700':'border-gray-300 text-gray-500 hover:bg-gray-100'].join(' ')}>{t}</button>))}</div>}

    <form onSubmit={e=>handleSearch(e)} className="mt-4">
      <div className="flex gap-3 bg-white rounded-xl border border-gray-200 p-2 shadow-sm">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/><input type="text" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Job title, skills, or company" className="w-full rounded-lg bg-gray-50 border-0 py-2.5 pl-10 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-brand-100 focus:outline-none"/></div>
        <div className="relative w-48"><MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/><input type="text" value={location} onChange={e=>setLocation(e.target.value)} placeholder="City, state" className="w-full rounded-lg bg-gray-50 border-0 py-2.5 pl-10 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-brand-100 focus:outline-none"/></div>
        <button type="submit" disabled={loading||!query.trim()} className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition">{loading?<Loader2 className="h-4 w-4 animate-spin"/>:'Search'}</button>
        <button type="button" onClick={()=>setShowFilters(!showFilters)} className={['rounded-lg border px-3 py-2.5 text-sm transition',showFilters?'border-brand-300 bg-brand-50 text-brand-700':'border-gray-200 text-gray-500'].join(' ')}><Filter className="h-4 w-4"/></button>
      </div>
      {showFilters&&<div className="mt-2 flex flex-wrap items-center gap-3 bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
        <div><label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Remote</label><select value={remoteFilter} onChange={e=>setRemoteFilter(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs"><option value="">Any</option><option value="remote">Remote</option><option value="onsite">On-site</option></select></div>
        <div><label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Type</label><select value={employmentType} onChange={e=>setEmploymentType(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs"><option value="">Any</option><option value="fulltime">Full-time</option><option value="contract">Contract</option><option value="parttime">Part-time</option></select></div>
        <div><label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Level</label><select value={experienceLevel} onChange={e=>setExperienceLevel(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs"><option value="">Any</option><option value="Entry Level">Entry</option><option value="Mid Level">Mid</option><option value="Senior">Senior</option><option value="Lead">Lead</option></select></div>
        <div><label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Posted</label><select value={datePosted} onChange={e=>setDatePosted(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs"><option value="">Any</option><option value="today">Today</option><option value="3days">3 days</option><option value="week">Week</option><option value="month">Month</option></select></div>
        <button type="button" onClick={()=>{setRemoteFilter('');setEmploymentType('');setExperienceLevel('');setDatePosted('');}} className="text-xs text-brand-600 hover:underline mt-4">Clear</button>
      </div>}
    </form>

    {error&&<div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>}

    <div className="mt-5 flex gap-5">
      <div className="flex-1 space-y-2">
        {loading&&<div className="py-16 text-center"><Loader2 className="h-6 w-6 animate-spin text-brand-600 mx-auto"/></div>}
        {!loading&&searched&&jobs.length===0&&!error&&<div className="py-16 text-center text-sm text-gray-400">No jobs found.</div>}
        {!loading&&jobs.map(job=>{const saved=isSaved(job);const sc=scores[job.id];const scoring=scoringId===job.id;return(
          <div key={job.id} onClick={()=>setSelectedJob(job)} className={['bg-white rounded-xl border p-4 cursor-pointer transition hover:shadow-sm',selectedJob?.id===job.id?'border-brand-300 shadow-sm':'border-gray-200'].join(' ')}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap"><h3 className="text-sm font-semibold text-gray-900">{job.title}</h3>{saved&&<CheckCircle className="h-3.5 w-3.5 text-green-500"/>}{sc&&<span className={['inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border',sC(sc.score)].join(' ')}>{sc.score}%</span>}</div>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5"><Building2 className="h-3 w-3 text-gray-400"/>{job.company}<span className="text-gray-300 mx-1">•</span><span className="text-xs text-gray-400 capitalize">{job.source}</span></p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/>{job.location}</span>
                  {job.remote_type==='remote'&&<span className="rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-green-600 font-medium">Remote</span>}
                  {fS(job.salary_min,job.salary_max)&&<span className="flex items-center gap-1"><DollarSign className="h-3 w-3"/>{fS(job.salary_min,job.salary_max)}</span>}
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3"/>{tA(job.posted_date)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 ml-3">
                <button onClick={e=>{e.stopPropagation();toggleSave(job);}} className="p-1.5 rounded-lg text-gray-300 hover:text-brand-600 transition">{saved?<BookmarkCheck className="h-5 w-5 text-brand-600"/>:<Bookmark className="h-5 w-5"/>}</button>
                {!sc&&profile&&<button onClick={e=>{e.stopPropagation();scoreJob(job);}} disabled={scoring} className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-[10px] font-semibold text-gray-500 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition disabled:opacity-50">{scoring?<Loader2 className="h-3 w-3 animate-spin"/>:<Target className="h-3 w-3"/>}{scoring?'...':'Score'}</button>}
                {profile&&<button onClick={e=>{e.stopPropagation();optimizeForJob(job);}} className="p-1.5 rounded-lg text-gray-300 hover:text-purple-600 transition" title="Optimize"><Zap className="h-4 w-4"/></button>}
              </div>
            </div>
          </div>);})}
        {hasMore&&!loading&&searched&&jobs.length>0&&(
          <button onClick={()=>doSearch(query,location,page+1,true)} disabled={loadingMore} className="w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-brand-600 hover:bg-brand-50 transition flex items-center justify-center gap-2 mt-3">{loadingMore?<><Loader2 className="h-4 w-4 animate-spin"/>Loading more...</>:'Load more jobs'}</button>
        )}
      </div>

      {selectedJob&&(
        <div className="hidden lg:block w-[420px] flex-shrink-0">
          <div className="sticky top-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-h-[calc(100vh-120px)] overflow-y-auto">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{selectedJob.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{selectedJob.company} <span className="text-xs text-gray-400 capitalize">via {selectedJob.source}</span></p>
              {scores[selectedJob.id]&&<div className={['mt-3 rounded-lg p-3 border',sC(scores[selectedJob.id].score)].join(' ')}><span className="text-lg font-bold">{scores[selectedJob.id].score}%</span><span className="text-xs font-medium ml-1.5">ATS Match</span>{scores[selectedJob.id].reason&&<p className="text-xs mt-1 opacity-75">{scores[selectedJob.id].reason}</p>}</div>}
              {!scores[selectedJob.id]&&profile&&<button onClick={()=>scoreJob(selectedJob)} disabled={scoringId===selectedJob.id} className="mt-3 w-full rounded-lg bg-brand-50 border border-brand-200 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition flex items-center justify-center gap-2 disabled:opacity-50">{scoringId===selectedJob.id?<><Loader2 className="h-4 w-4 animate-spin"/>Scoring...</>:<><Target className="h-4 w-4"/>Get ATS Score</>}</button>}
              <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">{selectedJob.location}</span>{selectedJob.remote_type==='remote'&&<span className="rounded-full bg-green-50 border border-green-200 px-2.5 py-1 text-green-600">Remote</span>}{fS(selectedJob.salary_min,selectedJob.salary_max)&&<span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-600">{fS(selectedJob.salary_min,selectedJob.salary_max)}</span>}</div>
              <div className="mt-3 flex gap-2"><a href={selectedJob.source_url} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white text-center hover:bg-brand-700 transition flex items-center justify-center gap-2"><ExternalLink className="h-4 w-4"/>Apply</a><button onClick={()=>toggleSave(selectedJob)} className={['rounded-lg border px-4 py-2.5 text-sm font-semibold transition',isSaved(selectedJob)?'border-brand-300 bg-brand-50 text-brand-700':'border-gray-200 text-gray-600 hover:bg-gray-50'].join(' ')}>{isSaved(selectedJob)?'Saved':'Save'}</button></div>
              {profile&&<button onClick={()=>optimizeForJob(selectedJob)} className="mt-2 w-full rounded-lg bg-purple-50 border border-purple-200 px-4 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-100 transition flex items-center justify-center gap-2"><Zap className="h-4 w-4"/>Optimize Resume</button>}
            </div>
            <div className="p-5"><h3 className="text-sm font-semibold text-gray-700 mb-2">Job Description</h3><div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedJob.description||<span className="text-gray-400 italic">Loading description...</span>}</div>{selectedJob.description&&selectedJob.description.length<500&&selectedJob.source_url&&selectedJob.source_url!=='#'&&<a href={selectedJob.source_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"><ExternalLink className="h-3.5 w-3.5"/>View full job description</a>}</div>
          </div>
        </div>
      )}
    </div>
  </div>);
}
