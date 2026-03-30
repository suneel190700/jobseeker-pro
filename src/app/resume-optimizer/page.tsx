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
  const [aing, setAing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [err, setErr] = useState<string|null>(null);
  const [tab, setTab] = useState('overview');
  const [ging, setGing] = useState(false);
  const [gen, setGen] = useState<any>(null);
  const [dling, setDling] = useState(false);
  const [panel, setPanel] = useState<'audit'|'preview'>('audit');
  const [svd, setSvd] = useState(false);
  const { profile } = useResumeProfile();
  const { saveVersion } = useResumeVersions();
  const router = useRouter();

  useEffect(() => {
    const j=sessionStorage.getItem('optimize_jd'), t=sessionStorage.getItem('optimize_title'), c=sessionStorage.getItem('optimize_company'), ca=sessionStorage.getItem('optimize_cached_analysis');
    if (j) { setJd(j); sessionStorage.removeItem('optimize_jd'); if (t) { setJt(t); sessionStorage.removeItem('optimize_title'); } if (c) { setCo(c); sessionStorage.removeItem('optimize_company'); } if (profile?.text) setUseBR(true);
      if (ca) { try { setAnalysis(JSON.parse(ca)); sessionStorage.removeItem('optimize_cached_analysis'); toast.info('Score loaded.'); } catch {} } }
    sessionStorage.removeItem('optimize_cached_score');
  }, [profile]);

  const onDrop = useCallback((f: File[]) => { if (f[0]) { setFile(f[0]); setUseBR(false); setAnalysis(null); setErr(null); setGen(null); setSvd(false); } }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] }, maxFiles: 1, maxSize: 10485760 });
  const ok = (file || useBR) && jd.trim();

  const getTxt = async () => {
    if (useBR && profile?.text) return profile.text;
    if (file) { const fd = new FormData(); fd.append('resume', file); const r = await fetch('/api/resume/parse', { method: 'POST', body: fd }); if (!r.ok) throw new Error('Parse failed'); return (await r.json()).text; }
    throw new Error('No resume');
  };

  const doAudit = async () => {
    if (!ok) return; setAing(true); setErr(null); setGen(null); setSvd(false); setTab('overview'); setPanel('audit');
    try { let r; if (useBR && profile?.text) r = await fetch('/api/resume/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resumeText: profile.text, jobDescription: jd }) });
      else if (file) { const fd = new FormData(); fd.append('resume', file); fd.append('jobDescription', jd); r = await fetch('/api/resume/analyze', { method: 'POST', body: fd }); }
      else throw new Error('No resume');
      if (!r!.ok) throw new Error((await r!.json().catch(()=>({}))).error || 'Failed');
      setAnalysis(await r!.json());
    } catch (e: any) { setErr(e.message); } finally { setAing(false); }
  };

  const doGen = async () => {
    setGing(true); setErr(null); setSvd(false);
    try { const t = await getTxt();
      const r = await fetch('/api/resume/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resumeText: t, jobDescription: jd, jobTitle: jt }) });
      if (!r.ok) throw new Error((await r.json().catch(()=>({}))).error || 'Failed');
      const data = await r.json(); setGen(data.resume); setPanel('preview'); toast.success('Resume optimized!');
      sessionStorage.setItem('optimized_resume', JSON.stringify(data.resume)); sessionStorage.setItem('optimize_jd', jd); sessionStorage.setItem('optimize_company', co);
    } catch (e: any) { setErr(e.message); } finally { setGing(false); }
  };

  const doDL = async (fmt: 'docx'|'pdf') => {
    if (!gen) return; setDling(true);
    try { const r = await fetch('/api/resume/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resume: gen, format: fmt }) });
      if (!r.ok) throw new Error('Failed'); const b = await r.blob(); const u = URL.createObjectURL(b);
      const a = document.createElement('a'); a.href = u; a.download = `optimized_resume.${fmt}`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u);
      toast.success(`${fmt.toUpperCase()} downloaded!`);
    } catch (e: any) { setErr(e.message); } finally { setDling(false); }
  };

  const doSave = () => { if (!gen) return; saveVersion(jt||'Untitled', jt, co, gen, gen.ats_match_summary?.estimated_score||0, analysis?.overall_score||0); setSvd(true); toast.success('Version saved!'); };
  const goTo = (p: string, d: Record<string,string>) => { Object.entries(d).forEach(([k,v]) => sessionStorage.setItem(k,v)); router.push(p); };

  const ringOffset = (score: number) => { const c = 2 * Math.PI * 34; return c - (score / 100) * c; };
  const ringColor = (s: number) => s >= 80 ? '#00daf3' : s >= 60 ? '#cdbdff' : '#ffb4ab';

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tighter text-[#bbc3ff]">Resume AI Optimizer</h2>
          <p className="text-[#c4c5d9] mt-2 max-w-lg">{jt || 'Tailor your resume for specific ATS systems using neural matching and semantic analysis.'}</p>
        </div>
        {gen && <div className="flex gap-3">
          <button onClick={() => doDL('docx')} disabled={dling} className="kinetic-btn-ghost px-5 py-2.5 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-lg">description</span>DOCX</button>
          <button onClick={() => doDL('pdf')} disabled={dling} className="kinetic-btn-ghost px-5 py-2.5 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-lg">picture_as_pdf</span>PDF</button>
        </div>}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left: Input & Analysis */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-8">
          {/* Input Section */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              {profile && <div className="flex p-1 rounded-xl" style={{background:'rgba(11,14,20,0.5)'}}>
                <button onClick={() => { setUseBR(true); setFile(null); }} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${useBR ? 'bg-[#272a31] text-[#bbc3ff]' : 'text-[#c4c5d9] hover:text-[#e1e2eb]'}`}>Base Resume</button>
                <button onClick={() => setUseBR(false)} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${!useBR ? 'bg-[#272a31] text-[#bbc3ff]' : 'text-[#c4c5d9] hover:text-[#e1e2eb]'}`}>Upload</button>
              </div>}
              <div className="text-xs font-bold text-[#8e90a2] uppercase tracking-widest">Target Job Description</div>
            </div>

            {useBR && profile && <p className="text-xs text-[#00daf3] mb-4 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>{profile.fileName}</p>}

            {!useBR && <div {...getRootProps()} className={`mb-4 flex flex-col items-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition ${isDragActive?'border-[#bbc3ff]/40 bg-[#3c59fd]/10':file?'border-[#00daf3]/30 bg-[#007886]/10':'border-[#434656]'}`}>
              <input {...getInputProps()} />
              <span className="material-symbols-outlined text-2xl text-[#8e90a2] mb-2">upload_file</span>
              {file?<p className="text-sm text-[#00daf3] font-medium">{file.name}</p>:<p className="text-xs text-[#8e90a2]">Drop resume (PDF, DOCX, TXT)</p>}
            </div>}

            <textarea rows={8} value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste the target Job Description here to analyze keyword density and skill matching..." className="kinetic-input resize-none text-sm leading-relaxed" />

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-xs text-[#c4c5d9] flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-[#00daf3]">check_circle</span>AI Ready</span>
                <span className="text-xs text-[#c4c5d9] flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-[#cdbdff]">auto_awesome</span>Semantic Scan</span>
              </div>
              <button onClick={doAudit} disabled={!ok||aing} className="kinetic-btn px-8 py-3 text-sm disabled:opacity-50 flex items-center gap-2">
                {aing?<><Loader2 className="h-4 w-4 animate-spin"/>Analyzing...</>:<>Run ATS Audit <span className="material-symbols-outlined text-sm">bolt</span></>}
              </button>
            </div>
          </div>

          {/* ATS Score Rings */}
          {analysis && <div className="grid grid-cols-4 gap-4">
            {[{l:'Workday',s:analysis.overall_score||0},{l:'Lever',s:Math.max(0,(analysis.overall_score||0)-8)},{l:'iCIMS',s:Math.min(100,(analysis.overall_score||0)+5)},{l:'Greenhouse',s:Math.max(0,(analysis.overall_score||0)-15)}].map(x => (
              <div key={x.l} className="glass-card-deep p-5 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="relative w-20 h-20 mb-3">
                  <svg className="w-full h-full"><circle className="text-white/5" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="4" /><circle style={{color:ringColor(x.s),strokeDasharray:2*Math.PI*34,strokeDashoffset:ringOffset(x.s),transition:'stroke-dashoffset 0.5s',transform:'rotate(-90deg)',transformOrigin:'50% 50%'}} cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>
                  <span className="absolute inset-0 flex items-center justify-center font-black text-lg" style={{color:ringColor(x.s)}}>{x.s}%</span>
                </div>
                <span className="text-[10px] font-bold text-[#8e90a2] uppercase tracking-widest">{x.l}</span>
              </div>
            ))}
          </div>}

          {/* Category Scores + AI Rewrite */}
          {analysis && <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 glass-card rounded-2xl p-6">
              <h4 className="text-[#c4c5d9] font-bold text-xs uppercase tracking-widest mb-6 flex items-center justify-between">
                Keyword Density Matching
                <span className={analysis.keyword_match?.match_percentage>=70?'text-[#00daf3]':'text-[#ffb4ab]'}>{analysis.keyword_match?.match_percentage>=70?'Strong':'Needs Work'}</span>
              </h4>
              <div className="space-y-4">
                {analysis.category_scores?.slice(0,4).map((c:any) => (
                  <div key={c.category}>
                    <div className="flex justify-between text-xs mb-1.5"><span className="text-[#e1e2eb]">{c.category}</span><span className="text-[#c4c5d9]">{c.score}/10</span></div>
                    <div className="h-1.5 w-full bg-[#272a31]/50 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${c.score>=8?'bg-[#00daf3]':c.score>=6?'bg-[#cdbdff]':'bg-[#ffb4ab]'}`} style={{width:`${c.score*10}%`}} />
                    </div>
                  </div>
                ))}
              </div>
              {analysis.keyword_match?.missing?.length>0 && <button onClick={() => setTab('overview')} className="mt-8 text-[#cdbdff] font-bold text-xs uppercase tracking-widest hover:underline flex items-center gap-1">View all {analysis.keyword_match.missing.length} missing keywords <span className="material-symbols-outlined text-sm">arrow_forward</span></button>}
            </div>

            <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center" style={{background:'rgba(82,3,213,0.1)',borderColor:'rgba(205,189,255,0.1)'}}>
              <div className="w-12 h-12 bg-[#cdbdff]/20 rounded-xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[#cdbdff]" style={{fontVariationSettings:"'FILL' 1"}}>auto_awesome</span>
              </div>
              <h4 className="text-sm font-bold text-[#c0acff] mb-2">AI Rewrite</h4>
              <p className="text-xs text-[#c0acff]/70 mb-6">Optimize bullets for higher ATS scores and readability.</p>
              <button onClick={doGen} disabled={ging} className="w-full py-2.5 rounded-lg bg-[#cdbdff] text-[#20005f] text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {ging?<><Loader2 className="h-3 w-3 animate-spin"/>Generating...</>:'Open AI Editor'}
              </button>
            </div>
          </div>}

          {/* Actions after generation */}
          {gen && <div className="flex flex-wrap gap-3">
            <button onClick={doSave} disabled={svd} className={`kinetic-btn-ghost px-5 py-2.5 text-sm flex items-center gap-2 ${svd?'border-[#00daf3]/30 text-[#00daf3]':''}`}>
              <span className="material-symbols-outlined text-sm">{svd?'check_circle':'save'}</span>{svd?'Saved':'Save Version'}
            </button>
            <button onClick={() => goTo('/cover-letter', { cl_jd: jd, cl_title: jt, cl_company: co })} className="kinetic-btn-ghost px-5 py-2.5 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-sm">auto_stories</span>Cover Letter</button>
            <button onClick={() => goTo('/interview-prep', { interview_jd: jd, interview_title: jt, interview_company: co })} className="kinetic-btn-ghost px-5 py-2.5 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-sm">quiz</span>Interview Prep</button>
          </div>}

          {err && <div className="glass-panel rounded-2xl p-4 border-[#ffb4ab]/20 bg-[#93000a]/10 text-sm text-[#ffb4ab] flex items-center gap-2"><span className="material-symbols-outlined">error</span>{err}</div>}
        </div>

        {/* Right: Live Preview */}
        <div className="col-span-12 lg:col-span-5">
          <div className="sticky top-8">
            <div className="glass-card rounded-2xl p-2 overflow-hidden" style={{boxShadow:'inset 0 0 40px rgba(187,195,255,0.03), 0 25px 50px -12px rgba(0,0,0,0.5)'}}>
              <div className="flex items-center justify-between px-4 py-3 rounded-t-xl" style={{background:'rgba(39,42,49,0.3)'}}>
                <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab]/40" /><div className="w-2.5 h-2.5 rounded-full bg-[#00daf3]/40" /><div className="w-2.5 h-2.5 rounded-full bg-[#cdbdff]/40" /></div>
                <span className="text-[10px] font-bold text-[#c4c5d9] uppercase tracking-widest">{gen ? 'Optimized Resume' : 'Live Document Preview'}</span>
                <div className="flex gap-2"><button className="p-1 hover:bg-white/10 rounded"><span className="material-symbols-outlined text-sm">zoom_in</span></button></div>
              </div>

              <div className="bg-white p-8 rounded-b-xl overflow-y-auto text-slate-800" style={{aspectRatio:'1/1.414',maxHeight:'700px'}}>
                {gen ? (
                  <div>
                    <div className="border-b-2 border-slate-900 pb-3 mb-5">
                      <h1 className="text-xl font-black uppercase tracking-tight">{gen.name}</h1>
                      <p className="text-[11px] font-semibold text-slate-500 mt-1">{[gen.email,gen.phone,gen.location].filter(Boolean).join(' • ')}</p>
                    </div>
                    {gen.summary && <div className="mb-5"><h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 border-b border-slate-100 pb-1">Professional Summary</h3><p className="text-[10px] leading-relaxed text-slate-600">{gen.summary}</p></div>}
                    {gen.skills_grouped && Object.keys(gen.skills_grouped).length>0 && <div className="mb-5"><h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 border-b border-slate-100 pb-1">Technical Skills</h3>{Object.entries(gen.skills_grouped).map(([c,s]) => Array.isArray(s)&&s.length?<p key={c} className="text-[10px] text-slate-600 mb-0.5"><span className="font-bold">{c}:</span> {(s as string[]).join(', ')}</p>:null)}</div>}
                    {gen.experience?.length>0 && <div className="mb-5"><h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 border-b border-slate-100 pb-1">Experience</h3>{gen.experience.map((e:any,i:number) => (<div key={i} className="mb-3"><div className="flex justify-between items-baseline"><h4 className="text-[10px] font-bold text-slate-800">{e.title} @ {e.company}</h4><span className="text-[9px] text-slate-400">{e.dates}</span></div><ul className="mt-1 space-y-1 list-disc ml-3">{e.bullets?.map((b:string,j:number) => <li key={j} className="text-[9px] text-slate-600">{b}</li>)}</ul></div>))}</div>}
                    {gen.education?.length>0 && <div><h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 border-b border-slate-100 pb-1">Education</h3>{gen.education.map((e:any,i:number) => <div key={i}><p className="text-[10px] font-bold text-slate-800">{e.degree} — {e.institution}</p><p className="text-[9px] text-slate-400">{e.dates}</p></div>)}</div>}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    {aing?<div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-[#3c59fd] mx-auto"/><p className="mt-3 text-sm text-slate-400">Analyzing resume...</p></div>
                    :ging?<div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-[#5203d5] mx-auto"/><p className="mt-3 text-sm text-slate-400">Optimizing...</p></div>
                    :<p className="text-sm text-slate-300 italic">Upload resume and paste JD to begin</p>}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 glass-card p-4 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-[#00daf3]">info</span>
              <p className="text-xs text-[#c4c5d9] leading-relaxed">Changes in the editor are reflected in exports. Use <span className="text-[#bbc3ff] font-bold">AI Editor</span> to apply matching keywords.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
