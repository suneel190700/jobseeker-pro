'use client';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, CheckCircle2, AlertTriangle, XCircle, Zap, Download, Sparkles, Target, ArrowRight, TrendingUp, FileSignature, MessageSquare, Save } from 'lucide-react';
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
  const [dfmt, setDfmt] = useState<'docx'|'pdf'>('docx');
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
      setGen((await r.json()).resume); setPanel('preview'); toast.success('Resume optimized!');
    } catch (e: any) { setErr(e.message); } finally { setGing(false); }
  };

  const doDL = async (fmt: 'docx'|'pdf') => {
    if (!gen) return; setDling(true); setDfmt(fmt);
    try { const r = await fetch('/api/resume/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resume: gen }) });
      if (!r.ok) throw new Error('Failed'); const b = await r.blob(); const u = URL.createObjectURL(b);
      const a = document.createElement('a'); a.href = u; a.download = `optimized_resume.${fmt}`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u);
      toast.success(`${fmt.toUpperCase()} downloaded!`);
    } catch (e: any) { setErr(e.message); } finally { setDling(false); }
  };

  const doSave = () => { if (!gen) return; saveVersion(jt||'Untitled', jt, co, gen, gen.ats_match_summary?.estimated_score||0, analysis?.overall_score||0); setSvd(true); toast.success('Version saved!'); };
  const goTo = (p: string, d: Record<string,string>) => { Object.entries(d).forEach(([k,v]) => sessionStorage.setItem(k,v)); router.push(p); };
  const bar = (s:number,m:number=100) => { const p=m===10?s*10:s; return p>=80?'bg-green-900/200':p>=60?'bg-amber-900/200':'bg-red-900/200'; };
  const scC = (s:number) => s>=80?'text-green-400 bg-green-900/20':s>=60?'text-amber-400 bg-amber-900/20':'text-red-400 bg-red-900/20';

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Resume Optimizer</h1>
      <p className="mt-1 text-sm text-zinc-400">{jt || 'ATS audit + AI rewrite + download.'}</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
          {profile && <div className="rounded-lg border border-zinc-800 p-3"><p className="text-xs font-medium text-zinc-400 mb-2">Resume</p><div className="flex gap-2"><button onClick={() => { setUseBR(true); setFile(null); }} className={['flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition', useBR?'border-indigo-500/30 bg-indigo-500/10 text-indigo-400':'border-zinc-800 text-zinc-400'].join(' ')}>Base</button><button onClick={() => setUseBR(false)} className={['flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition', !useBR?'border-indigo-500/30 bg-indigo-500/10 text-indigo-400':'border-zinc-800 text-zinc-400'].join(' ')}>Upload</button></div>{useBR && <p className="mt-1 text-[10px] text-green-400"><CheckCircle2 className="h-3 w-3 inline" /> {profile.fileName}</p>}</div>}
          {!useBR && <div {...getRootProps()} className={['flex flex-col items-center rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition', isDragActive?'border-indigo-500/30 bg-indigo-500/10':file?'border-emerald-500/30 bg-green-900/20':'border-zinc-700'].join(' ')}><input {...getInputProps()} />{file?<p className="text-xs text-green-400">{file.name}</p>:<p className="text-xs text-zinc-400">Drop resume</p>}</div>}
          <textarea rows={5} value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste full JD..." className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-indigo-500/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/30" />
          <button onClick={doAudit} disabled={!ok||aing} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition flex items-center justify-center gap-2">{aing?<><Loader2 className="h-4 w-4 animate-spin" />Analyzing...</>:<><Target className="h-4 w-4" />{analysis?'Re-run Audit':'Run ATS Audit'}</>}</button>
          {ok && <div className="rounded-xl border-2 border-purple-800/30 bg-purple-900/20/50 p-4 space-y-3">
            <div><h3 className="text-sm font-semibold text-purple-300"><Sparkles className="h-4 w-4 inline mr-1" />AI Rewriter</h3><p className="text-[10px] text-purple-400">Deep JD analysis + adaptive tone + ATS 95+ target</p></div>
            <button onClick={doGen} disabled={ging} className="w-full rounded-lg bg-violet-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition flex items-center justify-center gap-2">{ging?<><Loader2 className="h-4 w-4 animate-spin" />Optimizing...</>:<><Sparkles className="h-4 w-4" />{analysis?'Generate':'Skip Audit — Generate'}</>}</button>
            {gen && <>
              {analysis?.overall_score && gen.ats_match_summary?.estimated_score && <div className="rounded-lg bg-zinc-900 border border-purple-800/20 p-3 flex items-center gap-3"><div className="text-center"><p className="text-[10px] text-zinc-500">Before</p><p className="text-lg font-bold text-amber-400">{analysis.overall_score}</p></div><TrendingUp className="h-5 w-5 text-green-500" /><div className="text-center"><p className="text-[10px] text-zinc-500">After</p><p className="text-lg font-bold text-green-400">{gen.ats_match_summary.estimated_score}</p></div><span className="ml-auto rounded-full bg-green-900/20 px-2 py-0.5 text-xs font-bold text-green-400">+{gen.ats_match_summary.estimated_score - analysis.overall_score}</span></div>}
              {gen.jd_analysis && <div className="rounded-lg bg-zinc-900 p-2 text-[10px] text-zinc-400"><span className="font-medium">Detected:</span> {gen.jd_analysis.company_type} / {gen.jd_analysis.role_level}</div>}
              <div className="flex gap-2"><button onClick={() => doDL('docx')} disabled={dling} className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition flex items-center justify-center gap-1"><Download className="h-3 w-3" /> DOCX</button><button onClick={() => doDL('pdf')} disabled={dling} className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition flex items-center justify-center gap-1"><Download className="h-3 w-3" /> PDF</button></div>
              <div className="flex gap-2"><button onClick={doSave} disabled={svd} className={['flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition flex items-center justify-center gap-1', svd?'border-green-800/30 bg-green-900/20 text-green-400':'border-zinc-800 text-zinc-300 hover:bg-zinc-900'].join(' ')}>{svd?<CheckCircle2 className="h-3 w-3" />:<Save className="h-3 w-3" />} {svd?'Saved':'Save Version'}</button><button onClick={() => goTo('/cover-letter', { cl_jd: jd, cl_title: jt, cl_company: co })} className="flex-1 rounded-lg border border-green-800/30 bg-green-900/20 px-3 py-2 text-xs font-medium text-green-400 hover:bg-green-900/30 transition flex items-center justify-center gap-1"><FileSignature className="h-3 w-3" /> Cover Letter</button></div>
              <button onClick={() => goTo('/interview-prep', { interview_jd: jd, interview_title: jt, interview_company: co })} className="w-full rounded-lg border border-blue-800/30 bg-blue-900/20 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 transition flex items-center justify-center gap-1"><MessageSquare className="h-3 w-3" /> Interview Prep</button>
            </>}
          </div>}
          {analysis && gen && <div className="flex gap-2"><button onClick={() => setPanel('audit')} className={['flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition', panel==='audit'?'border-indigo-500/30 bg-indigo-500/10 text-indigo-400':'border-zinc-800 text-zinc-400'].join(' ')}>Audit</button><button onClick={() => setPanel('preview')} className={['flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition', panel==='preview'?'border-violet-500/30 bg-purple-900/20 text-purple-400':'border-zinc-800 text-zinc-400'].join(' ')}>Preview</button></div>}
          {err && <div className="rounded-lg bg-red-900/20 p-3 text-sm text-red-400 flex items-center gap-2"><XCircle className="h-4 w-4" />{err}</div>}
        </div>
        <div className="lg:col-span-3 rounded-xl border border-zinc-800 p-5 min-h-[600px] overflow-y-auto max-h-[calc(100vh-120px)]">
          {panel==='preview' && gen ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-purple-400">Optimized Resume</h2>{gen.ats_match_summary && <span className="rounded-full bg-green-900/30 text-green-400 px-3 py-1 text-xs font-bold">{gen.ats_match_summary.estimated_score}%</span>}{gen.page_count && <span className="text-[10px] text-zinc-500">{gen.page_count}pg</span>}</div>
              <div className="text-center border-b pb-3"><h1 className="text-xl font-bold text-white">{gen.name}</h1><p className="text-[10px] text-zinc-400 mt-1">{[gen.email,gen.phone,gen.location,gen.linkedin,gen.github].filter(Boolean).join(' | ')}</p></div>
              {gen.summary && <div><h3 className="text-[10px] font-bold text-zinc-300 uppercase tracking-wide border-b border-zinc-800 pb-1 mb-1">Summary</h3><p className="text-xs text-zinc-300 leading-relaxed">{gen.summary}</p></div>}
              {gen.skills_grouped && Object.keys(gen.skills_grouped).length > 0 ? (
                <div><h3 className="text-[10px] font-bold text-zinc-300 uppercase tracking-wide border-b border-zinc-800 pb-1 mb-1">Technical Skills</h3>{Object.entries(gen.skills_grouped).map(([c,s]) => Array.isArray(s) && s.length > 0 ? <p key={c} className="text-xs text-zinc-300 mb-0.5"><span className="font-semibold">{c}:</span> {(s as string[]).join(', ')}</p> : null)}</div>
              ) : gen.skills?.length > 0 && <div><h3 className="text-[10px] font-bold text-zinc-300 uppercase tracking-wide border-b border-zinc-800 pb-1 mb-1">Skills</h3><p className="text-xs text-zinc-300">{gen.skills.join(' • ')}</p></div>}
              {gen.experience?.map((e: any, i: number) => (<div key={i}>{i===0 && <h3 className="text-[10px] font-bold text-zinc-300 uppercase tracking-wide border-b border-zinc-800 pb-1 mb-1">Experience</h3>}<div className="mb-3"><div className="flex justify-between"><p className="text-xs font-bold text-zinc-200">{e.company}</p><p className="text-[10px] text-zinc-500">{e.dates}</p></div><p className="text-xs italic text-zinc-300">{e.title}</p><ul className="mt-1 space-y-0.5">{e.bullets?.map((b:string,j:number) => <li key={j} className="text-xs text-zinc-300 pl-3 relative before:content-['-'] before:absolute before:left-0 before:text-zinc-500">{b}</li>)}</ul></div></div>))}
              {gen.education?.map((e: any, i: number) => (<div key={i}>{i===0 && <h3 className="text-[10px] font-bold text-zinc-300 uppercase tracking-wide border-b border-zinc-800 pb-1 mb-1">Education</h3>}<p className="text-xs font-bold text-zinc-200">{e.institution}</p><p className="text-xs text-zinc-300">{e.degree}</p></div>))}
              {gen.certifications?.filter(Boolean).length>0 && <div><h3 className="text-[10px] font-bold text-zinc-300 uppercase tracking-wide border-b border-zinc-800 pb-1 mb-1">Certifications</h3>{gen.certifications.filter(Boolean).map((c:string,i:number) => <p key={i} className="text-xs text-zinc-300">- {c}</p>)}</div>}
              {gen.ats_match_summary && <div className="rounded-lg bg-green-900/20 border border-green-800/30 p-3 mt-2"><h4 className="text-[10px] font-bold text-green-400 uppercase">ATS Match</h4>{gen.ats_match_summary.matched_keywords?.length>0 && <div className="mt-1 flex flex-wrap gap-1">{gen.ats_match_summary.matched_keywords.slice(0,25).map((k:string) => <span key={k} className="rounded-full bg-green-900/30 px-1.5 py-0.5 text-[8px] text-green-400">{k}</span>)}</div>}</div>}
            </div>
          ) : !analysis ? (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">{aing?<div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-400 mx-auto" /><p className="mt-3">Analyzing...</p></div>:ging?<div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto" /><p className="mt-3">Optimizing...</p></div>:'Run audit or generate.'}</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4"><div className={['flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold', scC(analysis.overall_score)].join(' ')}>{analysis.overall_score}</div><div className="flex-1"><p className="text-sm font-medium text-white">{analysis.score_summary}</p><p className="text-xs text-red-400 mt-0.5">{analysis.score_weakness}</p></div></div>
              <div className="flex gap-1 border-b">{[{k:'overview',l:'Keywords'},{k:'categories',l:'Scores'},{k:'fixes',l:'Fixes',c:analysis.priority_fixes?.length},{k:'bullets',l:'Rewrites',c:analysis.weak_bullets?.length}].map((t:any) => <button key={t.k} onClick={() => setTab(t.k)} className={['px-3 py-1.5 text-xs font-medium border-b-2 transition', tab===t.k?'border-indigo-500 text-indigo-400':'border-transparent text-zinc-500'].join(' ')}>{t.l}{t.c?<span className="ml-1 text-[9px] bg-red-900/20 text-red-400 rounded-full px-1">{t.c}</span>:null}</button>)}</div>
              <div className="overflow-y-auto max-h-[420px]">
                {tab==='overview' && analysis.keyword_match && <div className="space-y-3"><div><h3 className="text-sm font-semibold text-zinc-300">Keywords ({analysis.keyword_match.match_percentage}%)</h3><div className="mt-1 h-2 rounded-full bg-zinc-800"><div className={bar(analysis.keyword_match.match_percentage)} style={{width:`${analysis.keyword_match.match_percentage}%`,height:'100%',borderRadius:'9999px'}} /></div></div><div><p className="text-xs font-medium text-green-400 mb-1">Matched</p><div className="flex flex-wrap gap-1">{analysis.keyword_match.matched?.map((k:string) => <span key={k} className="inline-flex items-center gap-0.5 rounded-full bg-green-900/20 px-2 py-0.5 text-[10px] text-green-400"><CheckCircle2 className="h-2.5 w-2.5" />{k}</span>)}</div></div><div><p className="text-xs font-medium text-red-400 mb-1">Missing</p><div className="flex flex-wrap gap-1">{analysis.keyword_match.missing?.map((k:string) => <span key={k} className="inline-flex items-center gap-0.5 rounded-full bg-red-900/20 px-2 py-0.5 text-[10px] text-red-400"><AlertTriangle className="h-2.5 w-2.5" />{k}</span>)}</div></div></div>}
                {tab==='categories' && analysis.category_scores?.map((c:any) => <div key={c.category} className="rounded-lg border border-zinc-800 p-3 mb-2"><div className="flex items-center justify-between"><span className="text-xs font-medium text-zinc-200">{c.category}</span><span className={['text-sm font-bold',c.score>=8?'text-green-400':c.score>=6?'text-amber-400':'text-red-400'].join(' ')}>{c.score}/10</span></div><div className="mt-1 h-1 rounded-full bg-zinc-800"><div className={bar(c.score,10)} style={{width:`${c.score*10}%`,height:'100%',borderRadius:'9999px'}} /></div><p className="mt-1 text-[10px] text-zinc-400">{c.explanation}</p>{c.fixes?.map((f:string,i:number) => <p key={i} className="text-[10px] text-zinc-300 mt-0.5">→ {f}</p>)}</div>)}
                {tab==='fixes' && analysis.priority_fixes?.map((f:any) => <div key={f.rank} className="rounded-lg border border-zinc-800 p-3 mb-2 flex gap-2"><div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-900/20 text-[10px] font-bold text-red-400">{f.rank}</div><div><p className="text-xs font-semibold text-zinc-200">{f.section}</p><p className="text-[10px] text-zinc-300">{f.action}</p></div></div>)}
                {tab==='bullets' && analysis.weak_bullets?.map((b:any,i:number) => <div key={i} className="rounded-lg border border-zinc-800 p-3 mb-2"><p className="text-[9px] text-red-400 uppercase font-medium">Original</p><p className="text-xs text-zinc-300">{b.original}</p><p className="text-[9px] text-green-500 uppercase font-medium mt-1">Rewritten</p><p className="text-xs text-zinc-200 font-medium">{b.rewritten}</p></div>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
