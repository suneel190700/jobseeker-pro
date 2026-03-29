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
  useEffect(()=>{if(pLoaded&&!autoLoaded.current&&!searched){autoLoaded.current=true;if(titles.length>0){setQuery(titles[0]);doSearch(titles[0],'');}else if(profile?.text){setQuery('AI Engineer');doSearch('AI Engineer','');}}},[pLoaded,titles,searched]);

  const fetchFullJD=async(job:Job):Promise<string>=>{return job.description||'';};

  const doSearch=async(q:string,loc:string,pg:number=1,append:boolean=false)=>{if(!q.trim())return;if(append)setLoadingMore(true);else{setLoading(true);setPage(1);}setSearched(true);setError('');if(!append)setSelectedJob(null);
    try{const p=new URLSearchParams({query:experienceLevel?`${experienceLevel} ${q}`:q});if(loc)p.set('location',loc);if(remoteFilter==='remote')p.set('remote','true');if(datePosted)p.set('date_posted',datePosted);if(employmentType)p.set('type',employmentType);
      p.set('page',String(pg));const r=await fetch(`/api/jobs/search?${p}`);const d=await r.json();if(d.error){setError(d.error);if(!append)setJobs([]);}else{if(append){setJobs(prev=>[...prev,...(d.jobs||[])]);}else{setJobs(d.jobs||[]);}setHasMore(d.hasMore===true);setPage(pg);if(!append)sessionStorage.setItem('jobseeker_search',JSON.stringify({query:q,location:loc,jobs:d.jobs||[]}));}}catch{setError('Failed.');if(!append)setJobs([]);}finally{setLoading(false);setLoadingMore(false);}};

  const handleSearch=(e?:React.FormEvent,oq?:string)=>{if(e)e.preventDefault();autoLoaded.current=true;const q=oq||query;if(oq)setQuery(oq);doSearch(q,location);};

  const scoreJob=async(job:Job)=>{if(!profile?.text){toast.error('Upload resume first');return;}setScoringId(job.id);
    try{const jd=await fetchFullJD(job);if(!jd||jd.length<20){toast.error('No job description available');setScoringId(null);return;}
      const r=await fetch('/api/resume/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({resumeText:profile.text,jobDescription:jd})});if(!r.ok)throw new Error('Failed');const d=await r.json();
      const sd:ScoreData={score:d.overall_score,reason:d.score_summary||''};setScores(p=>({...p,[job.id]:sd}));setCachedScore(job.id,sd.score,sd.reason);toast.success(`Score: ${sd.score}/100`);
    }catch(e:any){toast.error(e.message);}finally{setScoringId(null);}};

  const optimizeForJob=async(job:Job)=>{const jd=await fetchFullJD(job);sessionStorage.setItem('optimize_jd',jd);sessionStorage.setItem('optimize_title',`${job.title} at ${job.company}`);sessionStorage.setItem('optimize_company',job.company);router.push('/resume-optimizer');};

  const toggleSave=(job:Job)=>{if(tracker.cards.some(c=>c.url===job.source_url)){tracker.unsaveJob(job.source_url);toast('Removed');}else{const s=scores[job.id];tracker.saveJob({title:job.title,company:job.company,url:job.source_url,location:job.location,salary:fS(job.salary_min,job.salary_max)||undefined,match_score:s?.score});toast.success('Saved!');}};

  const isSaved=(j:Job)=>tracker.cards.some(c=>c.url===j.source_url);
  const fS=(a:number|null,b:number|null)=>{if(!a&&!b)return null;const f=(n:number)=>`$${(n/1000).toFixed(0)}k`;if(a&&b)return`${f(a)}-${f(b)}`;return a?`From ${f(a)}`:`Up to ${f(b!)}`;};
  const tA=(d:string)=>{const x=Math.floor((Date.now()-new Date(d).getTime())/864e5);if(x===0)return'Today';if(x===1)return'Yesterday';if(x<7)return`${x}d ago`;if(x<30)return`${Math.floor(x/7)}w ago`;return`${Math.floor(x/30)}mo ago`;};
  const sC=(s:number)=>s>=80?'bg-[#30d158]/10 text-[#30d158] border-[#30d158]/20':s>=60?'bg-[#ff9f0a]/10 text-[#ff9f0a] border-[#ff9f0a]/20':'bg-[#ff453a]/10 text-red-700 border-[#ff453a]/20';

  return(<div>
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold text-white/90 tracking-tight">Jobs</h1><p className="mt-0.5 text-sm text-white/25">LinkedIn, Indeed, Glassdoor & 16K+ sources • {jobs.length} results</p></div>
      {!profile&&<a href="/profile" className="pill bg-[#ff9f0a]/10 text-[#ff9f0a] border border-[#ff9f0a]/20 gap-1.5 px-3 py-2"><AlertCircle className="h-3.5 w-3.5"/>Upload resume for scoring</a>}
    </div>
    {titles.length>1&&<div className="mt-3 flex flex-wrap gap-2">{titles.map(t=>(<button key={t} onClick={()=>handleSearch(undefined,t)} className={`pill cursor-pointer transition-all ${query===t&&searched?'bg-[#30d158]/10 text-[#30d158] border-[#30d158]/20':'bg-[var(--surface-1)] text-white/35 border-[var(--separator)] hover:bg-[#30d158]/10 hover:text-[#30d158]'} border px-4 py-1.5`}>{t}</button>))}</div>}

    <form onSubmit={e=>handleSearch(e)} className="mt-5">
      <div className="flex gap-3 surface p-2.5">
        <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25"/><input type="text" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Job title, skills, or company" className="w-full rounded-2xl bg-[var(--surface-1)] border-0 py-2.5 pl-10 pr-4 text-sm focus:bg-[var(--surface-1)] focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition"/></div>
        <div className="relative w-44"><MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25"/><input type="text" value={location} onChange={e=>setLocation(e.target.value)} placeholder="City, state" className="w-full rounded-2xl bg-[var(--surface-1)] border-0 py-2.5 pl-10 pr-4 text-sm focus:bg-[var(--surface-1)] focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition"/></div>
        <button type="submit" disabled={loading||!query.trim()} className="btn-filled px-6 py-2.5 text-sm disabled:opacity-50">{loading?<Loader2 className="h-4 w-4 animate-spin"/>:'Search'}</button>
        <button type="button" onClick={()=>setShowFilters(!showFilters)} className={`rounded-2xl border px-3 py-2.5 transition-all ${showFilters?'border-emerald-500/30 bg-[#30d158]/10 text-[#30d158]':'border-[var(--separator)] text-white/25 hover:text-white/50'}`}><Filter className="h-4 w-4"/></button>
      </div>
      {showFilters&&<div className="mt-2 flex flex-wrap items-center gap-3 surface p-3.5">
        {[{l:'Remote',v:remoteFilter,s:setRemoteFilter,o:[['','Any'],['remote','Remote'],['onsite','On-site']]},{l:'Type',v:employmentType,s:setEmploymentType,o:[['','Any'],['fulltime','Full-time'],['contract','Contract'],['parttime','Part-time']]},{l:'Level',v:experienceLevel,s:setExperienceLevel,o:[['','Any'],['Entry Level','Entry'],['Mid Level','Mid'],['Senior','Senior'],['Lead','Lead']]},{l:'Posted',v:datePosted,s:setDatePosted,o:[['','Any'],['today','Today'],['3days','3 days'],['week','Week'],['month','Month']]}].map(f=>(
          <div key={f.l}><label className="block text-[10px] font-bold text-white/25 uppercase mb-1">{f.l}</label><select value={f.v} onChange={e=>f.s(e.target.value)} className="rounded-[16px] border border-[var(--separator)] bg-[var(--surface-1)] px-3 py-1.5 text-xs text-white/50">{f.o.map(([val,label])=><option key={val} value={val}>{label}</option>)}</select></div>
        ))}
        <button type="button" onClick={()=>{setRemoteFilter('');setEmploymentType('');setExperienceLevel('');setDatePosted('');}} className="text-xs text-[#30d158] hover:underline mt-4">Clear filters</button>
      </div>}
    </form>

    {error&&<div className="mt-4 surface p-3 border-[#ff453a]/20 bg-[#ff453a]/10 text-sm text-[#ff453a]">{error}</div>}

    <div className="mt-5 flex gap-5">
      <div className="flex-1 space-y-2">
        {loading&&<div className="py-16 text-center"><Loader2 className="h-6 w-6 animate-spin text-[#30d158] mx-auto"/></div>}
        {!loading&&searched&&jobs.length===0&&!error&&<div className="py-16 text-center text-sm text-white/25">No jobs found. Try different keywords.</div>}
        {!loading&&jobs.map(job=>{const saved=isSaved(job);const sc=scores[job.id];const scoring=scoringId===job.id;return(
          <div key={job.id} onClick={()=>setSelectedJob(job)} className={`surface surface-h p-4 cursor-pointer ${selectedJob?.id===job.id?'border-[#30d158]/20 shadow-glow ring-1 ring-emerald-500/20':''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap"><h3 className="text-sm font-bold text-white/90">{job.title}</h3>{saved&&<CheckCircle className="h-3.5 w-3.5 text-emerald-500"/>}{sc&&<span className={`pill border ${sC(sc.score)}`}>{sc.score}%</span>}</div>
                <p className="text-sm text-white/35 flex items-center gap-1.5 mt-0.5"><Building2 className="h-3 w-3 text-white/25"/>{job.company}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/25">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/>{job.location}</span>
                  {job.remote_type==='remote'&&<span className="pill bg-[#30d158]/10 text-[#30d158] border border-[#30d158]/20">Remote</span>}
                  {fS(job.salary_min,job.salary_max)&&<span className="flex items-center gap-1"><DollarSign className="h-3 w-3"/>{fS(job.salary_min,job.salary_max)}</span>}
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3"/>{tA(job.posted_date)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 ml-3">
                <button onClick={e=>{e.stopPropagation();toggleSave(job);}} className="p-1.5 rounded-[16px] text-white/25 hover:text-[#30d158] transition">{saved?<BookmarkCheck className="h-5 w-5 text-[#30d158]"/>:<Bookmark className="h-5 w-5"/>}</button>
                {!sc&&profile&&<button onClick={e=>{e.stopPropagation();scoreJob(job);}} disabled={scoring} className="pill bg-[var(--surface-1)] text-white/35 border border-[var(--separator)] hover:bg-[#30d158]/10 hover:text-[#30d158] hover:border-[#30d158]/20 transition cursor-pointer gap-1 px-2.5 py-1">{scoring?<Loader2 className="h-3 w-3 animate-spin"/>:<Target className="h-3 w-3"/>}{scoring?'...':'Score'}</button>}
                {profile&&<button onClick={e=>{e.stopPropagation();optimizeForJob(job);}} className="p-1.5 rounded-[16px] text-white/25 hover:text-violet-500 transition" title="Optimize"><Zap className="h-4 w-4"/></button>}
              </div>
            </div>
          </div>);})}
        {hasMore&&!loading&&searched&&jobs.length>0&&(
          <button onClick={()=>doSearch(query,location,page+1,true)} disabled={loadingMore} className="w-full surface surface-h py-3 text-sm font-semibold text-[#30d158] flex items-center justify-center gap-2 mt-2">{loadingMore?<><Loader2 className="h-4 w-4 animate-spin"/>Loading...</>:'Load more jobs'}</button>
        )}
      </div>

      {selectedJob&&(
        <div className="hidden lg:block w-[420px] flex-shrink-0">
          <div className="sticky top-0 surface overflow-hidden max-h-[calc(100vh-120px)] overflow-y-auto">
            <div className="p-5 border-b border-[var(--separator)]">
              <h2 className="text-lg font-bold text-white/90">{selectedJob.title}</h2>
              <p className="text-sm text-white/35 mt-0.5">{selectedJob.company}</p>
              {scores[selectedJob.id]&&<div className={`mt-3 rounded-2xl p-3 border ${sC(scores[selectedJob.id].score)}`}><span className="text-xl font-bold">{scores[selectedJob.id].score}%</span><span className="text-xs font-semibold ml-1.5">ATS Match</span>{scores[selectedJob.id].reason&&<p className="text-xs mt-1 opacity-75">{scores[selectedJob.id].reason}</p>}</div>}
              {!scores[selectedJob.id]&&profile&&<button onClick={()=>scoreJob(selectedJob)} disabled={scoringId===selectedJob.id} className="mt-3 w-full btn-gray py-2.5 text-sm flex items-center justify-center gap-2">{scoringId===selectedJob.id?<><Loader2 className="h-4 w-4 animate-spin"/>Scoring...</>:<><Target className="h-4 w-4"/>Get ATS Score</>}</button>}
              <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="pill bg-[var(--surface-1)] border border-[var(--separator)] text-white/50">{selectedJob.location}</span>{selectedJob.remote_type==='remote'&&<span className="pill bg-[#30d158]/10 border border-[#30d158]/20 text-[#30d158]">Remote</span>}{fS(selectedJob.salary_min,selectedJob.salary_max)&&<span className="pill bg-[#0a84ff]/10 border border-[#0a84ff]/20 text-[#0a84ff]">{fS(selectedJob.salary_min,selectedJob.salary_max)}</span>}</div>
              <div className="mt-3 flex gap-2"><a href={selectedJob.source_url} target="_blank" rel="noopener noreferrer" className="flex-1 btn-filled py-2.5 text-sm text-center flex items-center justify-center gap-2"><ExternalLink className="h-4 w-4"/>Apply</a><button onClick={()=>toggleSave(selectedJob)} className={`btn-gray px-5 py-2.5 text-sm ${isSaved(selectedJob)?'bg-[#30d158]/10 text-[#30d158] border-[#30d158]/20':''}`}>{isSaved(selectedJob)?'Saved':'Save'}</button></div>
              {profile&&<button onClick={()=>optimizeForJob(selectedJob)} className="mt-2 w-full rounded-2xl bg-[#bf5af2]/10 border border-[#bf5af2]/20 px-4 py-2.5 text-sm font-semibold text-[#bf5af2] hover:bg-violet-100 transition flex items-center justify-center gap-2"><Zap className="h-4 w-4"/>Optimize Resume</button>}
            </div>
            <div className="p-5">
              <h3 className="text-sm font-bold text-white/70 mb-2">Job Description</h3>
              <div className="text-sm text-white/50 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">{selectedJob.description||<span className="text-white/25 italic">No description available</span>}</div>
              {selectedJob.source_url&&selectedJob.source_url!=='#'&&<a href={selectedJob.source_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#30d158] hover:text-[#30d158]"><ExternalLink className="h-3.5 w-3.5"/>View original posting</a>}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>);
}
