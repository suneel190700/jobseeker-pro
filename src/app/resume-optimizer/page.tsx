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
  const bar = (s:number,m:number=100) => { const p=m===10?s*10:s; return p>=80?'bg-green-500/100':p>=60?'bg-[rgba(217,119,6,0.10)]0':'bg-[rgba(220,38,38,0.10)]0'; };
  const scC = (s:number) => s>=80?'text-green-400 bg-green-500/10':s>=60?'text-[var(--warning)] bg-[rgba(217,119,6,0.10)]':'text-[var(--destructive)] bg-[rgba(220,38,38,0.10)]';

  return (
    <div>
      <p className="page-eyebrow">Resume AI</p>
      <h1 className="title-1 mt-1">Resume optimizer</h1>
      <p className="subhead mt-1">{jt || 'ATS audit, AI rewrite, and export.'}</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
          {profile && <div className="rounded-[var(--radius-lg)] border border-[var(--separator)] p-3"><p className="text-xs font-medium text-[var(--text-tertiary)] mb-2">Resume</p><div className="flex gap-2"><button type="button" onClick={() => { setUseBR(true); setFile(null); }} className={['flex-1 rounded-[var(--radius-md)] border px-3 py-2 text-xs font-semibold transition', useBR?'border-[var(--accent-dim-strong)] bg-[var(--accent-dim)] text-[var(--accent)]':'border-[var(--separator)] text-[var(--text-secondary)]'].join(' ')}>Base</button><button type="button" onClick={() => setUseBR(false)} className={['flex-1 rounded-[var(--radius-md)] border px-3 py-2 text-xs font-semibold transition', !useBR?'border-[var(--accent-dim-strong)] bg-[var(--accent-dim)] text-[var(--accent)]':'border-[var(--separator)] text-[var(--text-secondary)]'].join(' ')}>Upload</button></div>{useBR && <p className="mt-1 text-[10px] text-[var(--success)]"><CheckCircle2 className="h-3 w-3 inline" /> {profile.fileName}</p>}</div>}
          {!useBR && <div {...getRootProps()} className={['flex flex-col items-center rounded-[var(--radius-lg)] border-2 border-dashed p-5 text-center cursor-pointer transition', isDragActive?'border-[var(--accent)]/50 bg-[var(--accent-dim)]':file?'border-[var(--success)]/40 bg-[var(--success)]/10':'border-[var(--separator)]'].join(' ')}><input {...getInputProps()} />{file?<p className="text-xs text-[var(--success)]">{file.name}</p>:<p className="text-xs text-[var(--text-tertiary)]">Drop resume</p>}</div>}
          <textarea rows={5} value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste full JD..." className="input-hig" />
          <button type="button" onClick={doAudit} disabled={!ok||aing} className="w-full btn-filled !min-h-0 py-2.5 disabled:opacity-50 flex items-center justify-center gap-2">{aing?<><Loader2 className="h-4 w-4 animate-spin" />Analyzing...</>:<><Target className="h-4 w-4" />{analysis?'Re-run audit':'Run ATS audit'}</>}</button>
          {ok && <div className="rounded-[var(--radius-lg)] border border-[rgba(139,157,255,0.35)] bg-[rgba(139,157,255,0.08)] p-4 space-y-3">
            <div><h3 className="text-sm font-semibold text-[var(--accent-secondary)]"><Sparkles className="h-4 w-4 inline mr-1" />AI rewriter</h3><p className="text-[10px] text-[var(--text-secondary)]">Deep JD analysis + tone + ATS-friendly structure</p></div>
            <button type="button" onClick={doGen} disabled={ging} className="w-full btn-tinted !min-h-0 py-2.5 border-[var(--accent-secondary)]/35 text-[var(--accent-secondary)] disabled:opacity-50 flex items-center justify-center gap-2">{ging?<><Loader2 className="h-4 w-4 animate-spin" />Optimizing...</>:<><Sparkles className="h-4 w-4" />{analysis?'Generate':'Skip audit — generate'}</>}</button>
            {gen && <>
              {analysis?.overall_score && gen.ats_match_summary?.estimated_score && <div className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] border border-[var(--separator)] p-3 flex items-center gap-3"><div className="text-center"><p className="text-[10px] text-[var(--text-tertiary)]">Before</p><p className="text-lg font-bold text-[var(--warning)]">{analysis.overall_score}</p></div><TrendingUp className="h-5 w-5 text-[var(--success)]" /><div className="text-center"><p className="text-[10px] text-[var(--text-tertiary)]">After</p><p className="text-lg font-bold text-[var(--success)]">{gen.ats_match_summary.estimated_score}</p></div><span className="ml-auto rounded-full bg-[var(--success)]/15 px-2 py-0.5 text-xs font-bold text-[var(--success)]">+{gen.ats_match_summary.estimated_score - analysis.overall_score}</span></div>}
              {gen.jd_analysis && <div className="rounded-2xl bg-[var(--surface-2)] p-2 text-[10px] text-[var(--text-tertiary)]"><span className="font-medium">Detected:</span> {gen.jd_analysis.company_type} / {gen.jd_analysis.role_level}</div>}
              <div className="flex gap-2"><button type="button" onClick={() => doDL('docx')} disabled={dling} className="flex-1 btn-filled btn-sm !min-h-0 bg-[linear-gradient(135deg,var(--success),var(--accent))] disabled:opacity-50 flex items-center justify-center gap-1"><Download className="h-3 w-3" /> DOCX</button><button type="button" onClick={() => doDL('pdf')} disabled={dling} className="flex-1 btn-filled btn-sm !min-h-0 disabled:opacity-50 flex items-center justify-center gap-1"><Download className="h-3 w-3" /> PDF</button></div>
              <div className="flex gap-2"><button type="button" onClick={doSave} disabled={svd} className={['flex-1 rounded-[var(--radius-md)] border px-3 py-2 text-xs font-semibold transition flex items-center justify-center gap-1', svd?'border-[var(--success)]/30 bg-[var(--success)]/10 text-[var(--success)]':'border-[var(--separator)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'].join(' ')}>{svd?<CheckCircle2 className="h-3 w-3" />:<Save className="h-3 w-3" />} {svd?'Saved':'Save version'}</button><button type="button" onClick={() => goTo('/cover-letter', { cl_jd: jd, cl_title: jt, cl_company: co })} className="flex-1 rounded-[var(--radius-md)] border border-[var(--success)]/30 bg-[var(--success)]/10 px-3 py-2 text-xs font-semibold text-[var(--success)] hover:bg-[var(--success)]/15 transition flex items-center justify-center gap-1"><FileSignature className="h-3 w-3" /> Cover letter</button></div>
              <button type="button" onClick={() => goTo('/interview-prep', { interview_jd: jd, interview_title: jt, interview_company: co })} className="w-full rounded-[var(--radius-md)] border border-[var(--info)]/30 bg-[rgba(96,165,250,0.1)] px-3 py-2 text-xs font-semibold text-[var(--info)] hover:bg-[rgba(96,165,250,0.16)] transition flex items-center justify-center gap-1"><MessageSquare className="h-3 w-3" /> Interview prep</button>
            </>}
          </div>}
          {analysis && gen && <div className="flex gap-2"><button type="button" onClick={() => setPanel('audit')} className={['flex-1 rounded-[var(--radius-md)] border px-3 py-1.5 text-xs font-semibold transition', panel==='audit'?'border-[var(--accent-dim-strong)] bg-[var(--accent-dim)] text-[var(--accent)]':'border-[var(--separator)] text-[var(--text-secondary)]'].join(' ')}>Audit</button><button type="button" onClick={() => setPanel('preview')} className={['flex-1 rounded-[var(--radius-md)] border px-3 py-1.5 text-xs font-semibold transition', panel==='preview'?'border-[rgba(139,157,255,0.35)] bg-[rgba(139,157,255,0.1)] text-[var(--accent-secondary)]':'border-[var(--separator)] text-[var(--text-secondary)]'].join(' ')}>Preview</button></div>}
          {err && <div className="rounded-2xl bg-[rgba(220,38,38,0.10)] p-3 text-sm text-[var(--destructive)] flex items-center gap-2"><XCircle className="h-4 w-4" />{err}</div>}
        </div>
        <div className="lg:col-span-3 rounded-2xl border border-[var(--separator)] p-5 min-h-[600px] overflow-y-auto max-h-[calc(100vh-120px)]">
          {panel==='preview' && gen ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-[var(--accent-secondary)]">Optimized resume</h2>{gen.ats_match_summary && <span className="rounded-full bg-[var(--success)]/15 text-[var(--success)] border border-[var(--success)]/25 px-3 py-1 text-xs font-bold">{gen.ats_match_summary.estimated_score}%</span>}{gen.page_count && <span className="text-[10px] text-[var(--text-tertiary)]">{gen.page_count}pg</span>}</div>
              <div className="text-center border-b pb-3"><h1 className="text-xl font-bold text-[var(--text-primary)]">{gen.name}</h1><p className="text-[10px] text-[var(--text-tertiary)] mt-1">{[gen.email,gen.phone,gen.location,gen.linkedin,gen.github].filter(Boolean).join(' | ')}</p></div>
              {gen.summary && <div><h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide border-b border-[var(--separator)] pb-1 mb-1">Summary</h3><p className="text-xs text-[var(--text-secondary)] leading-relaxed">{gen.summary}</p></div>}
              {gen.skills_grouped && Object.keys(gen.skills_grouped).length > 0 ? (
                <div><h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide border-b border-[var(--separator)] pb-1 mb-1">Technical Skills</h3>{Object.entries(gen.skills_grouped).map(([c,s]) => Array.isArray(s) && s.length > 0 ? <p key={c} className="text-xs text-[var(--text-secondary)] mb-0.5"><span className="font-semibold">{c}:</span> {(s as string[]).join(', ')}</p> : null)}</div>
              ) : gen.skills?.length > 0 && <div><h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide border-b border-[var(--separator)] pb-1 mb-1">Skills</h3><p className="text-xs text-[var(--text-secondary)]">{gen.skills.join(' • ')}</p></div>}
              {gen.experience?.map((e: any, i: number) => (<div key={i}>{i===0 && <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide border-b border-[var(--separator)] pb-1 mb-1">Experience</h3>}<div className="mb-3"><div className="flex justify-between"><p className="text-xs font-bold text-[var(--text-secondary)]">{e.company}</p><p className="text-[10px] text-[var(--text-tertiary)]">{e.dates}</p></div><p className="text-xs italic text-[var(--text-secondary)]">{e.title}</p><ul className="mt-1 space-y-0.5">{e.bullets?.map((b:string,j:number) => <li key={j} className="text-xs text-[var(--text-secondary)] pl-3 relative before:content-['-'] before:absolute before:left-0 before:text-[var(--text-tertiary)]">{b}</li>)}</ul></div></div>))}
              {gen.education?.map((e: any, i: number) => (<div key={i}>{i===0 && <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide border-b border-[var(--separator)] pb-1 mb-1">Education</h3>}<p className="text-xs font-bold text-[var(--text-secondary)]">{e.institution}</p><p className="text-xs text-[var(--text-secondary)]">{e.degree}</p></div>))}
              {gen.certifications?.filter(Boolean).length>0 && <div><h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide border-b border-[var(--separator)] pb-1 mb-1">Certifications</h3>{gen.certifications.filter(Boolean).map((c:string,i:number) => <p key={i} className="text-xs text-[var(--text-secondary)]">- {c}</p>)}</div>}
              {gen.ats_match_summary && <div className="rounded-[var(--radius-lg)] bg-[var(--success)]/10 border border-[var(--success)]/25 p-3 mt-2"><h4 className="text-[10px] font-bold text-[var(--success)] uppercase">ATS match</h4>{gen.ats_match_summary.matched_keywords?.length>0 && <div className="mt-1 flex flex-wrap gap-1">{gen.ats_match_summary.matched_keywords.slice(0,25).map((k:string) => <span key={k} className="rounded-full bg-[var(--surface-2)] px-1.5 py-0.5 text-[8px] text-[var(--success)] border border-[var(--success)]/20">{k}</span>)}</div>}</div>}
            </div>
          ) : !analysis ? (
            <div className="flex h-full items-center justify-center text-sm text-[var(--text-tertiary)]">{aing?<div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-[var(--success)] mx-auto" /><p className="mt-3">Analyzing...</p></div>:ging?<div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto" /><p className="mt-3">Optimizing...</p></div>:'Run audit or generate.'}</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4"><div className={['flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold', scC(analysis.overall_score)].join(' ')}>{analysis.overall_score}</div><div className="flex-1"><p className="text-sm font-medium text-[var(--text-primary)]">{analysis.score_summary}</p><p className="text-xs text-[var(--destructive)] mt-0.5">{analysis.score_weakness}</p></div></div>
              <div className="flex gap-1 border-b border-[var(--separator)]">{[{k:'overview',l:'Keywords'},{k:'categories',l:'Scores'},{k:'fixes',l:'Fixes',c:analysis.priority_fixes?.length},{k:'bullets',l:'Rewrites',c:analysis.weak_bullets?.length}].map((t:any) => <button type="button" key={t.k} onClick={() => setTab(t.k)} className={['px-3 py-1.5 text-xs font-semibold border-b-2 transition', tab===t.k?'border-[var(--accent)] text-[var(--accent)]':'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'].join(' ')}>{t.l}{t.c?<span className="ml-1 text-[9px] bg-[var(--destructive)]/12 text-[var(--destructive)] rounded-full px-1">{t.c}</span>:null}</button>)}</div>
              <div className="overflow-y-auto max-h-[420px]">
                {tab==='overview' && analysis.keyword_match && <div className="space-y-3"><div><h3 className="text-sm font-semibold text-[var(--text-secondary)]">Keywords ({analysis.keyword_match.match_percentage}%)</h3><div className="mt-1 h-2 rounded-full bg-[var(--surface-2)]"><div className={bar(analysis.keyword_match.match_percentage)} style={{width:`${analysis.keyword_match.match_percentage}%`,height:'100%',borderRadius:'9999px'}} /></div></div><div><p className="text-xs font-medium text-green-400 mb-1">Matched</p><div className="flex flex-wrap gap-1">{analysis.keyword_match.matched?.map((k:string) => <span key={k} className="inline-flex items-center gap-0.5 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] text-green-400"><CheckCircle2 className="h-2.5 w-2.5" />{k}</span>)}</div></div><div><p className="text-xs font-medium text-[var(--destructive)] mb-1">Missing</p><div className="flex flex-wrap gap-1">{analysis.keyword_match.missing?.map((k:string) => <span key={k} className="inline-flex items-center gap-0.5 rounded-full bg-[rgba(220,38,38,0.10)] px-2 py-0.5 text-[10px] text-[var(--destructive)]"><AlertTriangle className="h-2.5 w-2.5" />{k}</span>)}</div></div></div>}
                {tab==='categories' && analysis.category_scores?.map((c:any) => <div key={c.category} className="rounded-2xl border border-[var(--separator)] p-3 mb-2"><div className="flex items-center justify-between"><span className="text-xs font-medium text-[var(--text-secondary)]">{c.category}</span><span className={['text-sm font-bold',c.score>=8?'text-green-400':c.score>=6?'text-[var(--warning)]':'text-[var(--destructive)]'].join(' ')}>{c.score}/10</span></div><div className="mt-1 h-1 rounded-full bg-[var(--surface-2)]"><div className={bar(c.score,10)} style={{width:`${c.score*10}%`,height:'100%',borderRadius:'9999px'}} /></div><p className="mt-1 text-[10px] text-[var(--text-tertiary)]">{c.explanation}</p>{c.fixes?.map((f:string,i:number) => <p key={i} className="text-[10px] text-[var(--text-secondary)] mt-0.5">→ {f}</p>)}</div>)}
                {tab==='fixes' && analysis.priority_fixes?.map((f:any) => <div key={f.rank} className="rounded-2xl border border-[var(--separator)] p-3 mb-2 flex gap-2"><div className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(220,38,38,0.10)] text-[10px] font-bold text-[var(--destructive)]">{f.rank}</div><div><p className="text-xs font-semibold text-[var(--text-secondary)]">{f.section}</p><p className="text-[10px] text-[var(--text-secondary)]">{f.action}</p></div></div>)}
                {tab==='bullets' && analysis.weak_bullets?.map((b:any,i:number) => <div key={i} className="rounded-2xl border border-[var(--separator)] p-3 mb-2"><p className="text-[9px] text-[var(--destructive)] uppercase font-medium">Original</p><p className="text-xs text-[var(--text-secondary)]">{b.original}</p><p className="text-[9px] text-green-400 uppercase font-medium mt-1">Rewritten</p><p className="text-xs text-[var(--text-secondary)] font-medium">{b.rewritten}</p></div>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
