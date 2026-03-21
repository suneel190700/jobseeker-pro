'use client';

import { useState, useEffect } from 'react';
import { FileText, Trash2, Download, Clock, Target } from 'lucide-react';
import { toast } from 'sonner';

interface SavedVersion { id: string; label: string; company: string; role: string; score: number; createdAt: string; resume: any; }

const VERSIONS_KEY = 'jobseeker_resume_versions';

export default function ResumeVersionsPage() {
  const [versions, setVersions] = useState<SavedVersion[]>([]);
  const [selected, setSelected] = useState<SavedVersion | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try { const r = localStorage.getItem(VERSIONS_KEY); if (r) setVersions(JSON.parse(r)); } catch {}
    setLoaded(true);
  }, []);

  const deleteVersion = (id: string) => {
    const updated = versions.filter((v) => v.id !== id);
    setVersions(updated);
    try { localStorage.setItem(VERSIONS_KEY, JSON.stringify(updated)); } catch {}
    if (selected?.id === id) setSelected(null);
    toast('Deleted');
  };

  const downloadVersion = async (v: SavedVersion) => {
    if (!v.resume) { toast.error('No resume data'); return; }
    try {
      const res = await fetch('/api/resume/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resume: v.resume }) });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob(); const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `resume_${(v.label || 'version').replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      toast.success('Downloaded!');
    } catch { toast.error('Download failed'); }
  };

  if (!loaded) return <div className="py-20 text-center text-sm text-slate-400">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Resume Versions</h1>
      <p className="mt-1 text-sm text-slate-500">{versions.length} version{versions.length !== 1 ? 's' : ''} saved.</p>

      {versions.length === 0 ? (
        <div className="mt-12 text-center py-16">
          <FileText className="h-12 w-12 text-slate-300 mx-auto" />
          <p className="mt-3 text-sm text-slate-400">No saved versions yet.</p>
          <p className="text-xs text-slate-400 mt-1">Generate optimized resumes in the Resume Optimizer.</p>
          <a href="/resume-optimizer" className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition">Go to Optimizer</a>
        </div>
      ) : (
        <div className="mt-8 flex gap-6">
          <div className="flex-1 space-y-3">
            {versions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((v) => (
              <div key={v.id} onClick={() => setSelected(v)} className={['rounded-xl border p-4 cursor-pointer transition', selected?.id === v.id ? 'border-brand-300 bg-brand-50/30 shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'].join(' ')}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{v.label || 'Untitled'}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{v.role || ''} {v.company ? `at ${v.company}` : ''}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Target className="h-3 w-3" /><span className={v.score >= 80 ? 'text-green-600 font-medium' : 'text-amber-600'}>{v.score || 0}% ATS</span></span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{v.createdAt ? new Date(v.createdAt).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); downloadVersion(v); }} className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 transition"><Download className="h-4 w-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteVersion(v.id); }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selected && selected.resume && (
            <div className="hidden lg:block w-[450px] flex-shrink-0">
              <div className="sticky top-0 rounded-xl border border-slate-200 p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-700">{selected.label || 'Preview'}</h2>
                  <span className={['rounded-full px-2 py-0.5 text-xs font-bold', (selected.score||0) >= 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'].join(' ')}>{selected.score || 0}%</span>
                </div>
                <div className="text-center border-b pb-3 mb-3">
                  <p className="text-base font-bold text-slate-900">{selected.resume?.name || 'Name'}</p>
                  <p className="text-[10px] text-slate-400">{[selected.resume?.email, selected.resume?.phone, selected.resume?.location].filter(Boolean).join(' | ')}</p>
                </div>
                {selected.resume?.summary && <div className="mb-3"><p className="text-[10px] font-bold text-slate-500 uppercase">Summary</p><p className="text-xs text-slate-600 mt-0.5">{selected.resume.summary}</p></div>}
                {selected.resume?.skills_grouped && Object.keys(selected.resume.skills_grouped).length > 0 && (
                  <div className="mb-3"><p className="text-[10px] font-bold text-slate-500 uppercase">Skills</p>
                    {Object.entries(selected.resume.skills_grouped).map(([cat, skills]) => (
                      Array.isArray(skills) && skills.length > 0 ? <p key={cat} className="text-xs text-slate-600 mt-0.5"><span className="font-medium">{cat}:</span> {(skills as string[]).join(', ')}</p> : null
                    ))}
                  </div>
                )}
                {selected.resume?.experience?.map((exp: any, i: number) => (
                  <div key={i} className="mb-3">
                    <p className="text-xs font-bold text-slate-800">{exp?.title || ''} — {exp?.company || ''}</p>
                    <p className="text-[10px] text-slate-400">{exp?.dates || ''}</p>
                    {exp?.bullets?.slice(0, 3).map((b: string, j: number) => (<p key={j} className="text-[10px] text-slate-500 mt-0.5">- {b}</p>))}
                    {(exp?.bullets?.length || 0) > 3 && <p className="text-[10px] text-slate-300">+{exp.bullets.length - 3} more</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
