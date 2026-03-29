'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Bookmark, BookmarkCheck, ExternalLink, Building2, Clock, DollarSign, CheckCircle, Zap, Target, Filter, AlertCircle } from 'lucide-react';
import { useTracker } from '@/hooks/useTracker';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { getCachedScores, setCachedScore } from '@/lib/db';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';

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
  const sC=(s:number)=>s>=80?'bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30':s>=60?'bg-[var(--warning)]/12 text-[var(--warning)] border-[var(--warning)]/25':'bg-[var(--destructive)]/12 text-[var(--destructive)] border-[var(--destructive)]/25';

  return(<div>
    <PageHeader
      title="Jobs"
      description={`TheirStack-powered search • ${jobs.length} in this list`}
      action={!profile ? <a href="/profile" className="pill border border-[var(--warning)]/35 bg-[var(--warning)]/10 text-[var(--warning)] gap-1.5 px-3 py-2"><AlertCircle className="h-3.5 w-3.5"/>Upload resume to score fit</a> : undefined}
    />
    {titles.length>1&&<div className="mt-2 flex flex-wrap gap-2">{titles.map(t=>(<button key={t} type="button" onClick={()=>handleSearch(undefined,t)} className={`pill cursor-pointer transition-all border px-4 py-1.5 ${query===t&&searched?'bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent-dim-strong)]':'bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--separator)] hover:border-[var(--accent-dim-strong)] hover:text-[var(--accent)]'}`}>{t}</button>))}</div>}

    <form onSubmit={e=>handleSearch(e)} className="mt-5">
      <div className="flex gap-3 surface p-2.5">
        <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]"/><input type="text" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Job title, skills, or company" className="w-full rounded-[var(--radius-lg)] bg-[var(--surface-2)] border border-transparent py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-dim-strong)] focus:ring-2 focus:ring-[var(--accent-dim)] focus:outline-none transition"/></div>
        <div className="relative w-44 min-w-0 sm:min-w-[11rem]"><MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]"/><input type="text" value={location} onChange={e=>setLocation(e.target.value)} placeholder="City, state" className="w-full rounded-[var(--radius-lg)] bg-[var(--surface-2)] border border-transparent py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-dim-strong)] focus:ring-2 focus:ring-[var(--accent-dim)] focus:outline-none transition"/></div>
        <button type="submit" disabled={loading||!query.trim()} className="btn-filled px-6 py-2.5 text-sm disabled:opacity-50">{loading?<Loader2 className="h-4 w-4 animate-spin"/>:'Search'}</button>
        <button type="button" onClick={()=>setShowFilters(!showFilters)} className={`rounded-[var(--radius-lg)] border px-3 py-2.5 transition-all ${showFilters?'border-[var(--accent-dim-strong)] bg-[var(--accent-dim)] text-[var(--accent)]':'border-[var(--separator)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}><Filter className="h-4 w-4"/></button>
      </div>
      {showFilters&&<div className="mt-2 flex flex-wrap items-center gap-3 surface p-3.5">
        {[{l:'Remote',v:remoteFilter,s:setRemoteFilter,o:[['','Any'],['remote','Remote'],['onsite','On-site']]},{l:'Type',v:employmentType,s:setEmploymentType,o:[['','Any'],['fulltime','Full-time'],['contract','Contract'],['parttime','Part-time']]},{l:'Level',v:experienceLevel,s:setExperienceLevel,o:[['','Any'],['Entry Level','Entry'],['Mid Level','Mid'],['Senior','Senior'],['Lead','Lead']]},{l:'Posted',v:datePosted,s:setDatePosted,o:[['','Any'],['today','Today'],['3days','3 days'],['week','Week'],['month','Month']]}].map(f=>(
          <div key={f.l}><label className="block text-[10px] font-bold text-[var(--text-tertiary)] uppercase mb-1">{f.l}</label><select value={f.v} onChange={e=>f.s(e.target.value)} className="rounded-[var(--radius-md)] border border-[var(--separator)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--text-secondary)]">{f.o.map(([val,label])=><option key={val} value={val}>{label}</option>)}</select></div>
        ))}
        <button type="button" onClick={()=>{setRemoteFilter('');setEmploymentType('');setExperienceLevel('');setDatePosted('');}} className="text-xs text-[var(--accent)] hover:underline mt-4 font-semibold">Clear filters</button>
      </div>}
    </form>

    {error&&<div className="mt-4 surface p-3 border border-[var(--destructive)]/25 bg-[var(--destructive)]/10 text-sm text-[var(--destructive)]">{error}</div>}

    <div className="mt-5 flex gap-5">
      <div className="flex-1 space-y-2">
        {loading&&<div className="py-16 text-center"><Loader2 className="h-6 w-6 animate-spin text-[var(--accent)] mx-auto"/></div>}
        {!loading&&searched&&jobs.length===0&&!error&&<div className="py-16 text-center text-sm text-[var(--text-tertiary)]">No jobs found. Try different keywords.</div>}
        {!loading&&jobs.map(job=>{const saved=isSaved(job);const sc=scores[job.id];const scoring=scoringId===job.id;return(
          <div key={job.id} onClick={()=>setSelectedJob(job)} className={`surface surface-h p-4 cursor-pointer border border-[var(--separator)] ${selectedJob?.id===job.id?'border-[var(--accent-dim-strong)] shadow-sm-sm ring-1 ring-[var(--accent)]/20':''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap"><h3 className="text-sm font-bold text-[var(--text-primary)]">{job.title}</h3>{saved&&<CheckCircle className="h-3.5 w-3.5 text-[var(--accent)]"/>}{sc&&<span className={`pill border ${sC(sc.score)}`}>{sc.score}%</span>}</div>
                <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5 mt-0.5"><Building2 className="h-3 w-3 text-[var(--text-tertiary)]"/>{job.company}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-tertiary)]">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/>{job.location}</span>
                  {job.remote_type==='remote'&&<span className="pill bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--accent-dim-strong)]">Remote</span>}
                  {fS(job.salary_min,job.salary_max)&&<span className="flex items-center gap-1"><DollarSign className="h-3 w-3"/>{fS(job.salary_min,job.salary_max)}</span>}
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3"/>{tA(job.posted_date)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 ml-3">
                <button type="button" onClick={e=>{e.stopPropagation();toggleSave(job);}} className="p-1.5 rounded-[var(--radius-md)] text-[var(--text-tertiary)] hover:text-[var(--accent)] transition">{saved?<BookmarkCheck className="h-5 w-5 text-[var(--accent)]"/>:<Bookmark className="h-5 w-5"/>}</button>
                {!sc&&profile&&<button type="button" onClick={e=>{e.stopPropagation();scoreJob(job);}} disabled={scoring} className="pill bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--separator)] hover:bg-[var(--accent-dim)] hover:text-[var(--accent)] hover:border-[var(--accent-dim-strong)] transition cursor-pointer gap-1 px-2.5 py-1">{scoring?<Loader2 className="h-3 w-3 animate-spin"/>:<Target className="h-3 w-3"/>}{scoring?'...':'Score'}</button>}
                {profile&&<button type="button" onClick={e=>{e.stopPropagation();optimizeForJob(job);}} className="p-1.5 rounded-[var(--radius-md)] text-[var(--text-tertiary)] hover:text-[var(--accent-secondary)] transition" title="Optimize"><Zap className="h-4 w-4"/></button>}
              </div>
            </div>
          </div>);})}
        {hasMore&&!loading&&searched&&jobs.length>0&&(
          <button type="button" onClick={()=>doSearch(query,location,page+1,true)} disabled={loadingMore} className="w-full surface surface-h border border-[var(--separator)] py-3 text-sm font-semibold text-[var(--accent)] flex items-center justify-center gap-2 mt-2 hover:border-[var(--accent-dim-strong)]">{loadingMore?<><Loader2 className="h-4 w-4 animate-spin"/>Loading...</>:'Load more jobs'}</button>
        )}
      </div>

      {selectedJob&&(
        <div className="hidden lg:block w-[420px] flex-shrink-0">
          <div className="sticky top-8 surface overflow-hidden max-h-[calc(100vh-120px)] overflow-y-auto border border-[var(--separator)]">
            <div className="p-5 border-b border-[var(--separator)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">{selectedJob.title}</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">{selectedJob.company}</p>
              {scores[selectedJob.id]&&<div className={`mt-3 rounded-2xl p-3 border ${sC(scores[selectedJob.id].score)}`}><span className="text-xl font-bold">{scores[selectedJob.id].score}%</span><span className="text-xs font-semibold ml-1.5">ATS Match</span>{scores[selectedJob.id].reason&&<p className="text-xs mt-1 opacity-75">{scores[selectedJob.id].reason}</p>}</div>}
              {!scores[selectedJob.id]&&profile&&<button onClick={()=>scoreJob(selectedJob)} disabled={scoringId===selectedJob.id} className="mt-3 w-full btn-gray py-2.5 text-sm flex items-center justify-center gap-2">{scoringId===selectedJob.id?<><Loader2 className="h-4 w-4 animate-spin"/>Scoring...</>:<><Target className="h-4 w-4"/>Get ATS Score</>}</button>}
              <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="pill bg-[var(--surface-2)] border border-[var(--separator)] text-[var(--text-secondary)]">{selectedJob.location}</span>{selectedJob.remote_type==='remote'&&<span className="pill bg-[var(--accent-dim)] border border-[var(--accent-dim-strong)] text-[var(--accent)]">Remote</span>}{fS(selectedJob.salary_min,selectedJob.salary_max)&&<span className="pill bg-[rgba(96,165,250,0.12)] border border-[var(--info)]/30 text-[var(--info)]">{fS(selectedJob.salary_min,selectedJob.salary_max)}</span>}</div>
              <div className="mt-3 flex gap-2"><a href={selectedJob.source_url} target="_blank" rel="noopener noreferrer" className="flex-1 btn-filled py-2.5 text-sm text-center flex items-center justify-center gap-2 !min-h-0"><ExternalLink className="h-4 w-4"/>Apply</a><button type="button" onClick={()=>toggleSave(selectedJob)} className={`btn-gray px-5 py-2.5 text-sm !min-h-0 ${isSaved(selectedJob)?'!bg-[var(--accent-dim)] !text-[var(--accent)] border-[var(--accent-dim-strong)]':''}`}>{isSaved(selectedJob)?'Saved':'Save'}</button></div>
              {profile&&<button type="button" onClick={()=>optimizeForJob(selectedJob)} className="mt-2 w-full rounded-[var(--radius-lg)] bg-[rgba(139,157,255,0.12)] border border-[var(--accent-secondary)]/35 px-4 py-2.5 text-sm font-semibold text-[var(--accent-secondary)] hover:bg-[rgba(139,157,255,0.18)] transition flex items-center justify-center gap-2"><Zap className="h-4 w-4"/>Optimize resume</button>}
            </div>
            <div className="p-5">
              <h3 className="text-sm font-bold text-[var(--text-secondary)] mb-2">Job description</h3>
              <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">{selectedJob.description||<span className="text-[var(--text-tertiary)] italic">No description available</span>}</div>
              {selectedJob.source_url&&selectedJob.source_url!=='#'&&<a href={selectedJob.source_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:opacity-90"><ExternalLink className="h-3.5 w-3.5"/>View original posting</a>}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>);
}
