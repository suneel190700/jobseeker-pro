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
    const resume = v.resumeData;
    if (!resume) { toast.error('No resume data'); return; }
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

  const doDelete = async (id: string) => { await deleteVersion(id); if (selected?.id === id) setSelected(null); toast('Deleted'); };

  if (!loaded) return <div className="py-20 text-center text-sm text-gray-400">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">My Resumes</h1>
      <p className="mt-1 text-sm text-gray-500">{versions.length} tailored version{versions.length !== 1 ? 's' : ''} saved.</p>

      {versions.length === 0 ? (
        <div className="mt-12 bg-white rounded-xl border border-gray-200 shadow-sm text-center py-16 px-6">
          <FileText className="h-12 w-12 text-gray-300 mx-auto" />
          <p className="mt-3 text-sm font-medium text-gray-600">No saved versions yet</p>
          <p className="mt-1 text-xs text-gray-400">Generate an optimized resume and click "Save Version" to store it here.</p>
          <a href="/resume-optimizer" className="mt-4 inline-block rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition">Go to Resume AI</a>
        </div>
      ) : (
        <div className="mt-6 flex gap-5">
          <div className="flex-1 space-y-2">
            {versions.map(v => (
              <div key={v.id} onClick={() => setSelected(v)} className={['bg-white rounded-xl border p-4 cursor-pointer transition hover:shadow-sm', selected?.id === v.id ? 'border-brand-300 shadow-sm' : 'border-gray-200'].join(' ')}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{v.label || 'Untitled'}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{v.jobTitle} {v.company ? `at ${v.company}` : ''}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Target className="h-3 w-3" /><span className={v.score >= 80 ? 'text-green-600 font-semibold' : v.score >= 60 ? 'text-amber-600 font-semibold' : 'text-red-600'}>{v.score}% ATS</span></span>
                      {v.originalScore > 0 && <span>from {v.originalScore}%</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(v.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={e => { e.stopPropagation(); doDownload(v); }} disabled={dling === v.id} className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition">{dling === v.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}</button>
                    <button onClick={e => { e.stopPropagation(); doDelete(v.id); }} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selected?.resumeData && (
            <div className="hidden lg:block w-[420px] flex-shrink-0">
              <div className="sticky top-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-h-[calc(100vh-150px)] overflow-y-auto">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-700">{selected.label}</h2>
                  <span className={['rounded-full px-2.5 py-0.5 text-xs font-bold', selected.score >= 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'].join(' ')}>{selected.score}%</span>
                </div>
                <div className="p-5">
                  <div className="text-center border-b border-gray-100 pb-4 mb-4">
                    <p className="text-lg font-bold text-gray-900">{selected.resumeData?.name || 'Name'}</p>
                    <p className="text-xs text-gray-400 mt-1">{[selected.resumeData?.email, selected.resumeData?.phone, selected.resumeData?.location].filter(Boolean).join(' • ')}</p>
                  </div>
                  {selected.resumeData?.summary && <div className="mb-4"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Summary</p><p className="text-xs text-gray-600 mt-1 leading-relaxed">{selected.resumeData.summary}</p></div>}
                  {selected.resumeData?.skills_grouped && Object.keys(selected.resumeData.skills_grouped).length > 0 && (
                    <div className="mb-4"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Skills</p>{Object.entries(selected.resumeData.skills_grouped).map(([c, s]) => Array.isArray(s) && s.length > 0 ? <p key={c} className="text-xs text-gray-600 mt-1"><span className="font-semibold text-gray-700">{c}:</span> {(s as string[]).join(', ')}</p> : null)}</div>
                  )}
                  {selected.resumeData?.experience?.map((exp: any, i: number) => (
                    <div key={i} className="mb-3"><p className="text-xs font-bold text-gray-800">{exp?.title} — {exp?.company}</p><p className="text-[10px] text-gray-400">{exp?.dates}</p>{exp?.bullets?.slice(0, 3).map((b: string, j: number) => <p key={j} className="text-[10px] text-gray-500 mt-0.5 pl-2 border-l-2 border-gray-200">{b}</p>)}{(exp?.bullets?.length || 0) > 3 && <p className="text-[10px] text-gray-300 pl-2">+{exp.bullets.length - 3} more bullets</p>}</div>
                  ))}
                  <button onClick={() => doDownload(selected)} disabled={dling === selected.id} className="mt-4 w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-500 transition flex items-center justify-center gap-2"><Download className="h-4 w-4" />Download DOCX</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
