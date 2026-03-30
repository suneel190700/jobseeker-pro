'use client';
import { useState, useEffect, useRef } from 'react';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Message { role:'interviewer'|'user'; text:string; score?:number; fillers?:string[]; suggested?:string; }

export default function MockInterviewPage() {
  const { profile } = useResumeProfile();
  const [jt, setJt] = useState('');
  const [co, setCo] = useState('');
  const [jd, setJd] = useState('');
  const [mode, setMode] = useState<'practice'|'real'>('practice');
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [qNum, setQNum] = useState(0);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' }); }, [messages]);

  const startInterview = async () => {
    if (!jt.trim()) { toast.error('Enter job title'); return; }
    setStarted(true); setLoading(true); setMessages([]); setQNum(1);
    try {
      const r = await fetch('/api/mock-interview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'start', jobTitle: jt, company: co, jobDescription: jd, mode, resumeText: profile?.text }) });
      const d = await r.json(); if (d.question) setMessages([{ role: 'interviewer', text: d.question }]);
    } catch { toast.error('Failed to start'); setStarted(false); } finally { setLoading(false); }
  };

  const submitAnswer = async (text: string) => {
    if (!text.trim()) return; setLoading(true);
    const userMsg: Message = { role: 'user', text };
    setMessages(p => [...p, userMsg]); setTranscript('');
    try {
      const r = await fetch('/api/mock-interview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'answer', answer: text, questionNumber: qNum, jobTitle: jt, company: co, jobDescription: jd, mode, resumeText: profile?.text }) });
      const d = await r.json();
      if (d.fillers?.length) userMsg.fillers = d.fillers;
      if (d.score) userMsg.score = d.score;
      if (d.suggested_answer) userMsg.suggested = d.suggested_answer;
      setMessages(p => [...p.slice(0, -1), userMsg]);
      if (d.next_question && qNum < 5) { setMessages(p => [...p, { role: 'interviewer', text: d.next_question }]); setQNum(q => q + 1); }
      else { setDone(true); toast.success('Interview complete!'); }
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  const toggleMic = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) { toast.error('Speech not supported'); return; }
    if (listening) { setListening(false); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR(); rec.continuous = true; rec.interimResults = true;
    rec.onresult = (e: any) => { let t = ''; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; setTranscript(t); };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start(); setListening(true);
  };

  const totalScore = messages.filter(m => m.score).reduce((a, m) => a + (m.score || 0), 0);
  const scored = messages.filter(m => m.score).length;
  const avgScore = scored ? Math.round(totalScore / scored) : 0;
  const totalFillers = messages.reduce((a, m) => a + (m.fillers?.length || 0), 0);

  if (!started) return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-5">
          <section className="glass-card rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#bbc3ff]">settings_voice</span>
              <h2 className="font-bold text-xl tracking-tight">Interview Setup</h2>
            </div>
            <div className="space-y-4">
              <div><label className="kinetic-label">Job Title</label><input value={jt} onChange={e => setJt(e.target.value)} className="kinetic-input" placeholder="e.g. Senior Product Designer" /></div>
              <div><label className="kinetic-label">Company</label><input value={co} onChange={e => setCo(e.target.value)} className="kinetic-input" placeholder="e.g. Stripe, Figma" /></div>
              <div><label className="kinetic-label">Job Description</label><textarea value={jd} onChange={e => setJd(e.target.value)} rows={4} className="kinetic-input resize-none" placeholder="Paste JD for tailored questions..." /></div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-white/5" style={{background:'rgba(25,28,34,0.4)'}}>
              <div><p className="text-sm font-semibold">Real-Time Feedback</p><p className="text-[10px] text-[#c4c5d9]">Show score and fillers while talking</p></div>
              <button onClick={() => setFeedback(!feedback)} className={`w-10 h-5 rounded-full relative transition-all ${feedback?'bg-[#3c59fd]':'bg-[#434656]'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${feedback?'right-1':'left-1'}`} />
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setMode('practice'); startInterview(); }} className="flex-1 py-3 bg-white/5 font-bold text-xs rounded-xl border border-white/10 hover:bg-white/10 transition-all">Practice</button>
              <button onClick={() => { setMode('real'); startInterview(); }} className="flex-1 py-3 kinetic-btn text-xs rounded-xl">Start Session</button>
            </div>
          </section>
        </div>
        <div className="col-span-12 lg:col-span-7 flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center" style={{background:'rgba(82,3,213,0.2)'}}>
              <span className="material-symbols-outlined text-[#cdbdff] text-5xl">record_voice_over</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tighter">AI Mock Interview</h2>
            <p className="text-[#c4c5d9] max-w-md mx-auto">Voice-powered interview simulation with real-time scoring, filler word detection, and suggested answers.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card rounded-xl p-5" style={{borderLeft:'4px solid #00daf3'}}>
              <p className="kinetic-label mb-1">Confidence</p>
              <h3 className="text-3xl font-extrabold text-[#00daf3]">{avgScore}%</h3>
              <p className="text-[10px] text-[#c4c5d9] mt-2">{scored} answers scored</p>
            </div>
            <div className="glass-card rounded-xl p-5" style={{borderLeft:'4px solid #cdbdff'}}>
              <p className="kinetic-label mb-1">Filler Words</p>
              <h3 className="text-3xl font-extrabold text-[#cdbdff]">{totalFillers}</h3>
              <p className="text-[10px] text-[#c4c5d9] mt-2">Detected across answers</p>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 text-xs text-[#c4c5d9]">
            <p><span className="font-bold text-[#e1e2eb]">Q{qNum}/5</span> • {jt}{co ? ` at ${co}` : ''}</p>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <div className="glass-card rounded-2xl flex flex-col overflow-hidden" style={{height:'calc(100vh - 160px)',boxShadow:'0 25px 60px rgba(0,0,0,0.4)'}}>
            {/* Header */}
            <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#5203d5] flex items-center justify-center text-[#cdbdff]">
                  <span className="material-symbols-outlined" style={{fontVariationSettings:"'FILL' 1"}}>smart_toy</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">JobSeeker Bot</h3>
                  <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#00daf3] rounded-full animate-pulse" /><span className="text-[10px] text-[#00daf3] font-bold uppercase tracking-wider">{done?'Complete':'Interviewing...'}</span></div>
                </div>
              </div>
              <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#c4c5d9] border border-white/5">Q{qNum}/5</span>
            </div>

            {/* Chat Body */}
            <div ref={chatRef} className="flex-1 overflow-y-auto p-8 space-y-6" style={{scrollbarWidth:'thin'}}>
              {messages.map((m, i) => m.role === 'interviewer' ? (
                <div key={i} className="flex gap-4 max-w-2xl">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-[#cdbdff] text-xs border border-white/10">AI</div>
                  <div className="glass-panel p-5 rounded-2xl rounded-tl-none"><p className="text-sm leading-relaxed">{m.text}</p></div>
                </div>
              ) : (
                <div key={i} className="flex flex-row-reverse gap-4 max-w-2xl ml-auto">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-[#3c59fd] flex items-center justify-center text-white text-xs">You</div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="p-5 rounded-2xl rounded-tr-none" style={{background:'rgba(187,195,255,0.1)',border:'1px solid rgba(187,195,255,0.2)'}}>
                      <p className="text-sm leading-relaxed">{m.text}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {m.score && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00daf3]/10 text-[#00daf3] border border-[#00daf3]/20">{m.score}/10</span>}
                      {m.fillers?.map((f, j) => <span key={j} className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#cdbdff]/10 text-[#cdbdff] border border-[#cdbdff]/20 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">warning</span>{f}</span>)}
                    </div>
                    {m.suggested && feedback && <div className="glass-panel p-3 rounded-xl text-xs text-[#c4c5d9] max-w-md"><span className="text-[#bbc3ff] font-bold">Suggested: </span>{m.suggested}</div>}
                  </div>
                </div>
              ))}
              {loading && <div className="flex gap-4"><div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">AI</div><div className="glass-panel p-4 rounded-2xl"><Loader2 className="h-4 w-4 animate-spin text-[#bbc3ff]" /></div></div>}
            </div>

            {/* Input */}
            {!done && <div className="p-6 bg-white/5 border-t border-white/10">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <div className="flex items-center gap-4 px-6 py-4 rounded-full border border-white/10" style={{background:'rgba(11,14,20,0.4)'}}>
                    {listening && <div className="flex gap-1"><div className="w-1 h-3 bg-[#00daf3]/60 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}/><div className="w-1 h-5 bg-[#00daf3] rounded-full animate-bounce" style={{animationDelay:'0.2s'}}/><div className="w-1 h-4 bg-[#00daf3]/80 rounded-full animate-bounce" style={{animationDelay:'0.3s'}}/></div>}
                    <input value={transcript} onChange={e => setTranscript(e.target.value)} onKeyDown={e => e.key==='Enter'&&submitAnswer(transcript)} placeholder={listening?'Listening...':'Type your answer...'} className="flex-1 bg-transparent border-none text-sm text-[#e1e2eb] placeholder:text-[#8e90a2] outline-none" />
                  </div>
                </div>
                <button onClick={toggleMic} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 border backdrop-blur-md ${listening?'bg-[#ffb4ab]/10 text-[#ffb4ab] border-[#ffb4ab]/20':'bg-white/5 text-[#c4c5d9] border-white/10 hover:bg-white/10'}`}>
                  <span className="material-symbols-outlined" style={{fontVariationSettings:"'FILL' 1"}}>{listening?'mic_off':'mic'}</span>
                </button>
                {transcript && <button onClick={() => submitAnswer(transcript)} className="kinetic-btn px-6 py-3 rounded-full">Submit</button>}
                {done || qNum>=5 && !loading ? <button onClick={() => { setDone(true); toast.success('Interview complete!'); }} className="kinetic-btn px-6 py-3 rounded-full">End & Analyze</button> : null}
              </div>
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
}
