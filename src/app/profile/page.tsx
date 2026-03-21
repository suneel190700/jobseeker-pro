'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, CheckCircle, Trash2, Clock, AlertCircle, Plus, X, User, Save } from 'lucide-react';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { profile, titles, details, loaded, saveResume, clearResume, addTitle, removeTitle, saveDetails } = useResumeProfile();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [form, setForm] = useState(details);
  const [saved, setSaved] = useState(true);

  useState(() => { if (loaded) setForm(details); });

  const onDrop = useCallback(async (f: File[]) => {
    const file = f[0]; if (!file) return;
    setUploading(true); setError('');
    try { const fd = new FormData(); fd.append('resume', file); const r = await fetch('/api/resume/parse', { method: 'POST', body: fd }); if (!r.ok) throw new Error('Failed'); saveResume(file.name, (await r.json()).text); toast.success('Resume uploaded!'); }
    catch (e: any) { setError(e.message); } finally { setUploading(false); }
  }, [saveResume]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] }, maxFiles: 1, maxSize: 10485760 });
  const handleSave = () => { saveDetails(form); setSaved(true); toast.success('Saved!'); };
  const upd = (k: string, v: string) => { setForm(p => ({ ...p, [k]: v })); setSaved(false); };

  if (!loaded) return <div className="py-20 text-center text-sm text-zinc-600">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-100">Profile</h1>
      <p className="mt-1 text-sm text-zinc-500">Your details, resume, and target roles.</p>

      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2"><User className="h-4 w-4 text-indigo-400" /> Personal Details</h2>
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-zinc-500 mb-1">Full Name</label><input type="text" value={form.fullName} onChange={e => upd('fullName', e.target.value)} placeholder="Name" className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs font-medium text-zinc-500 mb-1">Email</label><input type="email" value={form.email} onChange={e => upd('email', e.target.value)} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-zinc-500 mb-1">Phone</label><input type="tel" value={form.phone} onChange={e => upd('phone', e.target.value)} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs font-medium text-zinc-500 mb-1">Location</label><input type="text" value={form.location} onChange={e => upd('location', e.target.value)} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-zinc-500 mb-1">LinkedIn</label><input type="url" value={form.linkedin} onChange={e => upd('linkedin', e.target.value)} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs font-medium text-zinc-500 mb-1">GitHub</label><input type="url" value={form.github} onChange={e => upd('github', e.target.value)} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm" /></div>
          </div>
          <button onClick={handleSave} disabled={saved} className={['rounded-lg px-4 py-2 text-sm font-medium transition flex items-center gap-2', saved ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-600 text-white hover:bg-indigo-500'].join(' ')}>{saved ? <><CheckCircle className="h-4 w-4" />Saved</> : <><Save className="h-4 w-4" />Save</>}</button>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2"><FileText className="h-4 w-4 text-emerald-400" /> Base Resume</h2>
        {profile ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
              <div className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-emerald-400" /><div><p className="text-sm font-medium text-emerald-300">{profile.fileName}</p><p className="text-xs text-emerald-500/60 flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(profile.uploadedAt).toLocaleDateString()}</p></div></div>
              <button onClick={() => { clearResume(); toast('Removed'); }} className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-1"><Trash2 className="h-3 w-3" /> Remove</button>
            </div>
            <div {...getRootProps()} className={['rounded-lg border-2 border-dashed p-3 text-center cursor-pointer text-xs transition', isDragActive ? 'border-indigo-500/50' : 'border-zinc-800 text-zinc-600 hover:border-zinc-700'].join(' ')}><input {...getInputProps()} />{uploading ? 'Uploading...' : 'Drop to replace'}</div>
          </div>
        ) : (
          <div className="mt-4">
            <div {...getRootProps()} className={['flex flex-col items-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition', isDragActive ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-zinc-800 hover:border-zinc-700'].join(' ')}>
              <input {...getInputProps()} />
              {uploading ? <Loader2 className="h-8 w-8 animate-spin text-indigo-400" /> : <Upload className="h-8 w-8 text-zinc-600" />}
              <p className="mt-2 text-sm text-zinc-400">{uploading ? 'Parsing...' : 'Drop your resume here'}</p>
              <p className="text-xs text-zinc-600 mt-1">PDF, DOCX, or TXT</p>
            </div>
            {error && <p className="mt-3 text-sm text-red-400 flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</p>}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2"><Plus className="h-4 w-4 text-violet-400" /> Target Titles</h2>
        <div className="mt-4 flex gap-2">
          <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && (addTitle(newTitle), setNewTitle(''))} placeholder="e.g. AI Engineer" className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm" />
          <button onClick={() => { addTitle(newTitle); setNewTitle(''); }} disabled={!newTitle.trim()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">Add</button>
        </div>
        {titles.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">{titles.map(t => (<span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 text-sm text-violet-300">{t}<button onClick={() => removeTitle(t)} className="text-violet-500 hover:text-violet-300"><X className="h-3.5 w-3.5" /></button></span>))}</div>
        ) : (
          <div className="mt-3"><p className="text-xs text-zinc-600 mb-2">Suggestions:</p><div className="flex flex-wrap gap-1.5">{['AI Engineer','ML Engineer','Data Scientist','MLOps Engineer','NLP Engineer','Applied Scientist'].map(s => (<button key={s} onClick={() => addTitle(s)} className="rounded-full border border-zinc-800 px-2.5 py-1 text-xs text-zinc-500 hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/20 transition">{s}</button>))}</div></div>
        )}
      </div>
    </div>
  );
}
