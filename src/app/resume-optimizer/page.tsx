'use client';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2 } from 'lucide-react';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { useResumeVersions } from '@/hooks/useResumeVersions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ResumeOptimizerPage() {
  const [file, setFile] = useState<File|null>(null);
  const [useBR, setUseBR] = useState(false);
  const [jd, setJd] = useState('');
  const [jt, setJt] = useState('');
  const [co, setCo] = useState('');
  const [mode, setMode] = useState<'keyword'|'rewrite'>('keyword');
  // Keyword mode state
  const [kwResult, setKwResult] = useState<any>(null);
  const [kwLoading, setKwLoading] = useState(false);
  // Rewrite mode state
  const [gen, setGen] = useState<any>(null);
  const [ging, setGing] = useState(false);
  // Shared
  const [dling, setDling] = useState(false);
  const [err, setErr] = useState<string|null>(null);
  const [svd, setSvd] = useState(false);
  const { profile } = useResumeProfile();
  const { saveVersion } = useResumeVersions();
  const router = useRouter();

  useEffect(() => {
    const j=sessionStorage.getItem('optimize_jd'), t=sessionStorage.getItem('optimize_title'), c=sessionStorage.getItem('optimize_company');
    if (j) { setJd(j); sessionStorage.removeItem('optimize_jd'); if (t) { setJt(t); sessionStorage.removeItem('optimize_title'); } if (c) { setCo(c); sessionStorage.removeItem('optimize_company'); } if (profile?.text) setUseBR(true); }
  }, [profile]);

  const onDrop = useCallback((f: File[]) => { if (f[0]) { setFile(f[0]); setUseBR(false); setKwResult(null); setGen(null); setErr(null); setSvd(false); } }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] }, maxFiles: 1, maxSize: 10485760 });
  const ok = (file || useBR) && jd.trim();

  const getTxt = async () => {
    if (useBR && profile?.text) return profile.text;
    if (file) { const fd = new FormData(); fd.append('resume', file); const r = await fetch('/api/resume/parse', { method: 'POST', body: fd }); if (!r.ok) throw new Error('Parse failed'); return (await r.json()).text; }
    throw new Error('No resume');
  };

  // MODE 1: Keyword Injection
  const doKeyword = async () => {
    if (!ok) return; setKwLoading(true); setErr(null); setGen(null); setSvd(false);
    try {
      const resumeText = await getTxt();
      const r = await fetch('/api/resume/keyword-inject', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resumeText, jobDescription: jd }) });
      if (!r.ok) throw new Error('Failed');
      const data = await r.json();
      setKwResult(data);
      toast.success(`Score: ${data.before_score}% → ${data.after_score}%`);
    } catch (e: any) { setErr(e.message); } finally { setKwLoading(false); }
  };

  // MODE 2: AI Full Rewrite
  const doRewrite = async () => {
    if (!ok) return; setGing(true); setErr(null); setKwResult(null); setSvd(false);
    try {
      const resumeText = await getTxt();
      const r = await fetch('/api/resume/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resumeText, jobDescription: jd, jobTitle: jt, company: co, userName: profile?.text?.split('\n')[0] }) });
      if (!r.ok) throw new Error((await r.json().catch(()=>({}))).error || 'Failed');
      const data = await r.json();
      setGen(data.resume);
      toast.success('Resume optimized!');
      sessionStorage.setItem('optimized_resume', JSON.stringify(data.resume));
      sessionStorage.setItem('optimize_jd', jd);
      sessionStorage.setItem('optimize_company', co);
    } catch (e: any) { setErr(e.message); } finally { setGing(false); }
  };

  const getFilename = () => {
    const name = gen?._filename || gen?.name?.replace(/[^a-zA-Z0-9]/g,'_').toLowerCase() || 'resume';
    const company = co ? `_${co.replace(/[^a-zA-Z0-9]/g,'_').toLowerCase()}` : '';
    const position = jt ? `_${jt.replace(/[^a-zA-Z0-9]/g,'_').toLowerCase()}` : '';
    return `${name}${company}${position}`;
  };

  const doDL = async (fmt: 'docx'|'pdf') => {
    if (!gen) return; setDling(true);
    try {
      const r = await fetch('/api/resume/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resume: gen, format: fmt, filename: getFilename() }) });
      if (!r.ok) throw new Error('Failed'); const b = await r.blob(); const u = URL.createObjectURL(b);
      const a = document.createElement('a'); a.href = u; a.download = `${getFilename()}.${fmt}`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u);
      toast.success(`Downloaded ${getFilename()}.${fmt}`);
    } catch (e: any) { setErr(e.message); } finally { setDling(false); }
  };

  const doSave = () => { if (!gen) return; saveVersion(jt||'Untitled', jt, co, gen, 0, kwResult?.before_score||0); setSvd(true); toast.success('Saved!'); };
  const goTo = (p: string, d: Record<string,string>) => { Object.entries(d).forEach(([k,v]) => sessionStorage.setItem(k,v)); router.push(p); };

  const ringOffset = (score: number) => 2 * Math.PI * 34 - (score / 100) * 2 * Math.PI * 34;
  const ringColor = (s: number) => s >= 80 ? '#00daf3' : s >= 60 ? '#cdbdff' : '#ffb4ab';

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tighter text-[#bbc3ff]">Resume AI Optimizer</h2>
          <p className="text-[#c4c5d9] mt-2 max-w-lg">{jt || 'Choose keyword injection (free, instant) or full AI rewrite (premium quality).'}</p>
        </div>
        {gen && <div className="flex gap-3">
          <button onClick={() => doDL('docx')} disabled={dling} className="kinetic-btn-ghost px-5 py-2.5 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-lg">description</span>DOCX</button>
          <button onClick={() => doDL('pdf')} disabled={dling} className="kinetic-btn-ghost px-5 py-2.5 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-lg">picture_as_pdf</span>PDF</button>
        </div>}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          {/* Resume Source */}
          <div className="glass-card rounded-2xl p-6">
            {profile && <div className="flex p-1 rounded-xl mb-4" style={{background:'rgba(11,14,20,0.5)'}}>
              <button onClick={() => { setUseBR(true); setFile(null); }} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${useBR ? 'bg-[#272a31] text-[#bbc3ff]' : 'text-[#c4c5d9]'}`}>Base Resume</button>
              <button onClick={() => setUseBR(false)} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${!useBR ? 'bg-[#272a31] text-[#bbc3ff]' : 'text-[#c4c5d9]'}`}>Upload</button>
            </div>}
            {useBR && profile && <p className="text-xs text-[#00daf3] mb-4 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>{profile.fileName}</p>}
            {!useBR && <div {...getRootProps()} className={`mb-4 flex flex-col items-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition ${isDragActive?'border-[#bbc3ff]/40 bg-[#3c59fd]/10':file?'border-[#00daf3]/30 bg-[#007886]/10':'border-[#434656]'}`}>
              <input {...getInputProps()} /><span className="material-symbols-outlined text-2xl text-[#8e90a2] mb-2">upload_file</span>
              {file?<p className="text-sm text-[#00daf3] font-medium">{file.name}</p>:<p className="text-xs text-[#8e90a2]">Drop resume (PDF, DOCX, TXT)</p>}
            </div>}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div><label className="kinetic-label">Job Title</label><input value={jt} onChange={e=>setJt(e.target.value)} placeholder="e.g. AI Engineer" className="kinetic-input" /></div>
              <div><label className="kinetic-label">Company</label><input value={co} onChange={e=>setCo(e.target.value)} placeholder="e.g. Google" className="kinetic-input" /></div>
            </div>
            <label className="kinetic-label">Job Description</label>
            <textarea rows={6} value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste the target Job Description..." className="kinetic-input resize-none text-sm leading-relaxed" />
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setMode('keyword')} className={`glass-card rounded-2xl p-6 text-left transition-all ${mode==='keyword'?'ring-2 ring-[#00daf3]/40 bg-white/[0.06]':''}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#007886]/20 flex items-center justify-center"><span className="material-symbols-outlined text-[#00daf3]">bolt</span></div>
                <div><h3 className="text-sm font-bold text-[#e1e2eb]">Keyword Optimization</h3><p className="text-[10px] text-[#8e90a2]">Free • Instant</p></div>
              </div>
              <p className="text-xs text-[#c4c5d9] leading-relaxed">Injects missing JD keywords into your existing resume. No AI needed. Score target: 80-88%.</p>
            </button>
            <button onClick={() => setMode('rewrite')} className={`glass-card rounded-2xl p-6 text-left transition-all ${mode==='rewrite'?'ring-2 ring-[#cdbdff]/40 bg-white/[0.06]':''}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#5203d5]/20 flex items-center justify-center"><span className="material-symbols-outlined text-[#cdbdff]" style={{fontVariationSettings:"'FILL' 1"}}>auto_awesome</span></div>
                <div><h3 className="text-sm font-bold text-[#e1e2eb]">Full AI Rewrite</h3><p className="text-[10px] text-[#8e90a2]">Premium • 15-25s</p></div>
              </div>
              <p className="text-xs text-[#c4c5d9] leading-relaxed">Complete rewrite with compressed storytelling, ATS formatting, coursework. Score target: 90-93%.</p>
            </button>
          </div>

          {/* Action Button */}
          {mode==='keyword' ? (
            <button onClick={doKeyword} disabled={!ok||kwLoading} className="kinetic-btn w-full py-3.5 text-sm disabled:opacity-50 flex items-center justify-center gap-2" style={{background:'linear-gradient(135deg, #007886, #00daf3)'}}>
              {kwLoading?<><Loader2 className="h-4 w-4 animate-spin"/>Analyzing Keywords...</>:<><span className="material-symbols-outlined text-sm">bolt</span>Run Keyword Optimization</>}
            </button>
          ) : (
            <button onClick={doRewrite} disabled={!ok||ging} className="kinetic-btn w-full py-3.5 text-sm disabled:opacity-50 flex items-center justify-center gap-2" style={{background:'linear-gradient(135deg, #5203d5, #3c59fd)'}}>
              {ging?<><Loader2 className="h-4 w-4 animate-spin"/>Rewriting with AI...</>:<><span className="material-symbols-outlined text-sm">auto_awesome</span>Full AI Rewrite</>}
            </button>
          )}

          {/* Keyword Results */}
          {kwResult && mode==='keyword' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card-deep rounded-2xl p-5 text-center">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <svg className="w-full h-full"><circle className="text-white/5" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="4"/><circle style={{color:ringColor(kwResult.before_score),strokeDasharray:2*Math.PI*34,strokeDashoffset:ringOffset(kwResult.before_score),transform:'rotate(-90deg)',transformOrigin:'50% 50%'}} cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>
                    <span className="absolute inset-0 flex items-center justify-center font-black text-lg" style={{color:ringColor(kwResult.before_score)}}>{kwResult.before_score}%</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#8e90a2] uppercase tracking-widest">Before</span>
                </div>
                <div className="glass-card-deep rounded-2xl p-5 text-center">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <svg className="w-full h-full"><circle className="text-white/5" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="4"/><circle style={{color:ringColor(kwResult.after_score),strokeDasharray:2*Math.PI*34,strokeDashoffset:ringOffset(kwResult.after_score),transform:'rotate(-90deg)',transformOrigin:'50% 50%'}} cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>
                    <span className="absolute inset-0 flex items-center justify-center font-black text-lg" style={{color:ringColor(kwResult.after_score)}}>{kwResult.after_score}%</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#8e90a2] uppercase tracking-widest">After</span>
                </div>
              </div>
              {kwResult.injected_keywords?.length>0 && <div className="glass-card rounded-2xl p-5"><h4 className="text-xs font-bold text-[#00daf3] uppercase tracking-widest mb-3">Injected Keywords</h4><div className="flex flex-wrap gap-2">{kwResult.injected_keywords.map((k:string)=><span key={k} className="px-2.5 py-1 rounded-lg bg-[#00daf3]/10 text-[#00daf3] text-xs font-bold border border-[#00daf3]/20">{k}</span>)}</div></div>}
              {kwResult.still_missing?.length>0 && <div className="glass-card rounded-2xl p-5"><h4 className="text-xs font-bold text-[#ffb4ab] uppercase tracking-widest mb-3">Still Missing</h4><div className="flex flex-wrap gap-2">{kwResult.still_missing.map((k:string)=><span key={k} className="px-2.5 py-1 rounded-lg bg-[#93000a]/10 text-[#ffb4ab] text-xs font-bold border border-[#ffb4ab]/20">{k}</span>)}</div></div>}
              {kwResult.suggested_coursework?.length>0 && <div className="glass-card rounded-2xl p-5"><h4 className="text-xs font-bold text-[#cdbdff] uppercase tracking-widest mb-3">Suggested Coursework</h4><div className="space-y-1">{kwResult.suggested_coursework.map((c:string)=><p key={c} className="text-sm text-[#c4c5d9]">• {c}</p>)}</div></div>}
              <p className="text-xs text-[#8e90a2] text-center">Want higher score? Try <button onClick={()=>setMode('rewrite')} className="text-[#cdbdff] font-bold hover:underline">Full AI Rewrite</button> for 90-93%.</p>
            </div>
          )}

          {/* Rewrite Actions */}
          {gen && mode==='rewrite' && (
            <div className="flex flex-wrap gap-3">
              <button onClick={doSave} disabled={svd} className={`kinetic-btn-ghost px-5 py-2.5 text-sm flex items-center gap-2 ${svd?'border-[#00daf3]/30 text-[#00daf3]':''}`}><span className="material-symbols-outlined text-sm">{svd?'check_circle':'save'}</span>{svd?'Saved':'Save Version'}</button>
              <button onClick={() => goTo('/cover-letter', { cl_jd: jd, cl_title: jt, cl_company: co })} className="kinetic-btn-ghost px-5 py-2.5 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-sm">auto_stories</span>Cover Letter</button>
              <button onClick={() => goTo('/interview-prep', { interview_jd: jd, interview_title: jt, interview_company: co })} className="kinetic-btn-ghost px-5 py-2.5 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-sm">quiz</span>Interview Prep</button>
            </div>
          )}

          {err && <div className="glass-panel rounded-2xl p-4 border-[#ffb4ab]/20 bg-[#93000a]/10 text-sm text-[#ffb4ab] flex items-center gap-2"><span className="material-symbols-outlined">error</span>{err}</div>}
        </div>

        {/* Right: Preview */}
        <div className="col-span-12 lg:col-span-5">
          <div className="sticky top-8">
            <div className="glass-card rounded-2xl p-2 overflow-hidden" style={{boxShadow:'inset 0 0 40px rgba(187,195,255,0.03), 0 25px 50px -12px rgba(0,0,0,0.5)'}}>
              <div className="flex items-center justify-between px-4 py-3 rounded-t-xl" style={{background:'rgba(39,42,49,0.3)'}}>
                <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab]/40"/><div className="w-2.5 h-2.5 rounded-full bg-[#00daf3]/40"/><div className="w-2.5 h-2.5 rounded-full bg-[#cdbdff]/40"/></div>
                <span className="text-[10px] font-bold text-[#c4c5d9] uppercase tracking-widest">{gen ? 'Optimized Resume' : kwResult ? 'Keyword Analysis' : 'Live Preview'}</span>
                <div/>
              </div>
              <div className="bg-white p-8 rounded-b-xl overflow-y-auto text-slate-800" style={{aspectRatio:'1/1.414',maxHeight:'700px'}}>
                {gen ? (
                  <div>
                    <div className="border-b-2 border-slate-900 pb-3 mb-5"><h1 className="text-xl font-black uppercase tracking-tight">{gen.name}</h1><p className="text-[11px] font-semibold text-slate-500 mt-1">{[gen.email,gen.phone,gen.location].filter(Boolean).join(' - ')}</p>{gen.linkedin&&<p className="text-[10px] text-slate-400">{gen.linkedin}</p>}</div>
                    {gen.summary&&<div className="mb-5"><h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 border-b border-slate-100 pb-1">Summary</h3><p className="text-[10px] leading-relaxed text-slate-600">{gen.summary}</p></div>}
                    {gen.skills_grouped&&Object.keys(gen.skills_grouped).length>0&&<div className="mb-5"><h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 border-b border-slate-100 pb-1">Skills</h3>{Object.entries(gen.skills_grouped).map(([c,s])=>Array.isArray(s)&&s.length?<p key={c} className="text-[10px] text-slate-600 mb-0.5"><span className="font-bold">{c}:</span> {(s as string[]).join(', ')}</p>:null)}</div>}
                    {gen.experience?.length>0&&<div className="mb-5"><h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 border-b border-slate-100 pb-1">Experience</h3>{gen.experience.map((e:any,i:number)=>(<div key={i} className="mb-3"><div className="flex justify-between items-baseline"><h4 className="text-[10px] font-bold text-slate-800">{e.title} - {e.company}</h4><span className="text-[9px] text-slate-400">{e.dates}</span></div><ul className="mt-1 space-y-1 list-disc ml-3">{e.bullets?.map((b:string,j:number)=><li key={j} className="text-[9px] text-slate-600">{b}</li>)}</ul></div>))}</div>}
                    {gen.education?.length>0&&<div className="mb-4"><h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 border-b border-slate-100 pb-1">Education</h3>{gen.education.map((e:any,i:number)=><div key={i} className="mb-2"><p className="text-[10px] font-bold text-slate-800">{e.degree} - {e.institution}</p><p className="text-[9px] text-slate-400">{e.dates}</p>{e.coursework?.length>0&&<p className="text-[9px] text-slate-500 mt-0.5">Coursework: {e.coursework.join(', ')}</p>}</div>)}</div>}
                  </div>
                ) : kwResult ? (
                  <div className="h-full flex flex-col justify-center items-center text-center px-4">
                    <p className="text-3xl font-black text-slate-800 mb-2">{kwResult.before_score}% → {kwResult.after_score}%</p>
                    <p className="text-sm text-slate-500 mb-4">Keyword match improved</p>
                    <p className="text-xs text-slate-400">{kwResult.injected_keywords?.length||0} keywords injected • {kwResult.still_missing?.length||0} still missing</p>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    {kwLoading||ging?<div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-[#3c59fd] mx-auto"/><p className="mt-3 text-sm text-slate-400">{kwLoading?'Analyzing keywords...':'Rewriting with AI...'}</p></div>
                    :<p className="text-sm text-slate-300 italic">Upload resume and paste JD to begin</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
