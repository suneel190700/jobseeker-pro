'use client';
import { Search, Sparkles, FileSignature, MessageSquare, Linkedin, Kanban, User, FolderOpen, ArrowUpRight, Target, Mic, BarChart3, Users, CheckCircle, ChevronRight, Lightbulb, Calendar, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { useTracker } from '@/hooks/useTracker';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const actions = [
  { href:'/jobs', label:'Search Jobs', desc:'323K+ sources', icon:Search, color:'#0A84FF' },
  { href:'/resume-optimizer', label:'Resume AI', desc:'ATS optimization', icon:Sparkles, color:'#5E5CE6' },
  { href:'/mock-interview', label:'Mock Interview', desc:'Voice practice', icon:Mic, color:'#FF375F' },
  { href:'/networking', label:'Networking', desc:'Find recruiters', icon:Users, color:'#30D158' },
  { href:'/analytics', label:'Analytics', desc:'Track progress', icon:BarChart3, color:'#FFD60A' },
  { href:'/tracker', label:'Tracker', desc:'Manage pipeline', icon:Kanban, color:'#BF5AF2' },
];

const tips = [
  'Apply within 24 hours of posting — early applicants get 3× more callbacks.',
  'Tuesday–Wednesday, 8–10 AM is the optimal window for submitting applications.',
  'Resumes with quantified metrics get 40% more interview callbacks.',
  'Match exact JD keywords — ATS systems use literal matching, not semantic.',
];

export default function DashboardPage() {
  const { profile, titles } = useResumeProfile();
  const tracker = useTracker();
  const [name, setName] = useState('');
  const [tip] = useState(tips[Math.floor(Math.random() * tips.length)]);
  useEffect(() => { createClient().auth.getUser().then(({ data }) => setName(data?.user?.user_metadata?.full_name?.split(' ')[0] || '')); }, []);

  const s = {
    applied: tracker.cards.filter(c => c.stage !== 'saved').length,
    interviews: tracker.cards.filter(c => c.stage === 'interview').length,
    saved: tracker.cards.filter(c => c.stage === 'saved').length,
    offers: tracker.cards.filter(c => c.stage === 'offer').length,
  };

  return (
    <div>
      {/* Large Title — Apple style */}
      <h1 className="large-title">{name ? `Hey, ${name}` : 'Welcome back'}</h1>
      <p className="subhead mt-1" style={{color:'var(--text-tertiary)'}}>Your career command center</p>

      {/* Stats — 4 cards */}
      <div className="grid grid-cols-4 gap-3 mt-8">
        {[
          { label: 'Applied', value: s.applied, icon: Briefcase, color: '#0A84FF' },
          { label: 'Interviews', value: s.interviews, icon: Calendar, color: '#30D158' },
          { label: 'Saved', value: s.saved, icon: Search, color: '#5E5CE6' },
          { label: 'Offers', value: s.offers, icon: CheckCircle, color: '#FFD60A' },
        ].map(x => (
          <div key={x.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="caption" style={{textTransform:'uppercase',letterSpacing:'0.05em'}}>{x.label}</span>
              <x.icon className="h-4 w-4" style={{color: x.color, opacity: 0.7}} />
            </div>
            <span className="text-[32px] font-bold tracking-tight" style={{color: x.color}}>{x.value}</span>
          </div>
        ))}
      </div>

      {/* Actions + Sidebar */}
      <div className="grid grid-cols-3 gap-5 mt-8">
        <div className="col-span-2 space-y-5">
          {/* Quick Actions */}
          <div>
            <h2 className="headline mb-3">Quick Actions</h2>
            <div className="grid grid-cols-3 gap-3">
              {actions.map(a => (
                <Link key={a.href} href={a.href} className="surface surface-hover p-4 press group block">
                  <div className="h-10 w-10 rounded-[12px] flex items-center justify-center mb-3" style={{background:`${a.color}18`}}>
                    <a.icon className="h-5 w-5" style={{color: a.color}} />
                  </div>
                  <p className="text-[15px] font-semibold text-white">{a.label}</p>
                  <p className="caption mt-0.5">{a.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Getting Started */}
          <div className="surface p-5">
            <h2 className="headline mb-4">Getting Started</h2>
            <div className="space-y-1">
              {[
                { done: !!profile, label: 'Upload your base resume', href: '/profile' },
                { done: titles.length > 0, label: 'Set target job titles', href: '/profile' },
                { done: s.applied > 0, label: 'Apply to your first job', href: '/jobs' },
                { done: s.interviews > 0, label: 'Practice a mock interview', href: '/mock-interview' },
              ].map((step, i) => (
                <Link key={i} href={step.href} className="list-row group">
                  <div className={`h-[22px] w-[22px] rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? '' : ''}`} style={step.done ? {background:'var(--success)'} : {border:'2px solid var(--fill)'}}>
                    {step.done && <CheckCircle className="h-[14px] w-[14px] text-white" />}
                  </div>
                  <span className={`flex-1 text-[15px] ${step.done ? 'line-through' : ''}`} style={{color: step.done ? 'var(--text-tertiary)' : 'var(--text-primary)'}}>{step.label}</span>
                  {!step.done && <ChevronRight className="h-4 w-4" style={{color:'var(--text-tertiary)'}} />}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Pro Tip */}
          <div className="surface p-4" style={{borderColor:'rgba(10,132,255,0.15)',background:'rgba(10,132,255,0.04)'}}>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4" style={{color:'var(--accent)'}} />
              <span className="caption" style={{color:'var(--accent)',textTransform:'uppercase',fontWeight:600,letterSpacing:'0.05em'}}>Pro Tip</span>
            </div>
            <p className="text-[14px]" style={{color:'var(--text-secondary)',lineHeight:'1.5'}}>{tip}</p>
          </div>

          {/* More Tools */}
          <div className="surface overflow-hidden">
            <div className="px-4 py-3" style={{borderBottom:'1px solid var(--separator)'}}>
              <span className="caption" style={{textTransform:'uppercase',fontWeight:600,letterSpacing:'0.05em'}}>More Tools</span>
            </div>
            {[
              { href:'/cover-letter', label:'Cover Letter', icon:FileSignature },
              { href:'/interview-prep', label:'Interview Q&A', icon:MessageSquare },
              { href:'/linkedin', label:'LinkedIn Optimizer', icon:Linkedin },
              { href:'/resume-versions', label:'My Resumes', icon:FolderOpen },
              { href:'/profile', label:'Profile', icon:User },
            ].map(t => (
              <Link key={t.href} href={t.href} className="list-row group">
                <t.icon className="h-4 w-4" style={{color:'var(--text-tertiary)'}} />
                <span className="flex-1 text-[14px]" style={{color:'var(--text-secondary)'}}>{t.label}</span>
                <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{color:'var(--text-tertiary)'}} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
