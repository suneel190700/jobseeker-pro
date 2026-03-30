'use client';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { toast } from 'sonner';

export default function InterviewPrepPage() {
  const { profile } = useResumeProfile();
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [activeTab, setActiveTab] = useState<'questions'|'star'|'company'>('questions');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({});
  const [error, setError] = useState('');
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (profile?.text) setResumeText(profile.text);
    const jd = sessionStorage.getItem('interview_jd'); if (jd) { setJobDescription(jd); sessionStorage.removeItem('interview_jd'); }
    const t = sessionStorage.getItem('interview_title'); if (t) { setJobTitle(t); sessionStorage.removeItem('interview_title'); }
    const c = sessionStorage.getItem('interview_company'); if (c) { setCompanyName(c); sessionStorage.removeItem('interview_company'); }
  }, [profile]);

  const generate = async (type: string) => {
    if (!resumeText.trim() && !profile?.text) { toast.error('Enter your resume text or upload in Profile.'); return; }
    if (!jobDescription.trim()) { toast.error('Paste a job description.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/interview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resumeText: resumeText || profile?.text, jobDescription, jobTitle, companyName, type }) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed');
      const d = await res.json();
      setData((p: any) => ({ ...p, [type]: d }));
      toast.success('Generated!');
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const toggleAnswer = (key: string) => setShowAnswers(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tighter text-[#bbc3ff]">Interview Prep</h1>
      <p className="mt-1 text-sm text-[#c4c5d9]">AI-generated questions with answers, STAR stories, and company research.</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div><label className="kinetic-label">Job Title</label><input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. AI Engineer" className="kinetic-input" /></div>
        <div><label className="kinetic-label">Company</label><input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Google" className="kinetic-input" /></div>
      </div>
      <div className="mt-3"><label className="kinetic-label">Job Description</label><textarea rows={4} value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste JD..." className="kinetic-input resize-none" /></div>
      <div className="mt-3"><label className="kinetic-label">Your Resume (paste or auto-loaded from profile)</label><textarea rows={4} value={resumeText} onChange={e => setResumeText(e.target.value)} placeholder="Paste your resume text here..." className="kinetic-input resize-none" /></div>
      {profile?.text && !resumeText && <button onClick={() => setResumeText(profile.text)} className="mt-1 text-xs text-[#bbc3ff] hover:underline">Load from profile</button>}

      {/* Tabs */}
      <div className="mt-6 flex gap-1 p-1 glass-card rounded-2xl w-fit">
        {[{key:'questions',label:'Questions & Answers',icon:'quiz'},{key:'star',label:'STAR Stories',icon:'auto_stories'},{key:'company',label:'Company Brief',icon:'apartment'}].map(t => (
          <button key={t.key} onClick={() => { setActiveTab(t.key as any); if (!data[t.key]) generate(t.key); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === t.key ? 'bg-[#3c59fd] text-white shadow-lg' : 'text-[#8e90a2] hover:text-[#c4c5d9]'}`}>
            <span className="material-symbols-outlined text-base">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {error && <div className="mt-4 glass-panel rounded-2xl p-3 border-[#ffb4ab]/20 bg-[#93000a]/10 text-sm text-[#ffb4ab]">{error}</div>}

      <div className="mt-6">
        {loading && <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[#bbc3ff]" /><span className="ml-3 text-sm text-[#8e90a2]">Generating...</span></div>}

        {/* Questions */}
        {!loading && activeTab === 'questions' && (
          !data.questions ? (
            <div className="text-center py-16 glass-card rounded-2xl">
              <span className="material-symbols-outlined text-4xl text-[#8e90a2] mb-4">quiz</span>
              <p className="text-[#8e90a2] mb-4">Generate interview questions with sample answers</p>
              <button onClick={() => generate('questions')} disabled={!jobDescription.trim()} className="kinetic-btn px-6 py-3 text-sm disabled:opacity-50">Generate Questions</button>
            </div>
          ) : (
            <div className="space-y-6">
              {['technical','behavioral','system_design'].map(cat => {
                const items = data.questions[cat];
                if (!items?.length) return null;
                return (
                  <div key={cat}>
                    <h3 className="text-sm font-bold text-[#bbc3ff] uppercase tracking-widest mb-3">{cat.replace('_',' ')} Questions</h3>
                    <div className="space-y-3">{items.map((q: any, i: number) => {
                      const key = `${cat}-${i}`;
                      return (
                        <div key={i} className="glass-card rounded-2xl p-5">
                          <p className="text-sm font-semibold text-[#e1e2eb] mb-2">{q.question}</p>
                          {q.why_asked && <p className="text-xs text-[#8e90a2] mb-2">Why asked: {q.why_asked}</p>}
                          {q.tip && <p className="text-xs text-[#00daf3] mb-3"><span className="material-symbols-outlined text-xs align-middle mr-1">lightbulb</span>{q.tip}</p>}
                          {q.answer && <>
                            <button onClick={() => toggleAnswer(key)} className="text-xs font-bold text-[#cdbdff] hover:underline flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">{showAnswers[key]?'visibility_off':'visibility'}</span>
                              {showAnswers[key]?'Hide':'Show'} Sample Answer
                            </button>
                            {showAnswers[key] && <div className="mt-3 p-4 rounded-xl bg-[#5203d5]/10 border border-[#cdbdff]/20 text-xs text-[#c4c5d9] leading-relaxed">{q.answer}</div>}
                          </>}
                        </div>
                      );
                    })}</div>
                  </div>
                );
              })}
              {data.questions.questions_to_ask?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#00daf3] uppercase tracking-widest mb-3">Questions You Should Ask</h3>
                  <div className="space-y-2">{data.questions.questions_to_ask.map((q: any, i: number) => (
                    <div key={i} className="glass-card rounded-2xl p-4"><p className="text-sm text-[#e1e2eb]">{q.question}</p>{q.why_good && <p className="text-xs text-[#8e90a2] mt-1">{q.why_good}</p>}</div>
                  ))}</div>
                </div>
              )}
            </div>
          )
        )}

        {/* STAR */}
        {!loading && activeTab === 'star' && (
          !data.star ? (
            <div className="text-center py-16 glass-card rounded-2xl">
              <span className="material-symbols-outlined text-4xl text-[#8e90a2] mb-4">auto_stories</span>
              <p className="text-[#8e90a2] mb-4">Generate STAR stories from your experience</p>
              <button onClick={() => generate('star')} disabled={!jobDescription.trim()} className="kinetic-btn px-6 py-3 text-sm disabled:opacity-50">Generate Stories</button>
            </div>
          ) : (
            <div className="space-y-4">{data.star.stories?.map((s: any, i: number) => (
              <div key={i} className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4"><h4 className="text-sm font-bold text-[#e1e2eb]">{s.title}</h4><span className="text-[10px] text-[#8e90a2] bg-white/5 px-2 py-1 rounded">For: {s.relevant_for}</span></div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-[#3c59fd]/10 border border-[#bbc3ff]/10"><p className="font-bold text-[#bbc3ff] mb-1">Situation</p><p className="text-[#c4c5d9]">{s.situation}</p></div>
                  <div className="p-3 rounded-xl bg-[#5203d5]/10 border border-[#cdbdff]/10"><p className="font-bold text-[#cdbdff] mb-1">Task</p><p className="text-[#c4c5d9]">{s.task}</p></div>
                  <div className="p-3 rounded-xl bg-[#007886]/10 border border-[#00daf3]/10"><p className="font-bold text-[#00daf3] mb-1">Action</p><p className="text-[#c4c5d9]">{s.action}</p></div>
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/10"><p className="font-bold text-green-400 mb-1">Result</p><p className="text-[#c4c5d9]">{s.result}</p></div>
                </div>
              </div>
            ))}</div>
          )
        )}

        {/* Company */}
        {!loading && activeTab === 'company' && (
          !data.company ? (
            <div className="text-center py-16 glass-card rounded-2xl">
              <span className="material-symbols-outlined text-4xl text-[#8e90a2] mb-4">apartment</span>
              <p className="text-[#8e90a2] mb-4">Generate company research brief</p>
              <button onClick={() => generate('company')} disabled={!jobDescription.trim()} className="kinetic-btn px-6 py-3 text-sm disabled:opacity-50">Research Company</button>
            </div>
          ) : (
            <div className="space-y-4">
              {data.company.company_overview && <div className="glass-card rounded-2xl p-5"><h4 className="text-xs font-bold text-[#bbc3ff] uppercase tracking-widest mb-2">Overview</h4><p className="text-sm text-[#c4c5d9] leading-relaxed">{data.company.company_overview}</p></div>}
              {data.company.culture_values?.length>0 && <div className="glass-card rounded-2xl p-5"><h4 className="text-xs font-bold text-[#cdbdff] uppercase tracking-widest mb-2">Culture & Values</h4><div className="flex flex-wrap gap-2">{data.company.culture_values.map((v:string,i:number) => <span key={i} className="px-3 py-1 rounded-lg bg-[#5203d5]/10 text-[#cdbdff] text-xs border border-[#cdbdff]/20">{v}</span>)}</div></div>}
              {data.company.tips?.length>0 && <div className="glass-card rounded-2xl p-5"><h4 className="text-xs font-bold text-[#00daf3] uppercase tracking-widest mb-2">Interview Tips</h4><div className="space-y-1">{data.company.tips.map((t:string,i:number) => <p key={i} className="text-sm text-[#c4c5d9]">• {t}</p>)}</div></div>}
              {data.company.questions_to_ask?.length>0 && <div className="glass-card rounded-2xl p-5 border-[#00daf3]/20"><h4 className="text-xs font-bold text-[#00daf3] uppercase tracking-widest mb-2">Questions to Ask</h4><div className="space-y-1">{data.company.questions_to_ask.map((q:string,i:number) => <p key={i} className="text-sm text-[#c4c5d9]">• {q}</p>)}</div></div>}
            </div>
          )
        )}
      </div>
    </div>
  );
}
