'use client';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2 } from 'lucide-react';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { useResumeVersions } from '@/hooks/useResumeVersions';
import { scoreResume, ATSResult } from '@/lib/ats-scorer';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => { const t = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return debounced;
}

export default function ResumeOptimizerPage() {
  const [file, setFile] = useState<File|null>(null);
  const [useBR, setUseBR] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [jd, setJd] = useState('');
  const [jt, setJt] = useState('');
  const [co, setCo] = useState('');
  const [ging, setGing] = useState(false);
  const [gen, setGen] = useState<any>(null);
  const [postScore, setPostScore] = useState<ATSResult|null>(null);
  const [aiScore, setAiScore] = useState<any>(null);
  const [aiScoring, setAiScoring] = useState(false);
  const [dling, setDling] = useState(false);
  const [err, setErr] = useState<string|null>(null);
  const [svd, setSvd] = useState(false);
  const [parsing, setParsing] = useState(false);
  const { profile } = useResumeProfile();
  const { saveVersion } = useResumeVersions();
  const router = useRouter();

  // Auto-load from session
  useEffect(() => {
    const j=sessionStorage.getItem('optimize_jd'), t=sessionStorage.getItem('optimize_title'), c=sessionStorage.getItem('optimize_company');
    if (j) { setJd(j); sessionStorage.removeItem('optimize_jd'); if (t) { setJt(t); sessionStorage.removeItem('optimize_title'); } if (c) { setCo(c); sessionStorage.removeItem('optimize_company'); } }
  }, []);

  // Auto-load resume text from profile
  useEffect(() => { if (profile?.text && !resumeText) { setResumeText(profile.text); setUseBR(true); } }, [profile]);

  // Parse uploaded file
  const onDrop = useCallback(async (f: File[]) => {
    if (!f[0]) return; setFile(f[0]); setUseBR(false); setGen(null); setErr(null); setSvd(false); setParsing(true);
    try {
      const fd = new FormData(); fd.append('resume', f[0]);
      const r = await fetch('/api/resume/parse', { method: 'POST', body: fd });
      if (!r.ok) throw new Error('Parse failed');
      setResumeText((await r.json()).text);
    } catch { toast.error('Failed to parse file'); } finally { setParsing(false); }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] }, maxFiles: 1 });

  // LIVE ATS SCORE - debounced
  const debouncedJd = useDebouncedValue(jd, 500);
  const debouncedResume = useDebouncedValue(resumeText, 500);
  const atsResult: ATSResult | null = useMemo(() => {
    if (!debouncedResume || !debouncedJd) return null;
    return scoreResume(debouncedResume, debouncedJd);
  }, [debouncedResume, debouncedJd]);

  const ok = resumeText.trim() && jd.trim();

  // Optimize
  const doRewrite = async () => {
    if (!ok) return; setGing(true); setErr(null); setSvd(false);
    try {
      const r = await fetch('/api/resume/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resumeText, jobDescription: jd, jobTitle: jt, company: co, userName: profile?.text?.split('\n')[0] }) });
      if (!r.ok) throw new Error((await r.json().catch(()=>({}))).error || 'Failed');
      const data = await r.json(); setGen(data.resume); toast.success('Resume optimized!');
      sessionStorage.setItem('optimized_resume', JSON.stringify(data.resume));
      // Re-score optimized resume - flatten JSON to plain text first
      const r2 = data.resume;
      const flatParts: string[] = [];
      if (r2.name) flatParts.push(r2.name);
      if (r2.email) flatParts.push(r2.email);
      if (r2.phone) flatParts.push(r2.phone);
      if (r2.location) flatParts.push(r2.location);
      if (r2.linkedin) flatParts.push(r2.linkedin);
      if (r2.summary) flatParts.push('SUMMARY', r2.summary);
      if (r2.skills_grouped) {
        flatParts.push('SKILLS');
        Object.entries(r2.skills_grouped).forEach(([cat, skills]) => {
          if (Array.isArray(skills)) flatParts.push(`${cat}: ${(skills as string[]).join(', ')}`);
        });
      }
      if (r2.experience?.length) {
        flatParts.push('EXPERIENCE');
        r2.experience.forEach((e: any) => {
          flatParts.push(`${e.title} - ${e.company}`);
          if (e.dates) flatParts.push(e.dates);
          if (e.bullets) e.bullets.forEach((b: string) => flatParts.push(`- ${b}`));
        });
      }
      if (r2.education?.length) {
      if (r2.projects?.length) {
        flatParts.push('PROJECTS');
        r2.projects.forEach((p: any) => {
          flatParts.push(p.name);
          if (p.technologies?.length) flatParts.push(`Technologies: ${p.technologies.join(', ')}`);
          if (p.bullets) p.bullets.forEach((b: string) => flatParts.push(`- ${b}`));
        });
      }
        flatParts.push('EDUCATION');
        r2.education.forEach((e: any) => {
          flatParts.push(`${e.degree} - ${e.institution}`);
          if (e.coursework?.length) flatParts.push(`Coursework: ${e.coursework.join(', ')}`);
        });
      }
      if (r2.certifications?.length) { flatParts.push('CERTIFICATIONS'); r2.certifications.filter(Boolean).forEach((c: string) => flatParts.push(c)); }
      const optimizedPlainText = flatParts.join('\n');
      const newScore = scoreResume(optimizedPlainText, jd);
      setPostScore(newScore);
      // Fire AI scoring in background (non-blocking)
      setAiScoring(true); setAiScore(null);
      fetch('/api/resume/score-ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resumeText: optimizedPlainText, jobDescription: jd }) })
        .then(r => r.json()).then(d => { if (!d.error) setAiScore(d); }).catch(() => {}).finally(() => setAiScoring(false));
    } catch (e: any) { setErr(e.message); } finally { setGing(false); }
  };

  const getFilename = () => {
    const name = gen?._filename || gen?.name?.replace(/[^a-zA-Z0-9]/g,'_').toLowerCase() || 'resume';
    const company = co ? `_${co.replace(/[^a-zA-Z0-9]/g,'_').toLowerCase()}` : '';
    const position = jt ? `_${jt.split(' ').slice(0,3).join('_').replace(/[^a-zA-Z0-9_]/g,'').toLowerCase()}` : '';
    return `${name}${company}${position}`;
  };

  const doDL = async (fmt: 'docx'|'pdf') => {
    if (!gen) return; setDling(true);
    try {
      const r = await fetch('/api/resume/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resume: gen, format: fmt, filename: getFilename() }) });
      if (!r.ok) throw new Error('Failed'); const b = await r.blob(); const u = URL.createObjectURL(b);
      const a = document.createElement('a'); a.href = u; a.download = `${getFilename()}.${fmt}`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u);
    } catch (e: any) { setErr(e.message); } finally { setDling(false); }
  };

  const doSave = () => {
    if (!gen) return;
    saveVersion(`${jt||'Untitled'} at ${co||'Company'}`, jt, co, gen, gen._pipeline?.quickScore || 92, atsResult?.overallScore || 0);
    setSvd(true); toast.success('Saved!');
  };

  const goTo = (p: string, d: Record<string,string>) => { Object.entries(d).forEach(([k,v]) => sessionStorage.setItem(k,v)); router.push(p); };

  const scoreColor = (s: number) => s >= 80 ? '#00daf3' : s >= 60 ? '#cdbdff' : '#ffb4ab';
  const scoreBg = (s: number) => s >= 80 ? 'rgba(0,218,243,0.1)' : s >= 60 ? 'rgba(205,189,255,0.1)' : 'rgba(255,180,171,0.1)';

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tighter text-[#bbc3ff]">Resume AI Optimizer</h2>
          <p className="text-[#c4c5d9] mt-1 text-sm">Analyze ATS gaps instantly. Optimize with AI for 90-93% score.</p>
        </div>
        {gen && <div className="flex gap-3">
          <button onClick={() => doDL('docx')} disabled={dling} className="kinetic-btn-ghost px-4 py-2 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-base">description</span>DOCX</button>
          <button onClick={() => doDL('pdf')} disabled={dling} className="kinetic-btn-ghost px-4 py-2 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-base">picture_as_pdf</span>PDF</button>
        </div>}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT: Input + Analysis */}
        <div className="col-span-12 lg:col-span-7 space-y-5">
          {/* Resume source */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="kinetic-label mb-0">Resume</label>
              {profile && <div className="flex gap-1 p-0.5 rounded-lg bg-black/20">
                <button onClick={() => { setUseBR(true); setFile(null); if (profile.text) setResumeText(profile.text); }} className={`px-3 py-1 rounded text-[10px] font-bold ${useBR?'bg-[#272a31] text-[#bbc3ff]':'text-[#8e90a2]'}`}>Profile</button>
                <button onClick={() => setUseBR(false)} className={`px-3 py-1 rounded text-[10px] font-bold ${!useBR?'bg-[#272a31] text-[#bbc3ff]':'text-[#8e90a2]'}`}>Upload</button>
              </div>}
            </div>
            {useBR && profile && <p className="text-xs text-[#00daf3] flex items-center gap-1"><span className="material-symbols-outlined text-xs" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>{profile.fileName || 'Base resume loaded'}</p>}
            {!useBR && <div {...getRootProps()} className={`flex items-center justify-center rounded-xl border-2 border-dashed p-4 cursor-pointer transition ${isDragActive?'border-[#bbc3ff]/40 bg-[#3c59fd]/10':file?'border-[#00daf3]/30':'border-[#434656]'}`}>
              <input {...getInputProps()} />
              {parsing?<Loader2 className="h-4 w-4 animate-spin text-[#bbc3ff]"/>:file?<p className="text-xs text-[#00daf3]">{file.name}</p>:<p className="text-xs text-[#8e90a2]">Drop PDF, DOCX, or TXT</p>}
            </div>}
          </div>

          {/* JD + Title + Company */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="kinetic-label">Job Title</label><input value={jt} onChange={e=>setJt(e.target.value)} placeholder="e.g. AI Engineer" className="kinetic-input" /></div>
              <div><label className="kinetic-label">Company</label><input value={co} onChange={e=>setCo(e.target.value)} placeholder="e.g. Google" className="kinetic-input" /></div>
            </div>
            <div><label className="kinetic-label">Job Description</label>
              <textarea rows={6} value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste the target Job Description..." className="kinetic-input resize-none text-sm" />
            </div>
          </div>

          {/* LIVE ATS ANALYSIS */}
          {atsResult && (
            <div className="glass-card rounded-2xl p-5 space-y-4">
              {/* Score Meter */}
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/>
                    <circle cx="40" cy="40" r="34" fill="transparent" stroke={scoreColor(atsResult.overallScore)} strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${2*Math.PI*34}`} strokeDashoffset={`${2*Math.PI*34 - (atsResult.overallScore/100)*2*Math.PI*34}`}
                      style={{transition:'stroke-dashoffset 0.8s ease'}}/>
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-black" style={{color:scoreColor(atsResult.overallScore)}}>{atsResult.overallScore}%</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-[#e1e2eb]">ATS Match Score</h3>
                  <p className="text-xs text-[#8e90a2] mt-0.5">Live analysis • {atsResult.totalJdKeywords} JD keywords detected</p>
                  {/* Sub-scores */}
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {[{l:'Keywords',v:atsResult.keywordScore},{l:'Placement',v:atsResult.placementScore},{l:'Structure',v:atsResult.structureScore},{l:'Density',v:atsResult.densityScore}].map(s=>(
                      <div key={s.l} className="text-center">
                        <div className="h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{width:`${s.v}%`,background:scoreColor(s.v)}}/></div>
                        <p className="text-[9px] text-[#8e90a2] mt-1">{s.l} {s.v}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Keyword chips */}
              {atsResult.matched.length>0 && <div>
                <p className="text-[10px] font-bold text-[#00daf3] uppercase tracking-widest mb-2">Matched ({atsResult.matched.length})</p>
                <div className="flex flex-wrap gap-1.5">{atsResult.matched.map(k=><span key={k} className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#007886]/15 text-[#00daf3] border border-[#00daf3]/20">{k}</span>)}</div>
              </div>}
              {atsResult.missing.length>0 && <div>
                <p className="text-[10px] font-bold text-[#ffb4ab] uppercase tracking-widest mb-2">Missing ({atsResult.missing.length})</p>
                <div className="flex flex-wrap gap-1.5">{atsResult.missing.map(k=><span key={k} className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#93000a]/15 text-[#ffb4ab] border border-[#ffb4ab]/20">{k}</span>)}</div>
              </div>}
              {atsResult.misplaced.length>0 && <div>
                <p className="text-[10px] font-bold text-[#cdbdff] uppercase tracking-widest mb-2">In Skills Only — Not in Experience ({atsResult.misplaced.length})</p>
                <div className="flex flex-wrap gap-1.5">{atsResult.misplaced.map(k=><span key={k} className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#5203d5]/15 text-[#cdbdff] border border-[#cdbdff]/20">{k}</span>)}</div>
              </div>}
              {atsResult.structureIssues.length>0 && <div>
                <p className="text-[10px] font-bold text-[#ffb4ab] uppercase tracking-widest mb-2">Structure Issues</p>
                <div className="space-y-1">{atsResult.structureIssues.map(i=><p key={i} className="text-xs text-[#ffb4ab]">• {i}</p>)}</div>
              </div>}
              {atsResult.stuffed.length>0 && <div>
                <p className="text-[10px] font-bold text-[#ffb4ab] uppercase tracking-widest mb-2">Keyword Stuffing Detected</p>
                <div className="flex flex-wrap gap-1.5">{atsResult.stuffed.map(k=><span key={k} className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#93000a]/15 text-[#ffb4ab]">{k}</span>)}</div>
              </div>}
            </div>
          )}

          {/* Optimize Button */}
          <button onClick={doRewrite} disabled={!ok||ging} className="kinetic-btn w-full py-3.5 text-sm disabled:opacity-50 flex items-center justify-center gap-2" style={{background:'linear-gradient(135deg, #5203d5, #3c59fd)'}}>
            {ging?<><Loader2 className="h-4 w-4 animate-spin"/>Optimizing with AI (20-30s)...</>:<><span className="material-symbols-outlined text-sm">auto_awesome</span>Optimize Resume{atsResult?` (${atsResult.overallScore}% → 90+%)`:''}</>}
          </button>

          {/* Post-gen: AI ATS Scores */}
          {gen && (aiScore || aiScoring || postScore) && atsResult && (
            <div className="glass-card rounded-2xl p-5 space-y-4">
              {/* Before → After with AI score */}
              <div className="flex items-center gap-5">
                <div className="text-center">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="5"/>
                      <circle cx="40" cy="40" r="34" fill="transparent" stroke={scoreColor(atsResult.overallScore)} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${2*Math.PI*34}`} strokeDashoffset={`${2*Math.PI*34 - (atsResult.overallScore/100)*2*Math.PI*34}`}/>
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-black" style={{color:scoreColor(atsResult.overallScore)}}>{atsResult.overallScore}%</span>
                  </div>
                  <p className="text-[9px] text-[#8e90a2] font-bold uppercase tracking-widest mt-1">Before</p>
                </div>
                <span className="material-symbols-outlined text-[#8e90a2] text-xl">arrow_forward</span>
                <div className="text-center">
                  <div className="relative w-16 h-16">
                    {aiScoring ? <div className="w-full h-full flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-[#00daf3]"/></div> : (
                      <><svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="5"/>
                        <circle cx="40" cy="40" r="34" fill="transparent" stroke={scoreColor(aiScore?.overall_score || postScore?.overallScore || 0)} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${2*Math.PI*34}`} strokeDashoffset={`${2*Math.PI*34 - ((aiScore?.overall_score || postScore?.overallScore || 0)/100)*2*Math.PI*34}`} style={{transition:'stroke-dashoffset 1s ease'}}/>
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-black" style={{color:scoreColor(aiScore?.overall_score || postScore?.overallScore || 0)}}>{aiScore?.overall_score || postScore?.overallScore || 0}%</span></>
                    )}
                  </div>
                  <p className="text-[9px] text-[#8e90a2] font-bold uppercase tracking-widest mt-1">{aiScore ? 'AI Score' : 'After'}</p>
                </div>
                <div className="flex-1 text-xs text-[#c4c5d9] space-y-1">
                  {aiScore ? <>
                    <p className="font-bold text-[#00daf3]">+{(aiScore.overall_score || 0) - atsResult.overallScore}% improvement</p>
                    {aiScore.recruiter_impression && <p className="text-[#e1e2eb] italic">"{aiScore.recruiter_impression}"</p>}
                  </> : <p className="font-bold text-[#e1e2eb]">+{(postScore?.overallScore||0) - atsResult.overallScore}% improvement</p>}
                </div>
              </div>

              {/* ATS Platform Scores */}
              {aiScore?.ats_scores && (
                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/5">
                  {Object.entries(aiScore.ats_scores).map(([platform, score]) => (
                    <div key={platform} className="text-center p-2 rounded-lg" style={{background:scoreBg(score as number)}}>
                      <p className="text-lg font-black" style={{color:scoreColor(score as number)}}>{score as number}%</p>
                      <p className="text-[9px] text-[#8e90a2] font-bold uppercase tracking-widest mt-0.5">{platform}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Strengths + Improvements from AI */}
              {aiScore?.strengths?.length > 0 && (
                <div className="pt-2 border-t border-white/5 space-y-2">
                  <div><p className="text-[10px] font-bold text-[#00daf3] uppercase tracking-widest mb-1">Strengths</p>
                    {aiScore.strengths.map((s: string, i: number) => <p key={i} className="text-xs text-[#c4c5d9]">✓ {s}</p>)}
                  </div>
                  {aiScore.improvements?.length > 0 && <div><p className="text-[10px] font-bold text-[#cdbdff] uppercase tracking-widest mb-1">Could Improve</p>
                    {aiScore.improvements.map((s: string, i: number) => <p key={i} className="text-xs text-[#c4c5d9]">→ {s}</p>)}
                  </div>}
                </div>
              )}

              {/* Changes Made (algorithmic) */}
              {postScore && (() => {
                const fixedKws = atsResult.missing.filter(k => postScore.matched.includes(k));
                const fixedPlacement = atsResult.misplaced.filter(k => !postScore.misplaced.includes(k));
                return (fixedKws.length > 0 || fixedPlacement.length > 0) ? (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <p className="text-[10px] font-bold text-[#00daf3] uppercase tracking-widest">Keywords Added</p>
                    {fixedKws.length > 0 && <div className="flex flex-wrap gap-1.5">{fixedKws.map(k => <span key={k} className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#007886]/15 text-[#00daf3] border border-[#00daf3]/20">+ {k}</span>)}</div>}
                    {fixedPlacement.length > 0 && <p className="text-xs text-[#cdbdff]">{fixedPlacement.length} keywords woven into experience bullets</p>}
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {/* Post-gen actions */}
          {gen && (
            <div className="glass-card rounded-2xl p-5 space-y-3">
            {gen.ats_compliance && <p className="text-xs text-[#00daf3] flex items-center gap-1"><span className="material-symbols-outlined text-sm">verified</span>ATS Optimized: {gen.ats_compliance.platforms_optimized?.join(', ')}</p>}
            <div className="flex flex-wrap gap-3">
              <button onClick={() => doDL('docx')} disabled={dling} className="kinetic-btn px-5 py-2.5 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-sm">description</span>DOCX</button>
              <button onClick={() => doDL('pdf')} disabled={dling} className="kinetic-btn-ghost px-5 py-2.5 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-sm">picture_as_pdf</span>PDF</button>
              <button onClick={doSave} disabled={svd} className={`kinetic-btn-ghost px-5 py-2.5 text-sm flex items-center gap-2 ${svd?'border-[#00daf3]/30 text-[#00daf3]':''}`}><span className="material-symbols-outlined text-sm">{svd?'check_circle':'save'}</span>{svd?'Saved':'Save'}</button>
              <button onClick={() => goTo('/cover-letter', { cl_jd: jd, cl_title: jt, cl_company: co })} className="kinetic-btn-ghost px-5 py-2.5 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-sm">auto_stories</span>Cover Letter</button>
              <button onClick={() => goTo('/interview-prep', { interview_jd: jd, interview_title: jt, interview_company: co })} className="kinetic-btn-ghost px-5 py-2.5 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-sm">quiz</span>Interview Prep</button>
            </div>
          </div>)}
          {err && <div className="glass-panel rounded-2xl p-4 border-[#ffb4ab]/20 bg-[#93000a]/10 text-sm text-[#ffb4ab] flex items-center gap-2"><span className="material-symbols-outlined">error</span>{err}</div>}
        </div>

        {/* RIGHT: Preview */}
        <div className="col-span-12 lg:col-span-5">
          <div className="sticky top-6">
            <div className="glass-card rounded-2xl p-2" style={{boxShadow:'inset 0 0 40px rgba(187,195,255,0.03), 0 25px 50px -12px rgba(0,0,0,0.5)'}}>
              <div className="flex items-center justify-between px-4 py-2.5 rounded-t-xl" style={{background:'rgba(39,42,49,0.3)'}}>
                <div className="flex gap-1.5"><div className="w-2 h-2 rounded-full bg-[#ffb4ab]/40"/><div className="w-2 h-2 rounded-full bg-[#00daf3]/40"/><div className="w-2 h-2 rounded-full bg-[#cdbdff]/40"/></div>
                <span className="text-[10px] font-bold text-[#c4c5d9] uppercase tracking-widest">{gen ? 'Optimized Resume' : 'Preview'}</span>
                <div/>
              </div>
              <div className="bg-white p-6 rounded-b-xl overflow-y-auto text-slate-800" style={{maxHeight:'75vh',minHeight:'400px'}}>
                {gen ? (
                  <div className="text-[10px]">
                    <div className="border-b-2 border-slate-900 pb-2 mb-4"><h1 className="text-lg font-black uppercase tracking-tight">{gen.name}</h1><p className="text-[10px] text-slate-500 mt-0.5">{[gen.email,gen.phone,gen.location].filter(Boolean).join(' | ')}</p>{gen.linkedin&&<p className="text-[9px] text-blue-600">{gen.linkedin}</p>}</div>
                    {gen.summary&&<div className="mb-4"><h3 className="font-black uppercase tracking-widest text-slate-400 mb-1 border-b border-slate-100 pb-0.5">Summary</h3><p className="text-slate-600 leading-relaxed">{gen.summary}</p></div>}
                    {gen.skills_grouped&&Object.keys(gen.skills_grouped).length>0&&<div className="mb-4"><h3 className="font-black uppercase tracking-widest text-slate-400 mb-1 border-b border-slate-100 pb-0.5">Skills</h3>{Object.entries(gen.skills_grouped).map(([c,s])=>Array.isArray(s)&&s.length?<p key={c} className="text-slate-600 mb-0.5"><b>{c}:</b> {(s as string[]).join(', ')}</p>:null)}</div>}
                    {gen.experience?.length>0&&<div className="mb-4"><h3 className="font-black uppercase tracking-widest text-slate-400 mb-1 border-b border-slate-100 pb-0.5">Experience</h3>{gen.experience.map((e:any,i:number)=>(<div key={i} className="mb-3"><div className="flex justify-between"><b className="text-slate-800">{e.title} - {e.company}</b><span className="text-[9px] text-slate-400">{e.dates}</span></div>{e.location&&<p className="text-[9px] text-slate-400">{e.location}</p>}<ul className="mt-1 space-y-0.5 list-disc ml-3">{e.bullets?.map((b:string,j:number)=><li key={j} className="text-slate-600 leading-snug">{b}</li>)}</ul></div>))}</div>}
                    {gen.projects?.length>0&&<div className="mb-4"><h3 className="font-black uppercase tracking-widest text-slate-400 mb-1 border-b border-slate-100 pb-0.5">Projects</h3>{gen.projects.map((p:any,i:number)=>(<div key={i} className="mb-3"><div className="flex justify-between"><b className="text-slate-800">{p.name}</b>{p.technologies?.length>0&&<span className="text-[9px] text-slate-400">{p.technologies.join(', ')}</span>}</div>{p.description&&<p className="text-[9px] text-slate-500 italic">{p.description}</p>}<ul className="mt-1 space-y-0.5 list-disc ml-3">{p.bullets?.map((b:string,j:number)=><li key={j} className="text-slate-600 leading-snug">{b}</li>)}</ul></div>))}</div>}
                    {gen.education?.length>0&&<div className="mb-3"><h3 className="font-black uppercase tracking-widest text-slate-400 mb-1 border-b border-slate-100 pb-0.5">Education</h3>{gen.education.map((e:any,i:number)=><div key={i} className="mb-1.5"><b>{e.degree} - {e.institution}</b><span className="text-[9px] text-slate-400 ml-2">{e.dates}</span>{e.coursework?.length>0&&<p className="text-[9px] text-slate-500">Coursework: {e.coursework.join(', ')}</p>}</div>)}</div>}
                    {gen.certifications?.filter(Boolean).length>0&&<div><h3 className="font-black uppercase tracking-widest text-slate-400 mb-1 border-b border-slate-100 pb-0.5">Certifications</h3>{gen.certifications.filter(Boolean).map((c:string,i:number)=><p key={i} className="text-slate-600">- {c}</p>)}</div>}
                  </div>
                ) : ging ? (
                  <div className="h-full flex items-center justify-center min-h-[350px]">
                    <div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-[#5203d5] mx-auto"/><p className="mt-3 text-sm text-slate-400">4-Step AI Pipeline Running...</p><p className="text-xs text-slate-300 mt-1">Rewrite → Score → Fix gaps</p></div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center min-h-[350px]"><p className="text-sm text-slate-300 italic text-center">Paste JD to see live ATS analysis.<br/>Click Optimize for AI rewrite.</p></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
