'use client';
import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
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
    try{const jd=await fetchFullJD(job);if(!jd||jd.length<20){toast.error('No JD available');setScoringId(null);return;}
      const r=await fetch('/api/resume/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({resumeText:profile.text,jobDescription:jd})});if(!r.ok)throw new Error('Failed');const d=await r.json();
      const sd:ScoreData={score:d.overall_score,reason:d.score_summary||''};setScores(p=>({...p,[job.id]:sd}));setCachedScore(job.id,sd.score,sd.reason);toast.success(`Score: ${sd.score}/100`);
    }catch(e:any){toast.error(e.message);}finally{setScoringId(null);}};

  const optimizeForJob=async(job:Job)=>{const jd=await fetchFullJD(job);sessionStorage.setItem('optimize_jd',jd);sessionStorage.setItem('optimize_title',`${job.title} at ${job.company}`);sessionStorage.setItem('optimize_company',job.company);router.push('/resume-optimizer');};

  const toggleSave=(job:Job)=>{if(tracker.cards.some(c=>c.url===job.source_url)){tracker.unsaveJob(job.source_url);toast('Removed');}else{const s=scores[job.id];tracker.saveJob({title:job.title,company:job.company,url:job.source_url,location:job.location,salary:fS(job.salary_min,job.salary_max)||undefined,match_score:s?.score});toast.success('Saved!');}};

  const isSaved=(j:Job)=>tracker.cards.some(c=>c.url===j.source_url);
  const fS=(a:number|null,b:number|null)=>{if(!a&&!b)return null;const f=(n:number)=>`$${(n/1000).toFixed(0)}k`;if(a&&b)return`${f(a)}–${f(b)}`;return a?`From ${f(a)}`:`Up to ${f(b!)}`};
  const tA=(d:string)=>{const x=Math.floor((Date.now()-new Date(d).getTime())/864e5);if(x===0)return'Today';if(x===1)return'Yesterday';if(x<7)return`${x}d ago`;if(x<30)return`${Math.floor(x/7)}w ago`;return`${Math.floor(x/30)}mo ago`};
  const sC=(s:number)=>s>=80?'text-[#00daf3] bg-[#007886]/15 border-[#00daf3]/20':s>=60?'text-[#cdbdff] bg-[#5203d5]/15 border-[#cdbdff]/20':'text-[#ffb4ab] bg-[#93000a]/15 border-[#ffb4ab]/20';

  return (<div className="h-[calc(100vh-64px)] flex flex-col">
    {/* Filters Row */}
    <section className="flex items-center justify-between gap-4 pb-4">
      <form onSubmit={e=>handleSearch(e)} className="flex items-center gap-3 flex-1">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8e90a2] text-lg">search</span>
          <input type="text" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search roles, skills, or companies..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#e1e2eb] placeholder:text-[#8e90a2]/50 focus:ring-1 focus:ring-[#bbc3ff]/20 outline-none transition-all" />
        </div>
        <div className="relative w-40">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8e90a2] text-lg">location_on</span>
          <input type="text" value={location} onChange={e=>setLocation(e.target.value)} placeholder="Location" className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#e1e2eb] placeholder:text-[#8e90a2]/50 focus:ring-1 focus:ring-[#bbc3ff]/20 outline-none transition-all" />
        </div>
        <button type="submit" disabled={loading||!query.trim()} className="kinetic-btn px-6 py-2.5 text-sm disabled:opacity-50">{loading?<Loader2 className="h-4 w-4 animate-spin"/>:'Search'}</button>
      </form>
      <div className="flex items-center gap-3">
        {[{l:'Remote',v:remoteFilter,fn:setRemoteFilter,o:[['','Any'],['remote','Remote']]},{l:'Posted',v:datePosted,fn:setDatePosted,o:[['','Any'],['today','Today'],['week','Week'],['month','Month']]},{l:'Type',v:employmentType,fn:setEmploymentType,o:[['','Any'],['fulltime','Full-time'],['contract','Contract']]}].map(f=>(
          <select key={f.l} value={f.v} onChange={e=>f.fn(e.target.value)} className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-[#c4c5d9] cursor-pointer hover:bg-white/10 transition-colors appearance-none">
            {f.o.map(([v,l])=><option key={v} value={v} className="bg-[#1d2026]">{v?l:`${f.l}: ${l}`}</option>)}
          </select>
        ))}
        <div className="flex items-center gap-2 text-[#c4c5d9] text-sm font-medium">
          <span className="text-[#bbc3ff] font-bold">{jobs.length}</span> results
        </div>
      </div>
    </section>

    {/* Title pills */}
    {titles.length>1&&<div className="flex flex-wrap gap-2 pb-4">{titles.map(t=>(<button key={t} onClick={()=>handleSearch(undefined,t)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${query===t&&searched?'bg-[#3c59fd]/20 text-[#bbc3ff] border border-[#bbc3ff]/20':'bg-white/5 text-[#8e90a2] border border-white/10 hover:bg-[#3c59fd]/10 hover:text-[#bbc3ff]'}`}>{t}</button>))}</div>}

    {error&&<div className="mb-4 glass-panel p-3 border-[#ffb4ab]/20 bg-[#93000a]/10 text-sm text-[#ffb4ab] rounded-2xl">{error}</div>}

    {/* Dual Pane */}
    <section className="flex-1 flex overflow-hidden gap-6">
      {/* Left: Job Cards */}
      <div className={`${selectedJob?'w-[420px]':'w-full max-w-2xl'} flex flex-col gap-3 overflow-y-auto pr-2`} style={{scrollbarWidth:'thin'}}>
        {loading&&<div className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin text-[#bbc3ff] mx-auto"/></div>}
        {!loading&&searched&&jobs.length===0&&!error&&<div className="py-20 text-center text-sm text-[#8e90a2]">No jobs found. Try different keywords.</div>}
        {!loading&&jobs.map(job=>{const saved=isSaved(job);const sc=scores[job.id];const scoring=scoringId===job.id;return(
          <div key={job.id} onClick={()=>setSelectedJob(job)} className={`p-5 rounded-2xl cursor-pointer transition-all duration-200 ${selectedJob?.id===job.id?'glass-card ring-2 ring-[#bbc3ff]/40':'glass-card hover:bg-white/[0.06]'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                  <span className="material-symbols-outlined text-[#bbc3ff] text-lg">apartment</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#8e90a2] uppercase tracking-widest">{tA(job.posted_date)}</span>
                </div>
              </div>
              {sc&&<div className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold ${sC(sc.score)}`}>{sc.score} ATS</div>}
            </div>
            <h3 className="text-base font-bold text-[#e1e2eb] leading-tight mb-1">{job.title}</h3>
            <p className="text-sm text-[#bbc3ff] font-medium mb-3">{job.company}</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-0.5 bg-white/5 text-[#c4c5d9] text-[11px] font-medium rounded border border-white/5">{job.location}</span>
              {fS(job.salary_min,job.salary_max)&&<span className="px-2 py-0.5 bg-white/5 text-[#c4c5d9] text-[11px] font-medium rounded border border-white/5">{fS(job.salary_min,job.salary_max)}</span>}
              {job.remote_type==='remote'&&<span className="px-2 py-0.5 bg-[#00daf3]/20 text-[#00daf3] text-[11px] font-bold rounded border border-[#00daf3]/20">Remote</span>}
            </div>
          </div>
        );})}
        {hasMore&&!loading&&searched&&jobs.length>0&&(
          <button onClick={()=>doSearch(query,location,page+1,true)} disabled={loadingMore} className="w-full glass-card py-3 text-sm font-semibold text-[#bbc3ff] flex items-center justify-center gap-2 mt-2 rounded-2xl">{loadingMore?<><Loader2 className="h-4 w-4 animate-spin"/>Loading...</>:'Load more'}</button>
        )}
      </div>

      {/* Right: Detail Panel */}
      {selectedJob&&(
        <div className="hidden lg:flex flex-1 flex-col glass-card rounded-[2rem] overflow-hidden shadow-2xl" style={{borderTop:'1px solid rgba(255,255,255,0.15)',borderLeft:'1px solid rgba(255,255,255,0.1)'}}>
          {/* Header */}
          <div className="p-8 pb-0 flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  <span className="material-symbols-outlined text-[#bbc3ff] text-2xl">apartment</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#e1e2eb] tracking-tight leading-none mb-1">{selectedJob.title}</h2>
                  <p className="text-base font-medium text-[#bbc3ff]">{selectedJob.company} • {selectedJob.location}{selectedJob.remote_type==='remote'?' • Remote':''}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>toggleSave(selectedJob)} className="p-3 bg-white/5 text-[#e1e2eb] rounded-xl hover:bg-white/10 border border-white/10 transition-all">
                  <span className="material-symbols-outlined" style={isSaved(selectedJob)?{fontVariationSettings:"'FILL' 1",color:'#00daf3'}:{}}>{isSaved(selectedJob)?'bookmark':'bookmark_border'}</span>
                </button>
                <a href={selectedJob.source_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 text-[#e1e2eb] rounded-xl hover:bg-white/10 border border-white/10 transition-all">
                  <span className="material-symbols-outlined">open_in_new</span>
                </a>
              </div>
            </div>

            {/* AI Score Bar */}
            {scores[selectedJob.id]?(
              <div className="rounded-2xl p-4 flex items-center justify-between border border-[#cdbdff]/20" style={{background:'rgba(82,3,213,0.1)',backdropFilter:'blur(12px)'}}>
                <div className="flex items-center gap-4">
                  <div><span className="text-[10px] font-bold text-[#cdbdff] uppercase tracking-widest block mb-1">AI MATCH SCORE</span><div className="flex items-center gap-2"><span className="text-2xl font-black text-[#cdbdff]">{scores[selectedJob.id].score}%</span><span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${scores[selectedJob.id].score>=80?'bg-[#00daf3] text-[#001f24]':'bg-[#cdbdff] text-[#20005f]'}`}>{scores[selectedJob.id].score>=80?'OPTIMAL':'GOOD'}</span></div></div>
                  {scores[selectedJob.id].reason&&<><div className="h-8 w-px bg-white/10 mx-2"/><div><span className="text-[10px] font-bold text-[#c4c5d9] uppercase tracking-widest block mb-1">SUMMARY</span><p className="text-sm text-[#e1e2eb] font-medium">{scores[selectedJob.id].reason}</p></div></>}
                </div>
                <button onClick={()=>optimizeForJob(selectedJob)} className="flex items-center gap-2 px-4 py-2 bg-[#cdbdff]/80 text-[#20005f] rounded-lg text-sm font-bold transition-all hover:brightness-110">
                  <span className="material-symbols-outlined text-sm" style={{fontVariationSettings:"'FILL' 1"}}>psychology</span>Optimize Resume
                </button>
              </div>
            ):profile?(
              <button onClick={()=>scoreJob(selectedJob)} disabled={scoringId===selectedJob.id} className="kinetic-btn-ghost py-3 text-sm w-full rounded-2xl flex items-center justify-center gap-2">
                {scoringId===selectedJob.id?<><Loader2 className="h-4 w-4 animate-spin"/>Analyzing...</>:<><span className="material-symbols-outlined text-sm">analytics</span>Get ATS Score</>}
              </button>
            ):null}
          </div>

          {/* JD */}
          <div className="flex-1 overflow-y-auto p-8 pt-6" style={{scrollbarWidth:'thin'}}>
            <h4 className="text-lg font-bold text-[#e1e2eb] mb-4">About the Role</h4>
            <div className="text-[#c4c5d9] text-sm leading-relaxed whitespace-pre-wrap">{selectedJob.description||<span className="italic text-[#8e90a2]">No description available</span>}</div>
            {fS(selectedJob.salary_min,selectedJob.salary_max)&&(
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5"><span className="text-[10px] font-bold text-[#bbc3ff] uppercase block mb-1">Salary Range</span><p className="text-[#e1e2eb] font-semibold">{fS(selectedJob.salary_min,selectedJob.salary_max)}</p></div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5"><span className="text-[10px] font-bold text-[#bbc3ff] uppercase block mb-1">Source</span><p className="text-[#e1e2eb] font-semibold">{selectedJob.source}</p></div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-white/5 backdrop-blur-xl flex items-center justify-between border-t border-white/10">
            <div className="flex items-center gap-3">
              <button onClick={()=>toggleSave(selectedJob)} className="kinetic-btn-ghost px-6 py-3 text-sm">{isSaved(selectedJob)?'Saved':'Save for later'}</button>
              {profile&&<button onClick={()=>optimizeForJob(selectedJob)} className="kinetic-btn-ghost px-6 py-3 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-sm">psychology</span>Optimize</button>}
            </div>
            <a href={selectedJob.source_url} target="_blank" rel="noopener noreferrer" className="kinetic-btn px-10 py-3 text-base flex items-center gap-2">Apply Now <span className="material-symbols-outlined">arrow_forward</span></a>
          </div>
        </div>
      )}
    </section>
  </div>);
}
