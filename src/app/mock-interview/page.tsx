'use client';
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Loader2, RotateCcw, Star, CheckCircle, AlertTriangle, MessageSquare, Volume2, Eye, EyeOff, Lightbulb } from 'lucide-react';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { toast } from 'sonner';

interface Msg { role:'interviewer'|'you'|'feedback'|'system'; text:string; score?:number; suggestion?:string; keyPoints?:string[]; fillerData?:{count:number;words:Record<string,number>;wpm:number;rating:string}; }

const FILLERS = ['um','uh','like','you know','basically','actually','literally','right','so','i mean','kind of','sort of'];

export default function MockInterviewPage() {
  const { profile } = useResumeProfile();
  const [jd,setJd]=useState('');const [role,setRole]=useState('');const [company,setCompany]=useState('');
  const [started,setStarted]=useState(false);const [mode,setMode]=useState<'practice'|'real'>('practice');
  const [msgs,setMsgs]=useState<Msg[]>([]);const [input,setInput]=useState('');const [loading,setLoading]=useState(false);
  const [qNum,setQNum]=useState(0);const [scores,setScores]=useState<number[]>([]);
  const [recording,setRecording]=useState(false);const [transcript,setTranscript]=useState('');
  const [showHints,setShowHints]=useState(true);
  const chatRef=useRef<HTMLDivElement>(null);
  const recognitionRef=useRef<any>(null);
  const startTimeRef=useRef<number>(0);

  const analyzeFillers=(text:string,durationSec:number)=>{
    const lower=text.toLowerCase();const words:Record<string,number>={};let total=0;
    FILLERS.forEach(f=>{const regex=new RegExp(`\\b${f}\\b`,'gi');const matches=lower.match(regex);if(matches){words[f]=matches.length;total+=matches.length;}});
    const wordCount=text.split(/\s+/).length;const wpm=durationSec>0?Math.round((wordCount/durationSec)*60):0;
    const rating=total<=1?'Excellent':total<=3?'Good':total<=5?'Needs Work':'Too Many Fillers';
    return{count:total,words,wpm,rating};
  };

  const startRecording=()=>{
    const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
    if(!SR){toast.error('Speech recognition not supported. Use Chrome/Edge.');return;}
    const r=new SR();r.continuous=true;r.interimResults=true;r.lang='en-US';
    let finalT='';
    r.onresult=(e:any)=>{let interim='';for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)finalT+=e.results[i][0].transcript+' ';else interim+=e.results[i][0].transcript;}setTranscript(finalT+interim);};
    r.onerror=()=>{setRecording(false);};
    r.onend=()=>{if(recording)r.start();};
    r.start();recognitionRef.current=r;setRecording(true);setTranscript('');startTimeRef.current=Date.now();
  };

  const stopRecording=()=>{
    if(recognitionRef.current){recognitionRef.current.onend=null;recognitionRef.current.stop();}
    setRecording(false);
    const duration=(Date.now()-startTimeRef.current)/1000;
    if(transcript.trim()){setInput(transcript.trim());const fd=analyzeFillers(transcript,duration);sendAnswer(transcript.trim(),fd);}
  };

  const startInterview=async()=>{
    if(!jd.trim()){toast.error('Paste the job description');return;}
    setStarted(true);setLoading(true);
    try{
      const r=await fetch('/api/mock-interview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'start',jobDescription:jd,jobTitle:role,company,resumeText:profile?.text||'',mode})});
      const d=await r.json();
      setMsgs([{role:'system',text:`${mode==='practice'?'Practice':'Real'} mode • ${role||'Role'}${company?` at ${company}`:''}`},{role:'interviewer',text:d.question||'Tell me about yourself.',suggestion:d.suggestedAnswer,keyPoints:d.keyPoints}]);
      setQNum(1);
    }catch{setMsgs([{role:'interviewer',text:'Tell me about yourself and why you\'re interested in this role.'}]);setQNum(1);}
    finally{setLoading(false);}
  };

  const sendAnswer=async(answer?:string,fillerData?:any)=>{
    const a=answer||input;if(!a.trim()||loading)return;setInput('');setTranscript('');
    setMsgs(prev=>[...prev,{role:'you',text:a,fillerData}]);setLoading(true);
    try{
      const r=await fetch('/api/mock-interview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'respond',answer:a,questionNumber:qNum,jobDescription:jd,jobTitle:role,company,mode,history:msgs.filter(m=>m.role!=='system'&&m.role!=='feedback').map(m=>`${m.role}: ${m.text}`).join('\n'),fillerData})});
      const d=await r.json();
      const newM:Msg[]=[];
      if(d.feedback)newM.push({role:'feedback',text:d.feedback,score:d.score});
      if(d.score)setScores(p=>[...p,d.score]);
      if(d.nextQuestion){newM.push({role:'interviewer',text:d.nextQuestion,suggestion:d.suggestedAnswer,keyPoints:d.keyPoints});setQNum(p=>p+1);}
      if(d.summary)newM.push({role:'system',text:d.summary});
      setMsgs(p=>[...p,...newM]);
    }catch{toast.error('Failed');}
    finally{setLoading(false);setTimeout(()=>chatRef.current?.scrollTo(0,chatRef.current.scrollHeight),100);}
  };

  const avg=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):0;

  if(!started)return(
    <div className="max-w-2xl mx-auto">
      <p className="page-eyebrow">Interview</p>
      <h1 className="title-1 mt-1">Mock interview</h1>
      <p className="subhead mt-1">Voice or type. Scores on clarity, structure, and fillers.</p>
      <div className="mt-6 surface p-6 space-y-4">
        <div className="flex gap-2 mb-2">
          {(['practice','real'] as const).map(m=>(
            <button type="button" key={m} onClick={()=>setMode(m)} className={`flex-1 rounded-[var(--radius-md)] py-2.5 text-sm font-semibold transition-all ${mode===m?'bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--accent-dim-strong)]':'bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--separator)] hover:text-[var(--text-primary)]'}`}>
              {m==='practice'?'🎓 Practice Mode':'🎯 Real Mode'}
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--text-tertiary)]">{mode==='practice'?'Hints and suggested angles per question':'No hints — closer to a real loop'}</p>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="input-label !normal-case !tracking-normal">Job title</label><input value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. AI Engineer" className="input-hig"/></div>
          <div><label className="input-label !normal-case !tracking-normal">Company</label><input value={company} onChange={e=>setCompany(e.target.value)} placeholder="e.g. Google" className="input-hig"/></div>
        </div>
        <div><label className="input-label !normal-case !tracking-normal">Job description</label><textarea rows={5} value={jd} onChange={e=>setJd(e.target.value)} placeholder="Paste the full JD..." className="input-hig"/></div>
        <button type="button" onClick={startInterview} disabled={!jd.trim()} className="btn-filled w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40"><Mic className="h-4 w-4"/>Start interview</button>
      </div>
    </div>
  );

  return(
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <div className="flex items-center justify-between mb-3">
        <div><h1 className="text-base font-bold">{role || 'Mock interview'}{company ? ` — ${company}` : ''}</h1><p className="text-xs text-[var(--text-tertiary)]">Q{qNum} • {mode}{avg > 0 ? ` • Avg ${avg}/10` : ''}</p></div>
        <div className="flex gap-2">
          {mode==='practice'&&<button type="button" onClick={()=>setShowHints(!showHints)} className={`btn-gray text-xs px-3 py-1.5 flex items-center gap-1 !min-h-0 ${showHints?'text-[var(--accent)]':'text-[var(--text-tertiary)]'}`}>{showHints?<Eye className="h-3 w-3"/>:<EyeOff className="h-3 w-3"/>}Hints</button>}
          {avg>0&&<div className={`pill border px-2.5 py-1 ${avg>=7?'bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent-dim-strong)]':avg>=5?'bg-[var(--warning)]/12 text-[var(--warning)] border-[var(--warning)]/25':'bg-[var(--destructive)]/12 text-[var(--destructive)] border-[var(--destructive)]/25'}`}><Star className="h-3 w-3 mr-1"/>{avg}/10</div>}
          <button type="button" onClick={()=>{setStarted(false);setMsgs([]);setScores([]);setQNum(0);}} className="btn-gray text-xs px-3 py-1.5 !min-h-0"><RotateCcw className="h-3 w-3 mr-1"/>New</button>
        </div>
      </div>

      <div ref={chatRef} className="flex-1 overflow-y-auto space-y-2.5 mb-3 pr-1">
        {msgs.map((m,i)=>(
          <div key={i}>
            <div className={`flex ${m.role==='you'?'justify-end':'justify-start'}`}>
              <div
                className={[
                  'max-w-[75%] rounded-[var(--radius-lg)] px-4 py-3 text-sm leading-relaxed border',
                  m.role === 'interviewer' && 'bg-[var(--surface-2)] border-[var(--separator)] text-[var(--text-secondary)]',
                  m.role === 'you' && 'bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] border-[var(--accent-dim-strong)] text-[var(--bg-primary)]',
                  m.role === 'feedback' && 'bg-[var(--surface-2)] border-[var(--separator)] text-[var(--text-tertiary)]',
                  m.role === 'system' && 'bg-[var(--surface-1)] border-[var(--separator)] text-[var(--text-tertiary)] text-xs',
                ].filter(Boolean).join(' ')}
              >
                {m.role==='feedback'&&m.score!=null&&<div className={`pill mb-2 ${m.score>=7?'bg-[var(--accent-dim)] text-[var(--accent)]':m.score>=5?'bg-[var(--warning)]/12 text-[var(--warning)]':'bg-[var(--destructive)]/12 text-[var(--destructive)]'}`}><Star className="h-3 w-3 mr-1"/>{m.score}/10</div>}
                {m.text}
              </div>
            </div>
            {/* Filler data */}
            {m.fillerData&&m.fillerData.count>0&&(
              <div className="flex justify-end mt-1"><div className={`pill gap-1 ${m.fillerData.count<=2?'bg-[var(--accent-dim)] text-[var(--accent)]':'bg-[var(--warning)]/12 text-[var(--warning)]'}`}>
                <Volume2 className="h-3 w-3"/>{m.fillerData.count} fillers • {m.fillerData.wpm} wpm • {m.fillerData.rating}
              </div></div>
            )}
            {/* Hints */}
            {m.role==='interviewer'&&mode==='practice'&&showHints&&(m.suggestion||m.keyPoints)&&(
              <div className="mt-2 ml-0 max-w-[75%] bg-[var(--accent-dim)] border border-[var(--accent-dim-strong)] rounded-[var(--radius-md)] p-3">
                <div className="flex items-center gap-1 mb-1.5"><Lightbulb className="h-3 w-3 text-[var(--accent)]"/><span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">Suggested answer</span></div>
                {m.keyPoints&&<div className="flex flex-wrap gap-1 mb-2">{m.keyPoints.map((k,j)=><span key={j} className="pill bg-[var(--surface-2)] text-[var(--accent)] text-[10px] border border-[var(--accent-dim-strong)]">{k}</span>)}</div>}
                {m.suggestion&&<p className="text-xs text-[var(--text-secondary)] leading-relaxed">{m.suggestion}</p>}
              </div>
            )}
          </div>
        ))}
        {loading&&<div className="flex justify-start"><div className="bg-[var(--surface-2)] border border-[var(--separator)] rounded-2xl px-4 py-3"><Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]"/></div></div>}
      </div>

      {/* Recording indicator */}
      {recording&&<div className="mb-2 bg-[#ff453a]/10 border border-[#ff453a]/20 rounded-[16px] p-3 flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"/><span className="text-xs text-[#ff453a] font-medium">Recording...</span><span className="text-xs text-white/25 flex-1">{transcript||'Listening...'}</span><button onClick={stopRecording} className="pill bg-red-500/20 text-[#ff453a] border border-red-500/30 cursor-pointer hover:bg-red-500/30">Stop</button></div>}

      <div className="flex gap-2">
        <button type="button" onClick={recording?stopRecording:startRecording} className={`rounded-[var(--radius-md)] p-2.5 transition-all border ${recording?'bg-red-500/20 text-[#ff453a] border-red-500/30':'bg-[var(--surface-2)] text-[var(--text-tertiary)] border-[var(--separator)] hover:text-[var(--accent)] hover:border-[var(--accent-dim-strong)]'}`}>
          {recording?<MicOff className="h-4 w-4"/>:<Mic className="h-4 w-4"/>}
        </button>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendAnswer()} placeholder="Type or use mic..." className="input-hig flex-1" disabled={loading||recording}/>
        <button type="button" onClick={()=>sendAnswer()} disabled={loading||!input.trim()||recording} className="btn-filled px-4 disabled:opacity-40"><Send className="h-4 w-4"/></button>
      </div>
    </div>
  );
}
