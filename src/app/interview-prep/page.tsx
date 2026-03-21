'use client';

import { useState, useEffect } from 'react';
import { Loader2, MessageCircle, BookOpen, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { toast } from 'sonner';

export default function InterviewPrepPage() {
  const { profile } = useResumeProfile();
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [activeTab, setActiveTab] = useState<'questions' | 'star' | 'company'>('questions');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({});
  const [error, setError] = useState('');

  useEffect(() => {
    const jd = sessionStorage.getItem('interview_jd'); if (jd) { setJobDescription(jd); sessionStorage.removeItem('interview_jd'); }
    const t = sessionStorage.getItem('interview_title'); if (t) { setJobTitle(t); sessionStorage.removeItem('interview_title'); }
    const c = sessionStorage.getItem('interview_company'); if (c) { setCompanyName(c); sessionStorage.removeItem('interview_company'); }
  }, []);

  const generate = async (type: string) => {
    if (!profile?.text) { toast.error('Upload resume in Profile first.'); return; }
    if (!jobDescription.trim()) { toast.error('Paste a job description.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/interview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resumeText: profile.text, jobDescription, jobTitle, companyName, type }) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed');
      const d = await res.json();
      setData((p: any) => ({ ...p, [type]: d }));
      toast.success('Generated!');
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const questions = data.questions;
  const star = data.star;
  const company = data.company;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-white">Interview Prep</h1>
      <p className="mt-1 text-sm text-zinc-400">AI-generated questions, STAR stories, and company research for your interview.</p>

      {!profile && <div className="mt-4 rounded-lg bg-amber-900/20 border border-amber-800/30 p-3 text-sm text-amber-400">Upload resume in <a href="/profile" className="font-medium underline">Profile</a> first.</div>}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div><label className="block text-xs font-medium text-zinc-300 mb-1">Job Title</label><input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. AI Engineer" className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-indigo-500/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/30" /></div>
        <div><label className="block text-xs font-medium text-zinc-300 mb-1">Company</label><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Google" className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-indigo-500/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/30" /></div>
      </div>
      <div className="mt-3"><label className="block text-xs font-medium text-zinc-300 mb-1">Job Description</label><textarea rows={5} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste JD..." className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-indigo-500/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/30" /></div>

      {/* Tabs */}
      <div className="mt-6 flex gap-2 border-b border-zinc-800 pb-0">
        {[{ key: 'questions', label: 'Interview Questions', icon: MessageCircle }, { key: 'star', label: 'STAR Stories', icon: BookOpen }, { key: 'company', label: 'Company Brief', icon: Building2 }].map((t) => (
          <button key={t.key} onClick={() => { setActiveTab(t.key as any); if (!data[t.key]) generate(t.key); }}
            className={['flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition', activeTab === t.key ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'].join(' ')}>
            <t.icon className="h-4 w-4" />{t.label}
            {data[t.key] && <CheckCircle className="h-3 w-3 text-green-500" />}
          </button>
        ))}
      </div>

      {error && <div className="mt-4 rounded-lg bg-red-900/20 p-3 text-sm text-red-400">{error}</div>}

      <div className="mt-6">
        {loading && <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-indigo-400" /></div>}

        {/* Questions */}
        {!loading && activeTab === 'questions' && (
          !questions ? (
            <div className="text-center py-12"><button onClick={() => generate('questions')} disabled={!profile || !jobDescription.trim()} className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition">Generate Interview Questions</button></div>
          ) : (
            <div className="space-y-6">
              {['behavioral', 'technical', 'system_design', 'role_specific'].map((cat) => (
                questions[cat]?.length > 0 && (
                  <div key={cat}>
                    <h3 className="text-sm font-semibold text-zinc-200 capitalize mb-3">{cat.replace('_', ' ')} Questions</h3>
                    <div className="space-y-3">{questions[cat].map((q: any, i: number) => (
                      <div key={i} className="rounded-lg border border-zinc-800 p-4">
                        <p className="text-sm font-medium text-white">{q.question}</p>
                        <p className="text-xs text-zinc-500 mt-1">Why: {q.why_asked}</p>
                        <p className="text-xs text-green-400 mt-1">Tip: {q.tip}</p>
                      </div>
                    ))}</div>
                  </div>
                )
              ))}
            </div>
          )
        )}

        {/* STAR */}
        {!loading && activeTab === 'star' && (
          !star ? (
            <div className="text-center py-12"><button onClick={() => generate('star')} disabled={!profile || !jobDescription.trim()} className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition">Generate STAR Stories</button></div>
          ) : (
            <div className="space-y-4">{star.stories?.map((s: any, i: number) => (
              <div key={i} className="rounded-lg border border-zinc-800 p-4">
                <div className="flex items-center justify-between mb-2"><h4 className="text-sm font-semibold text-white">{s.title}</h4><span className="text-[10px] text-zinc-500">For: {s.relevant_for}</span></div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><p className="font-medium text-blue-400">Situation</p><p className="text-zinc-300 mt-0.5">{s.situation}</p></div>
                  <div><p className="font-medium text-amber-400">Task</p><p className="text-zinc-300 mt-0.5">{s.task}</p></div>
                  <div><p className="font-medium text-green-400">Action</p><p className="text-zinc-300 mt-0.5">{s.action}</p></div>
                  <div><p className="font-medium text-purple-400">Result</p><p className="text-zinc-300 mt-0.5">{s.result}</p></div>
                </div>
                {s.keywords?.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{s.keywords.map((k: string) => (<span key={k} className="rounded-full bg-zinc-800 px-2 py-0.5 text-[9px] text-zinc-300">{k}</span>))}</div>}
              </div>
            ))}</div>
          )
        )}

        {/* Company */}
        {!loading && activeTab === 'company' && (
          !company ? (
            <div className="text-center py-12"><button onClick={() => generate('company')} disabled={!profile || !jobDescription.trim()} className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition">Generate Company Brief</button></div>
          ) : (
            <div className="space-y-4">
              {company.company_overview && <div className="rounded-lg bg-blue-900/20 border border-blue-100 p-4"><h4 className="text-sm font-semibold text-blue-800">Overview</h4><p className="text-xs text-blue-700 mt-1">{company.company_overview}</p></div>}
              {company.culture_values?.length > 0 && <div className="rounded-lg border border-zinc-800 p-4"><h4 className="text-sm font-semibold text-zinc-200">Culture & Values</h4><div className="mt-2 flex flex-wrap gap-2">{company.culture_values.map((v: string) => (<span key={v} className="rounded-full bg-purple-900/20 px-3 py-1 text-xs text-purple-400">{v}</span>))}</div></div>}
              {company.interview_talking_points?.length > 0 && <div className="rounded-lg border border-zinc-800 p-4"><h4 className="text-sm font-semibold text-zinc-200">Talking Points</h4><div className="mt-2 space-y-1">{company.interview_talking_points.map((t: string, i: number) => (<p key={i} className="text-xs text-zinc-300">• {t}</p>))}</div></div>}
              {company.questions_to_ask?.length > 0 && <div className="rounded-lg border border-green-800/30 bg-green-900/20 p-4"><h4 className="text-sm font-semibold text-green-400">Questions to Ask</h4><div className="mt-2 space-y-1">{company.questions_to_ask.map((q: string, i: number) => (<p key={i} className="text-xs text-green-400">• {q}</p>))}</div></div>}
              {company.recent_news && <div className="rounded-lg border border-zinc-800 p-4"><h4 className="text-sm font-semibold text-zinc-200">Research Before Interview</h4><p className="text-xs text-zinc-300 mt-1">{company.recent_news}</p></div>}
            </div>
          )
        )}
      </div>
    </div>
  );
}
