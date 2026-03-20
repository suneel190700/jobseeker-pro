'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, CheckCircle, Trash2, Clock, AlertCircle, Plus, X } from 'lucide-react';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { profile, titles, loaded, saveResume, clearResume, addTitle, removeTitle } = useResumeProfile();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploading(true); setError('');
    try {
      const formData = new FormData(); formData.append('resume', file);
      const res = await fetch('/api/resume/parse', { method: 'POST', body: formData });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to parse resume');
      const data = await res.json();
      saveResume(file.name, data.text);
      toast.success('Base resume uploaded!');
    } catch (err: any) { setError(err.message); } finally { setUploading(false); }
  }, [saveResume]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] },
    maxFiles: 1, maxSize: 10 * 1024 * 1024,
  });

  const handleAddTitle = () => { if (newTitle.trim()) { addTitle(newTitle); setNewTitle(''); } };

  if (!loaded) return <div className="py-20 text-center text-sm text-slate-400">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
      <p className="mt-1 text-sm text-slate-500">Upload your base resume and set target roles for quick job searching.</p>

      {/* Base Resume */}
      <div className="mt-8 rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-brand-50 p-2"><FileText className="h-5 w-5 text-brand-600" /></div>
          <div><h2 className="text-base font-semibold text-slate-900">Base Resume</h2><p className="text-xs text-slate-500">Used for ATS scoring and job matching</p></div>
        </div>
        {profile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-100 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">{profile.fileName}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1"><Clock className="h-3 w-3" /> Uploaded {new Date(profile.uploadedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button onClick={() => { clearResume(); toast('Resume removed'); }} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition flex items-center gap-1">
                <Trash2 className="h-3 w-3" /> Remove
              </button>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Preview</p>
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-xs text-slate-600 max-h-32 overflow-y-auto whitespace-pre-wrap">
                {profile.text.slice(0, 400)}{profile.text.length > 400 ? '...' : ''}
              </div>
            </div>
            <div {...getRootProps()} className={['rounded-lg border-2 border-dashed p-3 text-center cursor-pointer transition text-xs', isDragActive ? 'border-brand-400 bg-brand-50' : 'border-slate-200 hover:border-slate-300'].join(' ')}>
              <input {...getInputProps()} />{uploading ? 'Uploading...' : 'Drop a new resume to replace'}
            </div>
          </div>
        ) : (
          <div>
            <div {...getRootProps()} className={['flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition', isDragActive ? 'border-brand-400 bg-brand-50' : 'border-slate-300 hover:border-slate-400'].join(' ')}>
              <input {...getInputProps()} />
              {uploading ? (<><Loader2 className="h-8 w-8 animate-spin text-brand-600" /><p className="mt-2 text-sm text-slate-500">Parsing...</p></>) : (<><Upload className="h-8 w-8 text-slate-400" /><p className="mt-2 text-sm font-medium text-slate-600">Drop your resume here</p><p className="text-xs text-slate-400 mt-1">PDF, DOCX, or TXT — up to 10 MB</p></>)}
            </div>
            {error && <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{error}</div>}
          </div>
        )}
      </div>

      {/* Target Titles */}
      <div className="mt-6 rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-purple-50 p-2"><Plus className="h-5 w-5 text-purple-600" /></div>
          <div><h2 className="text-base font-semibold text-slate-900">Target Job Titles</h2><p className="text-xs text-slate-500">Quick-select buttons in Job Search — no typing needed</p></div>
        </div>
        <div className="flex gap-2 mb-3">
          <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTitle()}
            placeholder="e.g. AI Engineer, ML Engineer, Data Scientist" className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          <button onClick={handleAddTitle} disabled={!newTitle.trim()} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition">Add</button>
        </div>
        {titles.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {titles.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-3 py-1.5 text-sm text-purple-700">
                {t}
                <button onClick={() => removeTitle(t)} className="text-purple-400 hover:text-purple-600"><X className="h-3.5 w-3.5" /></button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No titles added yet. Add roles you're targeting to speed up job search.</p>
        )}

        {/* Suggested titles */}
        {titles.length === 0 && (
          <div className="mt-3">
            <p className="text-xs text-slate-500 mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-1.5">
              {['AI Engineer', 'ML Engineer', 'Data Scientist', 'MLOps Engineer', 'NLP Engineer', 'Applied Scientist', 'AI/ML Architect'].map((s) => (
                <button key={s} onClick={() => addTitle(s)} className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-500 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition">{s}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
