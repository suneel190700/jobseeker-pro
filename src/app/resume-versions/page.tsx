'use client';
import { useState } from 'react';
import { FileText, Trash2, Download, Clock, Target, Loader2 } from 'lucide-react';
import { useResumeVersions } from '@/hooks/useResumeVersions';
import { toast } from 'sonner';

export default function ResumeVersionsPage() {
  const { versions, loaded, deleteVersion } = useResumeVersions();
  const [selected, setSelected] = useState<any>(null);
  const [dling, setDling] = useState('');

  const doDownload = async (v: any) => {
    const resume = v.resumeData; if (!resume) { toast.error('No data'); return; } setDling(v.id);
    try { const res = await fetch('/api/resume/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resume }) }); if (!res.ok) throw new Error('Failed'); const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `resume_${(v.label || 'v').replace(/\s+/g, '_')}.docx`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); toast.success('Downloaded!'); } catch { toast.error('Failed'); } finally { setDling(''); }
  };

  if (!loaded) return <div className="py-20 text-center text-sm text-slate-600"><Loader2 className="h-5 w-5 animate-spin mx-auto mb-2"/>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-200 tracking-tight">My Resumes</h1>
      <p className="mt-1 text-sm text-slate-600">{versions.length} tailored version{versions.length !== 1 ? 's' : ''} saved</p>

      {versions.length === 0 ? (
        <div className="mt-12 glass text-center py-16 px-6"><FileText className="h-12 w-12 text-slate-700 mx-auto" /><p className="mt-3 text-sm font-semibold text-slate-400">No saved versions yet</p><p className="mt-1 text-xs text-slate-600">Optimize a resume and save it here.</p><a href="/resume-optimizer" className="mt-4 inline-block btn-brand px-6 py-2.5 text-sm">Go to Resume AI</a></div>
      ) : (
        <div className="mt-6 flex gap-5">
          <div className="flex-1 space-y-2">
            {versions.map(v => (
              <div key={v.id} onClick={() => setSelected(v)} className={`glass glass-h p-4 cursor-pointer ${selected?.id === v.id ? 'border-emerald-500/20 shadow-glow ring-1 ring-emerald-500/20' : ''}`}>
                <div className="flex items-start justify-between">
                  <div><h3 className="text-sm font-bold text-slate-200">{v.label || 'Untitled'}</h3><p className="text-xs text-slate-500 mt-0.5">{v.jobTitle} {v.company ? `at ${v.company}` : ''}</p><div className="mt-2 flex items-center gap-3 text-xs text-slate-600"><span className="flex items-center gap-1"><Target className="h-3 w-3" /><span className={v.score >= 80 ? 'text-emerald-400 font-bold' : v.score >= 60 ? 'text-amber-400 font-bold' : 'text-red-400 font-bold'}>{v.score}%</span></span><span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(v.createdAt).toLocaleDateString()}</span></div></div>
                  <div className="flex gap-1"><button onClick={e => { e.stopPropagation(); doDownload(v); }} disabled={dling === v.id} className="p-2 rounded-xl text-slate-600 hover:text-emerald-400 hover:bg-emerald-500/10 transition">{dling === v.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}</button><button onClick={e => { e.stopPropagation(); deleteVersion(v.id); if (selected?.id === v.id) setSelected(null); toast('Deleted'); }} className="p-2 rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition"><Trash2 className="h-4 w-4" /></button></div>
                </div>
              </div>
            ))}
          </div>
          {selected?.resumeData && (
            <div className="hidden lg:block w-[400px] flex-shrink-0"><div className="sticky top-0 glass overflow-hidden max-h-[calc(100vh-150px)] overflow-y-auto">
              <div className="px-5 py-4 bg-[rgba(255,255,255,0.02)] border-b border-white/[0.06] flex items-center justify-between"><h2 className="text-sm font-bold text-slate-300">{selected.label}</h2><span className={`badge-dark border ${selected.score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{selected.score}%</span></div>
              <div className="p-5">
                <div className="text-center border-b border-white/[0.06] pb-4 mb-4"><p className="text-lg font-bold text-slate-200">{selected.resumeData?.name}</p><p className="text-xs text-slate-600 mt-1">{[selected.resumeData?.email, selected.resumeData?.phone, selected.resumeData?.location].filter(Boolean).join(' • ')}</p></div>
                {selected.resumeData?.summary && <div className="mb-4"><p className="t-muted text-[10px] font-semibold uppercase tracking-widest mb-1">Summary</p><p className="text-xs text-slate-400 leading-relaxed">{selected.resumeData.summary}</p></div>}
                {selected.resumeData?.skills_grouped && Object.keys(selected.resumeData.skills_grouped).length > 0 && (<div className="mb-4"><p className="t-muted text-[10px] font-semibold uppercase tracking-widest mb-1">Skills</p>{Object.entries(selected.resumeData.skills_grouped).map(([c, s]) => Array.isArray(s) && s.length ? <p key={c} className="text-xs text-slate-400 mt-0.5"><span className="font-semibold text-slate-300">{c}:</span> {(s as string[]).join(', ')}</p> : null)}</div>)}
                {selected.resumeData?.experience?.map((exp: any, i: number) => (<div key={i} className="mb-3"><p className="text-xs font-bold text-slate-300">{exp?.title} — {exp?.company}</p><p className="text-[10px] text-slate-600">{exp?.dates}</p>{exp?.bullets?.slice(0, 3).map((b: string, j: number) => <p key={j} className="text-[10px] text-slate-500 mt-0.5 pl-2 border-l-2 border-white/[0.06]">{b}</p>)}</div>))}
                <button onClick={() => doDownload(selected)} disabled={dling === selected.id} className="mt-4 w-full btn-brand py-2.5 text-sm flex items-center justify-center gap-2"><Download className="h-4 w-4" />Download DOCX</button>
              </div>
            </div></div>
          )}
        </div>
      )}
    </div>
  );
}
