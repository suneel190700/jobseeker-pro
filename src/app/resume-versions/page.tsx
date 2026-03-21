'use client';

import { useState } from 'react';
import { FileText, Trash2, Download, Clock, Target } from 'lucide-react';
import { useResumeVersions } from '@/hooks/useResumeVersions';
import { toast } from 'sonner';

export default function ResumeVersionsPage() {
  const { versions, history, loaded, deleteVersion } = useResumeVersions();
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
      const a = document.createElement('a'); a.href = url; a.download = `resume_${(v.label || 'version').replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      toast.success('Downloaded!');
    } catch { toast.error('Download failed'); } finally { setDling(''); }
  };

  const doDelete = (id: string) => {
    deleteVersion(id);
    if (selected?.id === id) setSelected(null);
    toast('Deleted');
  };

  if (!loaded) return <div className="py-20 text-center text-sm text-slate-400">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Resume Versions</h1>
      <p className="mt-1 text-sm text-slate-500">{versions.length} version{versions.length !== 1 ? 's' : ''} saved.</p>

      {/* Score History */}
      {history.length > 0 && (
        <div className="mt-6 rounded-xl border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Score History</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {history.slice(0, 10).map((h, i) => (
              <div key={i} className="flex-shrink-0 rounded-lg border border-slate-100 p-3 w-36">
                <p className={['text-xl font-bold', h.score >= 80 ? 'text-green-600' : h.score >= 60 ? 'text-amber-600' : 'text-red-600'].join(' ')}>{h.score}%</p>
                <p className="text-[10px] text-slate-600 truncate mt-1">{h.job}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{new Date(h.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {versions.length === 0 ? (
        <div className="mt-12 text-center py-16">
          <FileText className="h-12 w-12 text-slate-300 mx-auto" />
          <p className="mt-3 text-sm text-slate-400">No saved versions yet.</p>
          <p className="text-xs text-slate-400 mt-1">Generate optimized resumes in the Resume Optimizer.</p>
          <a href="/resume-optimizer" className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition">Go to Optimizer</a>
        </div>
      ) : (
        <div className="mt-6 flex gap-6">
          <div className="flex-1 space-y-3">
            {versions.map((v) => (
              <div key={v.id} onClick={() => setSelected(v)} className={['rounded-xl border p-4 cursor-pointer transition', selected?.id === v.id ? 'border-brand-300 bg-brand-50/30 shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'].join(' ')}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{v.label || 'Untitled'}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{v.jobTitle || ''} {v.company ? `at ${v.company}` : ''}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Target className="h-3 w-3" /><span className={v.score >= 80 ? 'text-green-600 font-medium' : 'text-amber-600'}>{v.score || 0}% ATS</span></span>
                      {v.originalScore > 0 && <span className="text-[10px]">from {v.originalScore}%</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(v.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); doDownload(v); }} disabled={dling === v.id} className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 transition"><Download className="h-4 w-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); doDelete(v.id); }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selected && selected.resumeData && (
            <div className="hidden lg:block w-[450px] flex-shrink-0">
              <div className="sticky top-0 rounded-xl border border-slate-200 p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-700">{selected.label || 'Preview'}</h2>
                  <span className={['rounded-full px-2 py-0.5 text-xs font-bold', (selected.score||0) >= 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'].join(' ')}>{selected.score || 0}%</span>
                </div>
                <div className="text-center border-b pb-3 mb-3">
                  <p className="text-base font-bold text-slate-900">{selected.resumeData?.name || 'Name'}</p>
                  <p className="text-[10px] text-slate-400">{[selected.resumeData?.email, selected.resumeData?.phone, selected.resumeData?.location].filter(Boolean).join(' | ')}</p>
                </div>
                {selected.resumeData?.summary && <div className="mb-3"><p className="text-[10px] font-bold text-slate-500 uppercase">Summary</p><p className="text-xs text-slate-600 mt-0.5">{selected.resumeData.summary}</p></div>}
                {selected.resumeData?.skills_grouped && Object.keys(selected.resumeData.skills_grouped).length > 0 && (
                  <div className="mb-3"><p className="text-[10px] font-bold text-slate-500 uppercase">Skills</p>
                    {Object.entries(selected.resumeData.skills_grouped).map(([cat, skills]) => (
                      Array.isArray(skills) && skills.length > 0 ? <p key={cat} className="text-xs text-slate-600 mt-0.5"><span className="font-medium">{cat}:</span> {(skills as string[]).join(', ')}</p> : null
                    ))}
                  </div>
                )}
                {selected.resumeData?.experience?.map((exp: any, i: number) => (
                  <div key={i} className="mb-3">
                    <p className="text-xs font-bold text-slate-800">{exp?.title || ''} — {exp?.company || ''}</p>
                    <p className="text-[10px] text-slate-400">{exp?.dates || ''}</p>
                    {exp?.bullets?.slice(0, 3).map((b: string, j: number) => (<p key={j} className="text-[10px] text-slate-500 mt-0.5">- {b}</p>))}
                    {(exp?.bullets?.length || 0) > 3 && <p className="text-[10px] text-slate-300">+{exp.bullets.length - 3} more</p>}
                  </div>
                ))}
                <button onClick={() => doDownload(selected)} disabled={dling === selected.id} className="mt-4 w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2"><Download className="h-4 w-4" /> Download DOCX</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
