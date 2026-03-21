'use client';
import { useState, useEffect, useCallback } from 'react';
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

  // Sync form when details load from Supabase
  useEffect(() => { if (loaded) { setForm(details); setSaved(true); } }, [loaded, details]);

  const onDrop = useCallback(async (f: File[]) => {
    const file = f[0]; if (!file) return;
    setUploading(true); setError('');
    try { const fd = new FormData(); fd.append('resume', file); const r = await fetch('/api/resume/parse', { method: 'POST', body: fd }); if (!r.ok) throw new Error('Failed'); await saveResume(file.name, (await r.json()).text); toast.success('Resume uploaded!'); }
    catch (e: any) { setError(e.message); } finally { setUploading(false); }
  }, [saveResume]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] }, maxFiles: 1, maxSize: 10485760 });
  const handleSave = () => { saveDetails(form); setSaved(true); toast.success('Profile saved!'); };
  const upd = (k: string, v: string) => { setForm(p => ({ ...p, [k]: v })); setSaved(false); };

  if (!loaded) return <div className="py-20 text-center text-sm text-gray-400">Loading profile...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      <p className="mt-1 text-sm text-gray-500">Manage your details, resume, and job preferences.</p>

      {/* Personal Details */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50"><h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><User className="h-4 w-4 text-brand-600" /> Personal Details</h2></div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name</label><input type="text" value={form.fullName} onChange={e => upd('fullName', e.target.value)} placeholder="Your name" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none" /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label><input type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="you@email.com" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Phone</label><input type="tel" value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="+1 (555) 000-0000" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none" /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Location</label><input type="text" value={form.location} onChange={e => upd('location', e.target.value)} placeholder="Dallas, TX" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">LinkedIn</label><input type="url" value={form.linkedin} onChange={e => upd('linkedin', e.target.value)} placeholder="linkedin.com/in/you" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none" /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">GitHub</label><input type="url" value={form.github} onChange={e => upd('github', e.target.value)} placeholder="github.com/you" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none" /></div>
          </div>
          <button onClick={handleSave} disabled={saved} className={['rounded-lg px-5 py-2.5 text-sm font-semibold transition flex items-center gap-2', saved ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-brand-600 text-white hover:bg-brand-700'].join(' ')}>{saved ? <><CheckCircle className="h-4 w-4" />Saved</> : <><Save className="h-4 w-4" />Save changes</>}</button>
        </div>
      </div>

      {/* Base Resume */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50"><h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><FileText className="h-4 w-4 text-green-600" /> Base Resume</h2></div>
        <div className="p-6">
          {profile ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 p-4">
                <div className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-600" /><div><p className="text-sm font-semibold text-green-800">{profile.fileName}</p><p className="text-xs text-green-600 flex items-center gap-1"><Clock className="h-3 w-3" />Uploaded {new Date(profile.uploadedAt).toLocaleDateString()}</p></div></div>
                <button onClick={() => { clearResume(); toast('Removed'); }} className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-1 transition"><Trash2 className="h-3 w-3" />Remove</button>
              </div>
              <div {...getRootProps()} className={['rounded-lg border-2 border-dashed p-3 text-center cursor-pointer text-xs transition', isDragActive ? 'border-brand-400 bg-brand-50' : 'border-gray-300 text-gray-400 hover:border-gray-400'].join(' ')}><input {...getInputProps()} />{uploading ? 'Uploading...' : 'Drop a new file to replace'}</div>
            </div>
          ) : (
            <div>
              <div {...getRootProps()} className={['flex flex-col items-center rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition', isDragActive ? 'border-brand-400 bg-brand-50' : 'border-gray-300 hover:border-brand-400'].join(' ')}>
                <input {...getInputProps()} />
                {uploading ? <Loader2 className="h-10 w-10 animate-spin text-brand-600" /> : <Upload className="h-10 w-10 text-gray-300" />}
                <p className="mt-3 text-sm font-medium text-gray-600">{uploading ? 'Parsing...' : 'Drop your resume here or click to browse'}</p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOCX, or TXT — up to 10 MB</p>
              </div>
              {error && <p className="mt-3 text-sm text-red-600 flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Target Titles */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50"><h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Plus className="h-4 w-4 text-purple-600" /> Target Job Titles</h2></div>
        <div className="p-6">
          <div className="flex gap-2 mb-4">
            <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && (addTitle(newTitle), setNewTitle(''))} placeholder="e.g. AI Engineer, ML Engineer" className="flex-1 rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none" />
            <button onClick={() => { addTitle(newTitle); setNewTitle(''); }} disabled={!newTitle.trim()} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition">Add</button>
          </div>
          {titles.length > 0 ? (
            <div className="flex flex-wrap gap-2">{titles.map(t => (<span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-3.5 py-1.5 text-sm font-medium text-purple-700">{t}<button onClick={() => removeTitle(t)} className="text-purple-400 hover:text-purple-700"><X className="h-3.5 w-3.5" /></button></span>))}</div>
          ) : (
            <div><p className="text-xs text-gray-400 mb-2">Quick add:</p><div className="flex flex-wrap gap-2">{['AI Engineer','ML Engineer','Data Scientist','MLOps Engineer','NLP Engineer'].map(s=>(<button key={s} onClick={() => addTitle(s)} className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition">{s}</button>))}</div></div>
          )}
        </div>
      </div>
    </div>
  );
}
