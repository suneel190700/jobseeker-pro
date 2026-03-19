'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload, FileText, Loader2, CheckCircle, Trash2,
  User, Clock, AlertCircle,
} from 'lucide-react';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { profile, loaded, saveResume, clearResume } = useResumeProfile();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch('/api/resume/parse', { method: 'POST', body: formData });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to parse resume');
      }

      const data = await res.json();
      saveResume(file.name, data.text);
      toast.success('Base resume uploaded!', { description: 'Job match scores will now appear in search results.' });
    } catch (err: any) {
      setError(err.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  }, [saveResume]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleClear = () => {
    clearResume();
    toast('Base resume removed');
  };

  if (!loaded) return <div className="py-20 text-center text-sm text-slate-400">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
      <p className="mt-1 text-sm text-slate-500">Upload your base resume to enable job match scoring and one-click optimization.</p>

      {/* Base Resume Section */}
      <div className="mt-8 rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-brand-50 p-2">
            <FileText className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Base Resume</h2>
            <p className="text-xs text-slate-500">Used for job match scoring across all search results</p>
          </div>
        </div>

        {profile ? (
          <div className="space-y-4">
            {/* Current resume info */}
            <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-100 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">{profile.fileName}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Uploaded {new Date(profile.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button onClick={handleClear} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition flex items-center gap-1">
                <Trash2 className="h-3 w-3" /> Remove
              </button>
            </div>

            {/* Preview */}
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Preview (first 500 chars)</p>
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-xs text-slate-600 max-h-40 overflow-y-auto whitespace-pre-wrap">
                {profile.text.slice(0, 500)}{profile.text.length > 500 ? '...' : ''}
              </div>
            </div>

            {/* Replace */}
            <div {...getRootProps()} className={['rounded-lg border-2 border-dashed p-4 text-center cursor-pointer transition', isDragActive ? 'border-brand-400 bg-brand-50' : 'border-slate-200 hover:border-slate-300'].join(' ')}>
              <input {...getInputProps()} />
              <p className="text-xs text-slate-500">
                {uploading ? 'Uploading...' : 'Drop a new resume to replace, or click to browse'}
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div {...getRootProps()} className={['flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition', isDragActive ? 'border-brand-400 bg-brand-50' : 'border-slate-300 hover:border-slate-400'].join(' ')}>
              <input {...getInputProps()} />
              {uploading ? (
                <><Loader2 className="h-8 w-8 animate-spin text-brand-600" /><p className="mt-2 text-sm text-slate-500">Parsing resume...</p></>
              ) : (
                <><Upload className="h-8 w-8 text-slate-400" /><p className="mt-2 text-sm font-medium text-slate-600">Drop your resume here, or click to browse</p><p className="text-xs text-slate-400 mt-1">PDF, DOCX, or TXT — up to 10 MB</p></>
              )}
            </div>
            {error && <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600"><AlertCircle className="h-4 w-4 flex-shrink-0" />{error}</div>}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="mt-6 rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">How it works</h3>
        <div className="space-y-3">
          {[
            { step: '1', title: 'Upload your base resume', desc: 'Your resume is parsed and stored locally in your browser.' },
            { step: '2', title: 'Search for jobs', desc: 'Each job result shows an AI match percentage based on your resume.' },
            { step: '3', title: 'One-click optimize', desc: 'Click "Optimize" on any job to tailor your resume for that specific JD.' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">{item.step}</div>
              <div>
                <p className="text-sm font-medium text-slate-700">{item.title}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
