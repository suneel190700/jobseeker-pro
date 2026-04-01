'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useTracker } from '@/hooks/useTracker';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { getCachedScores, setCachedScore } from '@/lib/db';
import { quickMatchScore } from '@/lib/ats-scorer';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Job { id:string; title:string; company:string; location:string; remote_type:string; description:string; salary_min:number|null; salary_max:number|null; posted_date:string; source_url:string; source:string; employment_type:string; }
interface ScoreData { score:number; reason:string; }

export default function JobsPage() {
  const [query,setQuery]=useState('');const [location,setLocation]=useState('');
  const [remoteFilter,setRemoteFilter]=useState('');const [datePosted,setDatePosted]=useState('');
  const [employmentType,setEmploymentType]=useState('');const [experienceLevel,setExperienceLevel]=useState('');
  const [salaryMin,setSalaryMin]=useState('');
  const [jobs,setJobs]=useState<Job[]>([]);const [loading,setLoading]=useState(false);
  const [searched,setSearched]=useState(false);const [selectedJob,setSelectedJob]=useState<Job|null>(null);
  const [error,setError]=useState('');const [scores,setScores]=useState<Record<string,ScoreData>>({});
  const [scoringId,setScoringId]=useState<string|null>(null);
  const [page,setPage]=useState(1);const [hasMore,setHasMore]=useState(false);const [loadingMore,setLoadingMore]=useState(false);
  const autoLoaded=useRef(false);const tracker=useTracker();
  const {profile,titles,loaded:pLoaded}=useResumeProfile();const router=useRouter();

  useEffect(()=>{getCachedScores().then(s=>setScores(s)).catch(()=>{});},[]);
  useEffect(()=>{if(pLoaded&&!autoLoaded.current&&!searched){autoLoaded.current=true;
    if(titles.length>0){setQuery(titles[0]);doSearch(titles[0],'');}
    else if(profile?.text){setQuery('Software Engineer');doSearch('Software Engineer','');}
  }},[pLoaded,titles,searched]);

  // Auto-calculate match scores for all jobs
  const jobScores = useMemo(() => {
    if (!profile?.text) return {};
    const s: Record<string, number> = {};
    for (const job of jobs) {
      if (job.description) s[job.id] = quickMatchScore(profile.text, job.description + ' ' + job.title);
    }
    return s;
  }, [jobs, profile?.text]);

  const fetchFullJD=async(job:Job):Promise<string>=>{return job.description||'';};

  const doSearch=async(q:string,loc:string,pg:number=1,append:boolean=false)=>{if(!q.trim())return;if(append)setLoadingMore(true);else{setLoading(true);setPage(1);}setSearched(true);setError('');if(!append)setSelectedJob(null);
    try{const p=new URLSearchParams({query:experienceLevel?`${experienceLevel} ${q}`:q});if(loc)p.set('location',loc);if(remoteFilter==='remote')p.set('remote','true');if(datePosted)p.set('date_posted',datePosted);if(employmentType)p.set('type',employmentType);
      p.set('page',String(pg));const r=await fetch(`/api/jobs/search?${p}`);const d=await r.json();if(d.error){setError(d.error);if(!append)setJobs([]);}else{
        let results = d.jobs || [];
        // Client-side salary filter
        if (salaryMin) { const min = parseInt(salaryMin) * 1000; results = results.filter((j:Job) => !j.salary_min || j.salary_min >= min); }
        if(append){setJobs(prev=>[...prev,...results]);}else{setJobs(results);}
        setHasMore(d.hasMore===true);setPage(pg);
      }}catch{setError('Failed.');if(!append)setJobs([]);}finally{setLoading(false);setLoadingMore(false);}};

  const handleSearch=(e?:React.FormEvent,oq?:string)=>{if(e)e.preventDefault();autoLoaded.current=true;const q=oq||query;if(oq)setQuery(oq);doSearch(q,location);};

  const scoreJob=async(job:Job)=>{if(!profile?.text){toast.error('Upload resume first');return;}setScoringId(job.id);
    try{const jd=await fetchFullJD(job);if(!jd||jd.length<20){toast.error('No JD available');setScoringId(null);return;}
      const r=await fetch('/api/resume/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({resumeText:profile.text,jobDescription:jd})});if(!r.ok)throw new Error('Failed');const d=await r.json();
      const sd:ScoreData={score:d.overall_score,reason:d.score_summary||''};setScores(p=>({...p,[job.id]:sd}));setCachedScore(job.id,sd.score,sd.reason);toast.success(`Score: ${sd.score}/100`);
    }catch(e:any){toast.error(e.message);}finally{setScoringId(null);}};

  const optimizeForJob=async(job:Job)=>{const jd=await fetchFullJD(job);sessionStorage.setItem('optimize_jd',jd);sessionStorage.setItem('optimize_title',`${job.title} at ${job.company}`);sessionStorage.setItem('optimize_company',job.company);router.push('/resume-optimizer');};

  const toggleSave=(job:Job)=>{if(tracker.cards.some(c=>c.url===job.source_url)){tracker.unsaveJob(job.source_url);toast('Removed');}else{const s=scores[job.id];tracker.saveJob({title:job.title,company:job.company,url:job.source_url,location:job.location,salary:fS(job.salary_min,job.salary_max)||undefined,match_score:s?.score||jobScores[job.id]});toast.success('Saved!');}};

  const isSaved=(j:Job)=>tracker.cards.some(c=>c.url===j.source_url);
  const fS=(a:number|null,b:number|null)=>{if(!a&&!b)return null;const f=(n:number)=>`$${(n/1000).toFixed(0)}k`;if(a&&b)return`${f(a)}–${f(b)}`;return a?`From ${f(a)}`:`Up to ${f(b!)}`};
  const tA=(d:string)=>{const x=Math.floor((Date.now()-new Date(d).getTime())/864e5);if(x===0)return'Today';if(x===1)return'Yesterday';if(x<7)return`${x}d ago`;if(x<30)return`${Math.floor(x/7)}w ago`;return`${Math.floor(x/30)}mo ago`};
  const matchColor=(s:number)=>s>=70?'text-[#00daf3] bg-[#007886]/15':s>=50?'text-[#cdbdff] bg-[#5203d5]/15':'text-[#8e90a2] bg-white/5';

  // Sort jobs by match score (highest first)
  const sortedJobs = useMemo(() => {
    if (!profile?.text) return jobs;
    return [...jobs].sort((a, b) => (jobScores[b.id] || 0) - (jobScores[a.id] || 0));
  }, [jobs, jobScores, profile?.text]);

  return (<div className="h-[calc(100vh-64px)] flex flex-col">
    {/* Search + Filters */}
    <section className="pb-4 space-y-3">
      <form onSubmit={e=>handleSearch(e)} className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8e90a2] text-lg">search</span>
          <input type="text" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Job title, skills, or company..." className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-[#e1e2eb] placeholder:text-[#8e90a2]/50 focus:ring-1 focus:ring-[#bbc3ff]/20 outline-none transition-all" />
        </div>
        <div className="relative w-40">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8e90a2] text-lg">location_on</span>
          <input type="text" value={location} onChange={e=>setLocation(e.target.value)} placeholder="Location" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-[#e1e2eb] placeholder:text-[#8e90a2]/50 focus:ring-1 focus:ring-[#bbc3ff]/20 outline-none transition-all" />
        </div>
        <button type="submit" disabled={loading||!query.trim()} className="kinetic-btn px-6 py-2.5 text-sm disabled:opacity-50">{loading?<Loader2 className="h-4 w-4 animate-spin"/>:'Search'}</button>
      </form>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <select value={remoteFilter} onChange={e=>{setRemoteFilter(e.target.value);if(searched)handleSearch();}} className="kinetic-select">
          <option value="">Remote: Any</option><option value="remote">Remote Only</option><option value="onsite">On-site</option><option value="hybrid">Hybrid</option>
        </select>
        <select value={datePosted} onChange={e=>{setDatePosted(e.target.value);if(searched)handleSearch();}} className="kinetic-select">
          <option value="">Posted: Any</option><option value="today">Today</option><option value="3days">Last 3 Days</option><option value="week">This Week</option><option value="month">This Month</option>
        </select>
        <select value={employmentType} onChange={e=>{setEmploymentType(e.target.value);if(searched)handleSearch();}} className="kinetic-select">
          <option value="">Type: Any</option><option value="fulltime">Full-time</option><option value="parttime">Part-time</option><option value="contract">Contract</option><option value="internship">Internship</option>
        </select>
        <select value={experienceLevel} onChange={e=>{setExperienceLevel(e.target.value);if(searched)handleSearch();}} className="kinetic-select">
          <option value="">Level: Any</option><option value="Entry">Entry Level</option><option value="Mid">Mid Level</option><option value="Senior">Senior</option><option value="Lead">Lead / Staff</option><option value="Director">Director+</option>
        </select>
        <select value={salaryMin} onChange={e=>setSalaryMin(e.target.value)} className="kinetic-select">
          <option value="">Salary: Any</option><option value="50">$50k+</option><option value="80">$80k+</option><option value="100">$100k+</option><option value="120">$120k+</option><option value="150">$150k+</option><option value="200">$200k+</option>
        </select>
        <div className="ml-auto flex items-center gap-2 text-[#c4c5d9] text-sm">
          <span className="text-[#bbc3ff] font-bold">{sortedJobs.length}</span> results
          {profile?.text && <span className="text-[#8e90a2]">• Match scores active</span>}
        </div>
      </div>

      {/* Title pills from profile */}
      {titles.length>1&&<div className="flex flex-wrap gap-2">{titles.map(t=>(<button key={t} onClick={()=>handleSearch(undefined,t)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${query===t&&searched?'bg-[#3c59fd]/20 text-[#bbc3ff] border border-[#bbc3ff]/20':'bg-white/5 text-[#8e90a2] border border-white/10 hover:bg-[#3c59fd]/10 hover:text-[#bbc3ff]'}`}>{t}</button>))}</div>}
    </section>

    {error&&<div className="mb-4 glass-panel p-3 border-[#ffb4ab]/20 bg-[#93000a]/10 text-sm text-[#ffb4ab] rounded-2xl">{error}</div>}

    {/* Dual Pane */}
    <section className="flex-1 flex overflow-hidden gap-6">
      {/* Job Cards */}
      <div className={`${selectedJob?'w-[420px]':'w-full max-w-3xl'} flex flex-col gap-3 overflow-y-auto pr-2`}>
        {loading&&<div className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin text-[#bbc3ff] mx-auto"/></div>}
        {!loading&&searched&&sortedJobs.length===0&&!error&&<div className="py-20 text-center text-sm text-[#8e90a2]">No jobs found.</div>}
        {!loading&&sortedJobs.map(job=>{const saved=isSaved(job);const ms=jobScores[job.id];const atsScore=scores[job.id];return(
          <div key={job.id} onClick={()=>setSelectedJob(job)} className={`p-5 rounded-2xl cursor-pointer transition-all duration-200 ${selectedJob?.id===job.id?'glass-card ring-2 ring-[#bbc3ff]/40':'glass-card'}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                  <span className="material-symbols-outlined text-[#bbc3ff] text-lg">apartment</span>
                </div>
                <span className="text-[10px] font-bold text-[#8e90a2] uppercase tracking-widest">{tA(job.posted_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Match % badge */}
                {ms!==undefined&&ms>0&&<span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border border-white/10 ${matchColor(ms)}`}>{ms}% Match</span>}
                {atsScore&&<span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${atsScore.score>=80?'text-[#00daf3] bg-[#007886]/15 border border-[#00daf3]/20':'text-[#cdbdff] bg-[#5203d5]/15 border border-[#cdbdff]/20'}`}>{atsScore.score} ATS</span>}
              </div>
            </div>
            <h3 className="text-base font-bold text-[#e1e2eb] leading-tight mb-1">{job.title}</h3>
            <p className="text-sm text-[#bbc3ff] font-medium mb-3">{job.company}</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-0.5 bg-white/5 text-[#c4c5d9] text-[11px] font-medium rounded border border-white/5">{job.location}</span>
              {fS(job.salary_min,job.salary_max)&&<span className="px-2 py-0.5 bg-white/5 text-[#c4c5d9] text-[11px] font-medium rounded border border-white/5">{fS(job.salary_min,job.salary_max)}</span>}
              {job.remote_type==='remote'&&<span className="px-2 py-0.5 bg-[#00daf3]/20 text-[#00daf3] text-[11px] font-bold rounded border border-[#00daf3]/20">Remote</span>}
              {job.employment_type&&<span className="px-2 py-0.5 bg-white/5 text-[#8e90a2] text-[11px] font-medium rounded border border-white/5">{job.employment_type}</span>}
            </div>
          </div>
        );})}
        {hasMore&&!loading&&<button onClick={()=>doSearch(query,location,page+1,true)} disabled={loadingMore} className="w-full glass-card py-3 text-sm font-semibold text-[#bbc3ff] flex items-center justify-center gap-2 mt-2 rounded-2xl">{loadingMore?<><Loader2 className="h-4 w-4 animate-spin"/>Loading...</>:'Load more'}</button>}
      </div>

      {/* Detail Panel */}
      {selectedJob&&(
        <div className="hidden lg:flex flex-1 flex-col glass-card rounded-[2rem] overflow-hidden shadow-2xl" style={{borderTop:'1px solid rgba(255,255,255,0.12)',borderLeft:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="p-8 pb-0 flex flex-col gap-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10"><span className="material-symbols-outlined text-[#bbc3ff] text-2xl">apartment</span></div>
                <div>
                  <h2 className="text-2xl font-black text-[#e1e2eb] tracking-tight leading-none mb-1">{selectedJob.title}</h2>
                  <p className="text-base font-medium text-[#bbc3ff]">{selectedJob.company} • {selectedJob.location}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>toggleSave(selectedJob)} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 border border-white/10 transition-all">
                  <span className="material-symbols-outlined" style={isSaved(selectedJob)?{fontVariationSettings:"'FILL' 1",color:'#00daf3'}:{color:'#e1e2eb'}}>{isSaved(selectedJob)?'bookmark':'bookmark_border'}</span>
                </button>
                <a href={selectedJob.source_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl hover:bg-white/10 border border-white/10 transition-all"><span className="material-symbols-outlined text-[#e1e2eb]">open_in_new</span></a>
              </div>
            </div>

            {/* Match + ATS scores */}
            <div className="flex gap-3">
              {jobScores[selectedJob.id]!==undefined&&<div className={`flex-1 rounded-2xl p-4 border ${matchColor(jobScores[selectedJob.id])} border-white/10`}>
                <span className="text-[10px] font-bold uppercase tracking-widest block mb-1">Keyword Match</span>
                <span className="text-2xl font-black">{jobScores[selectedJob.id]}%</span>
              </div>}
              {scores[selectedJob.id]&&<div className="flex-1 rounded-2xl p-4 border border-[#cdbdff]/20 bg-[#5203d5]/10">
                <span className="text-[10px] font-bold text-[#cdbdff] uppercase tracking-widest block mb-1">AI ATS Score</span>
                <span className="text-2xl font-black text-[#cdbdff]">{scores[selectedJob.id].score}%</span>
              </div>}
            </div>

            {/* Action row */}
            {!scores[selectedJob.id]&&profile&&<button onClick={()=>scoreJob(selectedJob)} disabled={scoringId===selectedJob.id} className="kinetic-btn-ghost py-3 text-sm w-full rounded-2xl flex items-center justify-center gap-2">
              {scoringId===selectedJob.id?<><Loader2 className="h-4 w-4 animate-spin"/>Deep ATS Analysis...</>:<><span className="material-symbols-outlined text-sm">analytics</span>Get AI ATS Score</>}
            </button>}
          </div>

          <div className="flex-1 overflow-y-auto p-8 pt-5">
            <h4 className="text-lg font-bold text-[#e1e2eb] mb-4">About the Role</h4>
            <div className="text-[#c4c5d9] text-sm leading-relaxed whitespace-pre-wrap">{selectedJob.description||<span className="italic text-[#8e90a2]">No description available</span>}</div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {fS(selectedJob.salary_min,selectedJob.salary_max)&&<div className="p-4 bg-white/5 rounded-xl border border-white/5"><span className="text-[10px] font-bold text-[#bbc3ff] uppercase block mb-1">Salary</span><p className="text-[#e1e2eb] font-semibold">{fS(selectedJob.salary_min,selectedJob.salary_max)}</p></div>}
              {selectedJob.employment_type&&<div className="p-4 bg-white/5 rounded-xl border border-white/5"><span className="text-[10px] font-bold text-[#bbc3ff] uppercase block mb-1">Type</span><p className="text-[#e1e2eb] font-semibold">{selectedJob.employment_type}</p></div>}
              <div className="p-4 bg-white/5 rounded-xl border border-white/5"><span className="text-[10px] font-bold text-[#bbc3ff] uppercase block mb-1">Source</span><p className="text-[#e1e2eb] font-semibold">{selectedJob.source}</p></div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/5"><span className="text-[10px] font-bold text-[#bbc3ff] uppercase block mb-1">Remote</span><p className="text-[#e1e2eb] font-semibold">{selectedJob.remote_type==='remote'?'Remote':'On-site'}</p></div>
            </div>
          </div>

          <div className="p-6 bg-white/5 backdrop-blur-xl flex items-center justify-between border-t border-white/10">
            <div className="flex gap-3">
              <button onClick={()=>toggleSave(selectedJob)} className="kinetic-btn-ghost px-6 py-3 text-sm">{isSaved(selectedJob)?'Saved':'Save'}</button>
              {profile&&<button onClick={()=>optimizeForJob(selectedJob)} className="kinetic-btn-ghost px-6 py-3 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-sm">psychology</span>Optimize</button>}
            </div>
            <a href={selectedJob.source_url} target="_blank" rel="noopener noreferrer" className="kinetic-btn px-10 py-3 text-base flex items-center gap-2">Apply Now <span className="material-symbols-outlined">arrow_forward</span></a>
          </div>
        </div>
      )}
    </section>
  </div>);
}
