'use client';
import { Search, Sparkles, FileSignature, MessageSquare, Linkedin, Kanban, User, FolderOpen, ArrowUpRight, TrendingUp, Target, Zap, Mic, BarChart3, Users, CheckCircle, ChevronRight, Lightbulb, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { useTracker } from '@/hooks/useTracker';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const actions = [
  { href:'/jobs', label:'Search Jobs', icon:Search, c:'from-blue-500 to-cyan-500' },
  { href:'/resume-optimizer', label:'Resume AI', icon:Sparkles, c:'from-emerald-500 to-teal-500' },
  { href:'/mock-interview', label:'Mock Interview', icon:Mic, c:'from-pink-500 to-rose-500' },
  { href:'/networking', label:'Networking', icon:Users, c:'from-emerald-500 to-teal-500' },
  { href:'/analytics', label:'Analytics', icon:BarChart3, c:'from-amber-500 to-orange-500' },
  { href:'/tracker', label:'Tracker', icon:Kanban, c:'from-violet-500 to-purple-500' },
];

const tips = [
  'Apply within 24 hours of posting — early applicants get 3x more callbacks.',
  'Tuesday–Wednesday 8–10 AM is the optimal application window.',
  'Quantify every bullet — resumes with metrics get 40% more interviews.',
  'Use exact keywords from the JD — ATS systems match literally, not semantically.',
];

export default function DashboardPage() {
  const { profile, titles } = useResumeProfile();
  const tracker = useTracker();
  const [name, setName] = useState('');
  const [tip] = useState(tips[Math.floor(Math.random() * tips.length)]);
  useEffect(() => { createClient().auth.getUser().then(({ data }) => setName(data?.user?.user_metadata?.full_name?.split(' ')[0] || '')); }, []);

  const s = { applied: tracker.cards.filter(c => c.stage !== 'saved').length, interviews: tracker.cards.filter(c => c.stage === 'interview').length, saved: tracker.cards.filter(c => c.stage === 'saved').length, offers: tracker.cards.filter(c => c.stage === 'offer').length };

  return (<div>
    <h1 className="text-2xl font-bold text-white tracking-tight">{name ? `Hey, ${name}` : 'Welcome back'}</h1>
    <p className="mt-0.5 text-sm text-slate-500">Your AI career command center</p>

    {/* Stats */}
    <div className="mt-6 grid grid-cols-4 gap-3">
      {[{l:'Applied',v:s.applied,c:'text-emerald-400',b:'bg-emerald-500/10',i:Target},{l:'Interviews',v:s.interviews,c:'text-emerald-400',b:'bg-emerald-500/10',i:Calendar},{l:'Saved',v:s.saved,c:'text-blue-400',b:'bg-blue-500/10',i:Search},{l:'Offers',v:s.offers,c:'text-amber-400',b:'bg-amber-500/10',i:CheckCircle}].map(x=>(
        <div key={x.l} className="glass p-4"><div className="flex items-center justify-between"><span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">{x.l}</span><div className={`${x.b} rounded-md p-1`}><x.i className={`h-3 w-3 ${x.c}`}/></div></div><p className={`text-2xl font-bold mt-1 ${x.c}`}>{x.v}</p></div>
      ))}
    </div>

    {/* Actions + Sidebar */}
    <div className="mt-6 grid grid-cols-3 gap-4">
      <div className="col-span-2 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {actions.map(a=>(
            <Link key={a.href} href={a.href} className="glass glass-h p-4 group">
              <div className={`inline-flex rounded-lg bg-gradient-to-br ${a.c} p-2`}><a.icon className="h-4 w-4 text-white"/></div>
              <p className="mt-2 text-sm font-semibold text-slate-300 group-hover:text-white transition">{a.label}</p>
            </Link>
          ))}
        </div>

        {/* Checklist */}
        <div className="glass p-5">
          <h2 className="text-sm font-bold text-slate-300 mb-3">Getting Started</h2>
          <div className="space-y-2">
            {[{done:!!profile,l:'Upload base resume',h:'/profile'},{done:titles.length>0,l:'Set target job titles',h:'/profile'},{done:s.applied>0,l:'Apply to a job',h:'/jobs'},{done:s.interviews>0,l:'Practice mock interview',h:'/mock-interview'}].map((x,i)=>(
              <Link key={i} href={x.h} className={`flex items-center gap-3 rounded-lg p-2.5 transition ${x.done?'bg-emerald-500/5':'bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.06)]'}`}>
                <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${x.done?'bg-emerald-500':'border border-white/[0.08]'}`}>{x.done&&<CheckCircle className="h-3.5 w-3.5 text-white"/>}</div>
                <span className={`text-sm ${x.done?'text-emerald-400 line-through':'text-slate-400'}`}>{x.l}</span>
                {!x.done&&<ChevronRight className="h-3.5 w-3.5 text-slate-700 ml-auto"/>}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Right col */}
      <div className="space-y-4">
        <div className="glass p-4 border-emerald-500/20 bg-emerald-500/[0.03]">
          <div className="flex items-center gap-1.5 mb-2"><Lightbulb className="h-3.5 w-3.5 text-emerald-400"/><span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Pro Tip</span></div>
          <p className="text-xs text-slate-400 leading-relaxed">{tip}</p>
        </div>
        <div className="glass p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-2">More Tools</p>
          {[{h:'/cover-letter',l:'Cover Letter',i:FileSignature},{h:'/interview-prep',l:'Interview Q&A',i:MessageSquare},{h:'/linkedin',l:'LinkedIn Optimizer',i:Linkedin},{h:'/resume-versions',l:'My Resumes',i:FolderOpen}].map(t=>(
            <Link key={t.h} href={t.h} className="flex items-center gap-2 py-1.5 text-xs text-slate-500 hover:text-slate-300 transition"><t.i className="h-3 w-3"/>{t.l}</Link>
          ))}
        </div>
      </div>
    </div>
  </div>);
}
