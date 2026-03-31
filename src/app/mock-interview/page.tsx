'use client';
import { useState, useEffect, useRef } from 'react';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Message { role:'bot'|'user'; text:string; score?:number; feedback?:string; fillers?:string[]; suggested?:string; keyPoints?:string[]; summary?:string; }

const FILLER_WORDS = ['um','uh','like','actually','basically','you know','i mean','sort of','kind of','literally','honestly','right','so','well','just'];

function detectFillers(text: string): string[] {
  const lower = text.toLowerCase();
  return FILLER_WORDS.filter(f => lower.includes(f));
}

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
  const [input, setInput] = useState('');
  const [qNum, setQNum] = useState(0);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState(true);
  const [history, setHistory] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<any>(null);

  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, loading]);

  const startInterview = async () => {
    if (!jt.trim()) { toast.error('Enter job title'); return; }
    setStarted(true); setLoading(true); setMessages([]); setQNum(1); setDone(false); setHistory('');
    try {
      const r = await fetch('/api/mock-interview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'start', jobTitle: jt, company: co, jobDescription: jd, mode, resumeText: profile?.text }) });
      const d = await r.json();
      if (d.error) { toast.error(d.error); setStarted(false); return; }
      const q = d.question || d.nextQuestion || 'Tell me about yourself.';
      setMessages([{ role: 'bot', text: q, suggested: d.suggestedAnswer, keyPoints: d.keyPoints }]);
      setHistory(`Q1: ${q}`);
    } catch (e: any) { toast.error('Failed to start'); setStarted(false); } finally { setLoading(false); }
  };

  const submitAnswer = async () => {
    if (!input.trim() || loading) return;
    const answer = input.trim();
    const fillers = detectFillers(answer);
    const userMsg: Message = { role: 'user', text: answer, fillers };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setLoading(true);

    const newHistory = `${history}\nA${qNum}: ${answer}`;
    setHistory(newHistory);

    try {
      const r = await fetch('/api/mock-interview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        action: 'respond', answer, questionNumber: qNum, jobTitle: jt, company: co, jobDescription: jd, mode, resumeText: profile?.text, history: newHistory,
      })});
      const d = await r.json();
      if (d.error) { toast.error(d.error); setLoading(false); return; }

      // Update user message with score/feedback
      userMsg.score = d.score;
      userMsg.feedback = d.feedback;
      setMessages(p => [...p.slice(0, -1), { ...userMsg }]);

      if (qNum >= 5 || !d.nextQuestion) {
        // Interview complete
        setDone(true);
        if (d.summary) setMessages(p => [...p, { role: 'bot', text: 'Interview complete! Here\'s your analysis:', summary: d.summary }]);
        else setMessages(p => [...p, { role: 'bot', text: 'Great job! Interview complete. Your scores are shown above.' }]);
        toast.success('Interview complete!');
      } else {
        // Next question
        const nextQ = d.nextQuestion;
        setQNum(q => q + 1);
        setHistory(`${newHistory}\nQ${qNum + 1}: ${nextQ}`);
        setMessages(p => [...p, { role: 'bot', text: nextQ, suggested: d.suggestedAnswer, keyPoints: d.keyPoints }]);
      }
    } catch (e: any) { toast.error('Failed'); } finally { setLoading(false); }
  };

  const toggleMic = () => {
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error('Speech not supported in this browser'); return; }
    const rec = new SR(); rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US';
    rec.onresult = (e: any) => { let t = ''; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; setInput(t); };
    rec.onerror = () => { setListening(false); recRef.current = null; };
    rec.onend = () => { setListening(false); recRef.current = null; };
    rec.start(); recRef.current = rec; setListening(true);
  };

  // Stats
  const scored = messages.filter(m => m.role === 'user' && m.score);
  const avgScore = scored.length ? Math.round(scored.reduce((a, m) => a + (m.score || 0), 0) / scored.length) : 0;
  const totalFillers = messages.filter(m => m.role === 'user').reduce((a, m) => a + (m.fillers?.length || 0), 0);

  // SETUP SCREEN
  if (!started) return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-5">
          <div className="glass-card rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#bbc3ff]">settings_voice</span>
              <h2 className="font-bold text-xl tracking-tight">Interview Setup</h2>
            </div>
            <div className="space-y-4">
              <div><label className="kinetic-label">Job Title *</label><input value={jt} onChange={e => setJt(e.target.value)} className="kinetic-input" placeholder="e.g. AI Engineer" /></div>
              <div><label className="kinetic-label">Company</label><input value={co} onChange={e => setCo(e.target.value)} className="kinetic-input" placeholder="e.g. Google" /></div>
              <div><label className="kinetic-label">Job Description</label><textarea value={jd} onChange={e => setJd(e.target.value)} rows={4} className="kinetic-input resize-none" placeholder="Paste JD for tailored questions..." /></div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-white/5" style={{background:'rgba(25,28,34,0.4)'}}>
              <div><p className="text-sm font-semibold">Real-Time Feedback</p><p className="text-[10px] text-[#c4c5d9]">Show score and fillers while talking</p></div>
              <button onClick={() => setFeedback(!feedback)} className={`w-10 h-5 rounded-full relative transition-all ${feedback?'bg-[#3c59fd]':'bg-[#434656]'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${feedback?'right-1':'left-1'}`} />
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setMode('practice'); startInterview(); }} className="flex-1 py-3 kinetic-btn-ghost text-sm font-bold rounded-xl">Practice</button>
              <button onClick={() => { setMode('real'); startInterview(); }} className="flex-1 py-3 kinetic-btn text-sm rounded-xl">Start Session</button>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-7 flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center" style={{background:'rgba(82,3,213,0.2)'}}>
              <span className="material-symbols-outlined text-[#cdbdff] text-5xl">record_voice_over</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tighter">AI Mock Interview</h2>
            <p className="text-[#c4c5d9] max-w-md mx-auto">5-question interview with real-time scoring, filler word detection, and suggested answers after each question.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // INTERVIEW SCREEN
  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Stats */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card rounded-xl p-5" style={{borderLeft:'4px solid #00daf3'}}>
              <p className="kinetic-label mb-1">Confidence</p>
              <h3 className="text-3xl font-extrabold text-[#00daf3]">{avgScore ? `${avgScore*10}%` : '—'}</h3>
              <p className="text-[10px] text-[#c4c5d9] mt-2">{scored.length} answers scored</p>
            </div>
            <div className="glass-card rounded-xl p-5" style={{borderLeft:'4px solid #cdbdff'}}>
              <p className="kinetic-label mb-1">Fillers</p>
              <h3 className="text-3xl font-extrabold text-[#cdbdff]">{totalFillers}</h3>
              <p className="text-[10px] text-[#c4c5d9] mt-2">Detected in answers</p>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 text-xs text-[#c4c5d9]">
            <p><span className="font-bold text-[#e1e2eb]">Q{qNum}/5</span> • {jt}{co ? ` at ${co}` : ''} • {mode}</p>
          </div>
          {done && <button onClick={() => { setStarted(false); setMessages([]); setDone(false); setQNum(0); }} className="kinetic-btn-ghost w-full py-3 text-sm">New Interview</button>}

          {/* Per-answer scores */}
          {scored.length > 0 && <div className="glass-card rounded-xl p-4 space-y-2">
            <p className="kinetic-label">Answer Scores</p>
            {scored.map((m, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-[#c4c5d9]">Q{i+1}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden"><div className={`h-full rounded-full ${(m.score||0)>=7?'bg-[#00daf3]':(m.score||0)>=5?'bg-[#cdbdff]':'bg-[#ffb4ab]'}`} style={{width:`${(m.score||0)*10}%`}}/></div>
                  <span className="font-bold text-[#e1e2eb] w-6 text-right">{m.score}/10</span>
                </div>
              </div>
            ))}
          </div>}
        </div>

        {/* Right: Chat */}
        <div className="col-span-12 lg:col-span-8">
          <div className="glass-card rounded-2xl flex flex-col overflow-hidden" style={{height:'calc(100vh - 120px)'}}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#5203d5] flex items-center justify-center"><span className="material-symbols-outlined text-[#cdbdff]" style={{fontVariationSettings:"'FILL' 1"}}>smart_toy</span></div>
                <div>
                  <h3 className="font-bold text-base">JobSeeker Bot</h3>
                  <div className="flex items-center gap-2"><span className={`w-1.5 h-1.5 rounded-full ${done?'bg-[#cdbdff]':'bg-[#00daf3] animate-pulse'}`}/><span className="text-[10px] font-bold uppercase tracking-wider" style={{color:done?'#cdbdff':'#00daf3'}}>{done?'Complete':`Q${qNum}/5`}</span></div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-5">
              {messages.map((m, i) => m.role === 'bot' ? (
                <div key={i} className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-[#cdbdff] text-xs border border-white/10">AI</div>
                  <div className="space-y-2">
                    <div className="glass-panel p-4 rounded-2xl rounded-tl-none"><p className="text-sm leading-relaxed">{m.text}</p></div>
                    {m.summary && <div className="glass-panel p-4 rounded-2xl border-[#00daf3]/20 bg-[#007886]/10"><p className="text-xs font-bold text-[#00daf3] uppercase tracking-widest mb-2">Analysis</p><p className="text-sm text-[#c4c5d9] leading-relaxed">{m.summary}</p></div>}
                    {feedback && m.suggested && <button className="text-[10px] text-[#bbc3ff]/60 hover:text-[#bbc3ff] transition" onClick={(e) => {const el = (e.target as HTMLElement).nextElementSibling; if(el) (el as HTMLElement).style.display = (el as HTMLElement).style.display === 'none' ? 'block' : 'none';}}>Show suggested answer ▼</button>}
                    {feedback && m.suggested && <div style={{display:'none'}} className="glass-panel p-3 rounded-xl text-xs text-[#c4c5d9] leading-relaxed border-[#bbc3ff]/10"><span className="text-[#bbc3ff] font-bold">Suggested: </span>{m.suggested}</div>}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex flex-row-reverse gap-3 max-w-[85%] ml-auto">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-[#3c59fd] flex items-center justify-center text-white text-xs font-bold">You</div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="p-4 rounded-2xl rounded-tr-none" style={{background:'rgba(187,195,255,0.1)',border:'1px solid rgba(187,195,255,0.2)'}}>
                      <p className="text-sm leading-relaxed">{m.text}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {m.score && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00daf3]/10 text-[#00daf3] border border-[#00daf3]/20">{m.score}/10</span>}
                      {m.fillers?.map((f, j) => <span key={j} className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#cdbdff]/10 text-[#cdbdff] border border-[#cdbdff]/20">{f}</span>)}
                    </div>
                    {feedback && m.feedback && <div className="glass-panel p-3 rounded-xl text-xs text-[#c4c5d9] max-w-md border-[#00daf3]/10"><span className="text-[#00daf3] font-bold">Feedback: </span>{m.feedback}</div>}
                  </div>
                </div>
              ))}
              {loading && <div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-[#cdbdff]">AI</div><div className="glass-panel p-4 rounded-2xl rounded-tl-none"><div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-[#bbc3ff] animate-bounce" style={{animationDelay:'0s'}}/><div className="w-2 h-2 rounded-full bg-[#cdbdff] animate-bounce" style={{animationDelay:'0.15s'}}/><div className="w-2 h-2 rounded-full bg-[#00daf3] animate-bounce" style={{animationDelay:'0.3s'}}/></div></div></div>}
            </div>

            {/* Input */}
            {!done && <div className="p-5 bg-white/5 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/10" style={{background:'rgba(11,14,20,0.4)'}}>
                  {listening && <div className="flex gap-1"><div className="w-1 h-3 bg-[#00daf3]/60 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}/><div className="w-1 h-5 bg-[#00daf3] rounded-full animate-bounce" style={{animationDelay:'0.2s'}}/><div className="w-1 h-4 bg-[#00daf3]/80 rounded-full animate-bounce" style={{animationDelay:'0.3s'}}/></div>}
                  <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAnswer(); }}} placeholder={listening ? 'Listening...' : 'Type your answer and press Enter...'} className="flex-1 bg-transparent border-none text-sm text-[#e1e2eb] placeholder:text-[#8e90a2] outline-none" />
                </div>
                <button onClick={toggleMic} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 border ${listening?'bg-[#ffb4ab]/10 text-[#ffb4ab] border-[#ffb4ab]/20':'bg-white/5 text-[#c4c5d9] border-white/10 hover:bg-white/10'}`}>
                  <span className="material-symbols-outlined" style={{fontVariationSettings:"'FILL' 1"}}>{listening?'mic_off':'mic'}</span>
                </button>
                <button onClick={submitAnswer} disabled={!input.trim() || loading} className="kinetic-btn px-5 py-3 rounded-xl text-sm disabled:opacity-50">Send</button>
              </div>
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
}
