'use client';
import Link from 'next/link';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { useTracker } from '@/hooks/useTracker';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const actions = [
  { href:'/resume-optimizer', icon:'analytics', label:'Run Resume Audit', desc:'AI score improvement', bg:'bg-[#3c59fd]/20', color:'text-[#bbc3ff]' },
  { href:'/mock-interview', icon:'videocam', label:'Mock Interview', desc:'Practice with AI', bg:'bg-[#5203d5]/20', color:'text-[#cdbdff]' },
  { href:'/tracker', icon:'add_task', label:'Track Application', desc:'Manual data entry', bg:'bg-[#007886]/20', color:'text-[#00daf3]' },
  { href:'/networking', icon:'hub', label:'Network Map', desc:'2nd degree connections', bg:'bg-white/5', color:'text-[#e1e2eb]' },
  { href:'/cover-letter', icon:'auto_stories', label:'Cover Letter Gen', desc:'Custom AI templates', bg:'bg-[#bbc3ff]/10', color:'text-[#bbc3ff]' },
  { href:'/jobs', icon:'monetization_on', label:'Salary Insights', desc:'Market rate benchmarking', bg:'bg-[#93000a]/20', color:'text-[#ffb4ab]' },
];

const tips = [
  { title: 'Leverage the "Hidden Job Market" via LinkedIn.', body: '40% of Pro users who messaged hiring managers directly received an interview within 72 hours. Use our Networking tool to find your direct line.' },
  { title: 'Apply within the first 24 hours.', body: 'Early applicants get 3x more callbacks. Set up job alerts and apply the same day jobs are posted.' },
  { title: 'Quantify every bullet point.', body: 'Resumes with metrics get 40% more interviews. Use our Resume AI to add numbers to every achievement.' },
];

export default function DashboardPage() {
  const { profile, titles } = useResumeProfile();
  const tracker = useTracker();
  const [name, setName] = useState('');
  const [tip] = useState(tips[Math.floor(Math.random() * tips.length)]);
  useEffect(() => { createClient().auth.getUser().then(({ data }) => setName(data?.user?.user_metadata?.full_name || data?.user?.email?.split('@')[0] || '')); }, []);

  const s = { applied: tracker.cards.filter(c => c.stage !== 'saved').length, interviews: tracker.cards.filter(c => c.stage === 'interview').length, saved: tracker.cards.filter(c => c.stage === 'saved').length, offers: tracker.cards.filter(c => c.stage === 'offer').length };

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Welcome */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-2">Welcome, {name || 'there'}</h2>
            <p className="text-[#c4c5d9] max-w-lg">Your AI career assistant is ready. {tracker.cards.length > 0 ? `Tracking ${tracker.cards.length} applications.` : 'Start by searching for jobs or uploading your resume.'}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/jobs" className="kinetic-btn px-6 py-2.5 text-sm">New Search</Link>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[{l:'Applied',v:s.applied,icon:'send',c:'text-[#bbc3ff]'},{l:'Interviews',v:s.interviews,icon:'event_available',c:'text-[#cdbdff]'},{l:'Saved',v:s.saved,icon:'bookmark',c:'text-[#00daf3]'},{l:'Offers',v:s.offers,icon:'workspace_premium',c:'text-[#bbc3ff]'}].map(m => (
          <div key={m.l} className="glass-card rounded-xl p-6 flex flex-col justify-between h-40 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-[#c4c5d9] text-xs font-bold uppercase tracking-widest">{m.l}</span>
              <span className={`material-symbols-outlined ${m.c}`}>{m.icon}</span>
            </div>
            <span className="text-4xl font-black tracking-tighter">{m.v}</span>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-12 gap-6">
        {/* Quick Actions + Pro Tip */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {actions.map(a => (
              <Link key={a.href} href={a.href} className="glass-card transition-all p-6 rounded-xl flex flex-col gap-4 text-left group">
                <div className={`w-12 h-12 rounded-lg ${a.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <span className={`material-symbols-outlined ${a.color}`} style={{fontVariationSettings:"'FILL' 1"}}>{a.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-[#e1e2eb]">{a.label}</p>
                  <p className="text-xs text-[#c4c5d9]">{a.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Pro Tip */}
          <div className="relative overflow-hidden rounded-2xl p-8 flex flex-col md:flex-row items-start gap-8" style={{ background: 'linear-gradient(135deg, rgba(60,89,253,0.15), rgba(82,3,213,0.1))', backdropFilter: 'blur(24px)', border: '1px solid rgba(187,195,255,0.2)' }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#bbc3ff]/20 blur-[100px] -mr-32 -mt-32" />
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-2 text-[#cdbdff] mb-4">
                <span className="material-symbols-outlined">lightbulb</span>
                <span className="text-xs font-bold uppercase tracking-widest">Pro Tip</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight leading-tight mb-4">{tip.title}</h3>
              <p className="text-[#c4c5d9] text-sm leading-relaxed max-w-lg">{tip.body}</p>
            </div>
          </div>
        </div>

        {/* Right: Checklist + Recent */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Onboarding */}
          <div className="glass-card rounded-2xl p-6">
            <h4 className="text-xl font-bold mb-6">Onboarding Progress</h4>
            <div className="mb-6">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-[#c4c5d9]">Profile Completion</span>
                <span className="text-[#bbc3ff] font-bold">{[!!profile, titles.length > 0, s.applied > 0, s.interviews > 0].filter(Boolean).length * 25}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#bbc3ff]" style={{ width: `${[!!profile, titles.length > 0, s.applied > 0, s.interviews > 0].filter(Boolean).length * 25}%`, boxShadow: '0 0 12px rgba(187,195,255,0.6)' }} />
              </div>
            </div>
            <div className="space-y-4">
              {[{done:!!profile,l:'Upload Master Resume'},{done:titles.length>0,l:'Set Job Preferences'},{done:s.applied>0,l:'First Resume Audit'},{done:s.interviews>0,l:'Complete Mock Interview'}].map((x,i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`material-symbols-outlined ${x.done ? 'text-[#00daf3]' : 'text-[#8e90a2]'}`} style={x.done ? {fontVariationSettings:"'FILL' 1"} : {}}>{x.done ? 'check_circle' : 'radio_button_unchecked'}</span>
                  <span className={`text-sm ${x.done ? 'text-[#e1e2eb]/60 line-through' : 'text-[#e1e2eb]'}`}>{x.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Tools */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-bold">Quick Links</h4>
            </div>
            <div className="space-y-2">
              {[{h:'/resume-optimizer',icon:'psychology',l:'Resume AI',c:'text-[#cdbdff]',bg:'bg-[#5203d5]/20'},{h:'/jobs',icon:'work',l:'Job Search',c:'text-[#00daf3]',bg:'bg-[#007886]/20'},{h:'/resume-versions',icon:'folder_open',l:'My Resumes',c:'text-[#bbc3ff]',bg:'bg-[#3c59fd]/20'}].map(t => (
                <Link key={t.h} href={t.h} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${t.bg} flex items-center justify-center`}>
                      <span className={`material-symbols-outlined ${t.c} text-sm`}>{t.icon}</span>
                    </div>
                    <p className="text-sm font-bold">{t.l}</p>
                  </div>
                  <span className="material-symbols-outlined text-[#8e90a2] text-sm">chevron_right</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
