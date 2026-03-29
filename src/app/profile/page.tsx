'use client';
import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, CheckCircle, Trash2, Clock, AlertCircle, Plus, X, User, Save, Sparkles } from 'lucide-react';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { profile, titles, details, loaded, saveResume, clearResume, addTitle, removeTitle, saveDetails } = useResumeProfile();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [form, setForm] = useState(details);
  const [saved, setSaved] = useState(true);

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

  if (!loaded) return <div className="py-20 text-center text-sm text-white/25"><Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />Loading profile...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white/90 tracking-tight">My Profile</h1>
      <p className="mt-1 text-sm text-white/35">Manage your details, resume, and target roles</p>

      {/* Personal Details */}
      <div className="mt-8 surface overflow-hidden">
        <div className="px-6 py-4 bg-[var(--surface-1)] border-b border-[var(--separator)]"><h2 className="text-sm font-bold text-white/70 flex items-center gap-2"><User className="h-4 w-4 text-[#30d158]" />Personal Details</h2></div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-white/35 mb-1.5">Full Name</label><input type="text" value={form.fullName} onChange={e => upd('fullName', e.target.value)} placeholder="Your name" className="input-hig" /></div>
            <div><label className="block text-xs font-semibold text-white/35 mb-1.5">Email</label><input type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="you@email.com" className="input-hig" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-white/35 mb-1.5">Phone</label><input type="tel" value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="+1 (555) 000-0000" className="input-hig" /></div>
            <div><label className="block text-xs font-semibold text-white/35 mb-1.5">Location</label><input type="text" value={form.location} onChange={e => upd('location', e.target.value)} placeholder="Dallas, TX" className="input-hig" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-white/35 mb-1.5">LinkedIn</label><input type="url" value={form.linkedin} onChange={e => upd('linkedin', e.target.value)} placeholder="linkedin.com/in/you" className="input-hig" /></div>
            <div><label className="block text-xs font-semibold text-white/35 mb-1.5">GitHub</label><input type="url" value={form.github} onChange={e => upd('github', e.target.value)} placeholder="github.com/you" className="input-hig" /></div>
          </div>
          <button onClick={handleSave} disabled={saved} className={`rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${saved ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'btn-filled'}`}>{saved ? <><CheckCircle className="h-4 w-4" />Saved</> : <><Save className="h-4 w-4" />Save changes</>}</button>
        </div>
      </div>

      {/* Base Resume */}
      <div className="mt-5 surface overflow-hidden">
        <div className="px-6 py-4 bg-[var(--surface-1)] border-b border-[var(--separator)]"><h2 className="text-sm font-bold text-white/70 flex items-center gap-2"><FileText className="h-4 w-4 text-emerald-500" />Base Resume</h2></div>
        <div className="p-6">
          {profile ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-[#30d158]/10 border border-[#30d158]/20 p-4">
                <div className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-[#30d158]" /><div><p className="text-sm font-bold text-[#30d158]">{profile.fileName}</p><p className="text-xs text-[#30d158] flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(profile.uploadedAt).toLocaleDateString()}</p></div></div>
                <button onClick={() => { clearResume(); toast('Removed'); }} className="rounded-2xl border border-[#ff453a]/20 bg-[var(--surface-1)] px-3 py-1.5 text-xs font-semibold text-[#ff453a] hover:bg-[#ff453a]/10 flex items-center gap-1 transition"><Trash2 className="h-3 w-3" />Remove</button>
              </div>
              <div {...getRootProps()} className={`rounded-2xl border-2 border-dashed p-3 text-center cursor-pointer text-xs transition-all ${isDragActive ? 'border-emerald-500/40 bg-[#30d158]/10' : 'border-[var(--separator)] text-white/25 hover:border-[var(--separator)]'}`}><input {...getInputProps()} />{uploading ? 'Uploading...' : 'Drop a new file to replace'}</div>
            </div>
          ) : (
            <div>
              <div {...getRootProps()} className={`flex flex-col items-center rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all ${isDragActive ? 'border-emerald-500/40 bg-[#30d158]/10' : 'border-[var(--separator)] hover:border-emerald-500/40 hover:bg-[#30d158]/10/30'}`}>
                <input {...getInputProps()} />
                {uploading ? <Loader2 className="h-10 w-10 animate-spin text-[#30d158]" /> : <Upload className="h-10 w-10 text-white/25" />}
                <p className="mt-4 text-sm font-semibold text-white/50">{uploading ? 'Parsing...' : 'Drop your resume here'}</p>
                <p className="text-xs text-white/25 mt-1">PDF, DOCX, or TXT — up to 10 MB</p>
              </div>
              {error && <p className="mt-3 text-sm text-[#ff453a] flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Target Titles */}
      <div className="mt-5 surface overflow-hidden">
        <div className="px-6 py-4 bg-[var(--surface-1)] border-b border-[var(--separator)]"><h2 className="text-sm font-bold text-white/70 flex items-center gap-2"><Sparkles className="h-4 w-4 text-violet-500" />Target Job Titles</h2></div>
        <div className="p-6">
          <div className="flex gap-2 mb-4">
            <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && newTitle.trim() && (addTitle(newTitle), setNewTitle(''))} placeholder="e.g. AI Engineer, ML Engineer" className="input-hig flex-1" />
            <button onClick={() => { addTitle(newTitle); setNewTitle(''); }} disabled={!newTitle.trim()} className="btn-filled px-5 py-2.5 text-sm disabled:opacity-50">Add</button>
          </div>
          {titles.length > 0 ? (
            <div className="flex flex-wrap gap-2">{titles.map(t => (<span key={t} className="pill bg-[#bf5af2]/10 text-[#bf5af2] border border-[#bf5af2]/20 gap-1.5 pl-3 pr-2 py-1.5">{t}<button onClick={() => removeTitle(t)} className="text-violet-300 hover:text-[#bf5af2] transition"><X className="h-3.5 w-3.5" /></button></span>))}</div>
          ) : (
            <div><p className="text-xs text-white/25 mb-2">Quick add:</p><div className="flex flex-wrap gap-2">{['AI Engineer','ML Engineer','Data Scientist','MLOps Engineer','Software Engineer','Product Manager','DevOps Engineer'].map(s => (<button key={s} onClick={() => addTitle(s)} className="pill bg-[var(--surface-1)] text-white/35 border border-[var(--separator)] hover:bg-[#30d158]/10 hover:text-[#30d158] hover:border-[#30d158]/20 transition cursor-pointer">{s}</button>))}</div></div>
          )}
        </div>
      </div>
    </div>
  );
}
