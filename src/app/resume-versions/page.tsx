'use client';
import { useState } from 'react';
import { FileText, Trash2, Download, Clock, Target } from 'lucide-react';
import { useResumeVersions } from '@/hooks/useResumeVersions';
import { toast } from 'sonner';

export default function ResumeVersionsPage() {
  const { versions, loaded, deleteVersion } = useResumeVersions();
  const [selected, setSelected] = useState<any>(null);
  const [dling, setDling] = useState('');

  const doDownload = async (v: any) => {
    const resume = v.resumeData;
    if (!resume) { toast.error('No resume data found'); return; }
    setDling(v.id);
    try {
      const res = await fetch('/api/resume/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resume }) });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob(); const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `resume_${(v.label||'v').replace(/\s+/g,'_')}.docx`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      toast.success('Downloaded!');
    } catch { toast.error('Download failed'); } finally { setDling(''); }
  };

  const doDelete = async (id: string) => {
    await deleteVersion(id);
    if (selected?.id === id) setSelected(null);
    toast('Deleted');
  };

  if (!loaded) return <div className="py-20 text-center text-sm text-zinc-500">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-100">Resume Versions</h1>
      <p className="mt-1 text-sm text-zinc-500">{versions.length} version{versions.length!==1?'s':''} saved.</p>
      {versions.length===0 ? (
        <div className="mt-12 text-center py-16">
          <FileText className="h-12 w-12 text-zinc-700 mx-auto" />
          <p className="mt-3 text-sm text-zinc-500">No saved versions yet.</p>
          <a href="/resume-optimizer" className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition">Go to Optimizer</a>
        </div>
      ) : (
        <div className="mt-6 flex gap-6">
          <div className="flex-1 space-y-3">
            {versions.map(v => (
              <div key={v.id} onClick={() => setSelected(v)} className={['rounded-xl border p-4 cursor-pointer transition', selected?.id===v.id ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-zinc-800 hover:border-zinc-700'].join(' ')}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">{v.label||'Untitled'}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">{v.jobTitle||''} {v.company?`at ${v.company}`:''}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-zinc-600">
                      <span className="flex items-center gap-1"><Target className="h-3 w-3" /><span className={v.score>=80?'text-emerald-400 font-medium':'text-amber-400'}>{v.score||0}%</span></span>
                      {v.originalScore>0 && <span>from {v.originalScore}%</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(v.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={e => { e.stopPropagation(); doDownload(v); }} disabled={dling===v.id} className="p-1.5 rounded-lg text-zinc-600 hover:text-emerald-400 transition"><Download className="h-4 w-4" /></button>
                    <button onClick={e => { e.stopPropagation(); doDelete(v.id); }} className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 transition"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {selected?.resumeData && (
            <div className="hidden lg:block w-[450px] flex-shrink-0">
              <div className="sticky top-0 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-zinc-300">{selected.label}</h2>
                  <span className={['rounded-full px-2 py-0.5 text-xs font-bold', (selected.score||0)>=80?'bg-emerald-500/20 text-emerald-400':'bg-amber-500/20 text-amber-400'].join(' ')}>{selected.score}%</span>
                </div>
                <div className="text-center border-b border-zinc-800 pb-3 mb-3">
                  <p className="text-base font-bold text-zinc-100">{selected.resumeData?.name||'Name'}</p>
                  <p className="text-[10px] text-zinc-500">{[selected.resumeData?.email,selected.resumeData?.phone,selected.resumeData?.location].filter(Boolean).join(' | ')}</p>
                </div>
                {selected.resumeData?.summary && <div className="mb-3"><p className="text-[10px] font-bold text-zinc-500 uppercase">Summary</p><p className="text-xs text-zinc-400 mt-0.5">{selected.resumeData.summary}</p></div>}
                {selected.resumeData?.skills_grouped && Object.keys(selected.resumeData.skills_grouped).length>0 && (
                  <div className="mb-3"><p className="text-[10px] font-bold text-zinc-500 uppercase">Skills</p>
                    {Object.entries(selected.resumeData.skills_grouped).map(([c,s]) => Array.isArray(s)&&s.length>0?<p key={c} className="text-xs text-zinc-400 mt-0.5"><span className="font-medium text-zinc-300">{c}:</span> {(s as string[]).join(', ')}</p>:null)}
                  </div>
                )}
                {selected.resumeData?.experience?.map((exp:any,i:number) => (
                  <div key={i} className="mb-3"><p className="text-xs font-bold text-zinc-300">{exp?.title} — {exp?.company}</p><p className="text-[10px] text-zinc-600">{exp?.dates}</p>{exp?.bullets?.slice(0,3).map((b:string,j:number) => <p key={j} className="text-[10px] text-zinc-500 mt-0.5">- {b}</p>)}</div>
                ))}
                <button onClick={() => doDownload(selected)} disabled={dling===selected.id} className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition flex items-center justify-center gap-2"><Download className="h-4 w-4" /> Download DOCX</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
