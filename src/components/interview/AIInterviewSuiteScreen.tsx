'use client';
import { Brain, Mic, Sparkles, TimerReset } from 'lucide-react';
import { StitchBadge, StitchCard, StitchSectionHeading } from '@/components/ui/stitch';

function SessionCard({ title, subtitle, icon: Icon, accent }: { title: string; subtitle: string; icon: any; accent: string }) {
  return (
    <StitchCard className="p-8 h-full">
      <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 ${accent}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{subtitle}</p>
    </StitchCard>
  );
}

export default function AIInterviewSuiteScreen() {
  return (
    <div className="min-h-screen bg-transparent text-white font-serif">
      <StitchSectionHeading
        eyebrow="AI Interview Suite"
        title="Practice under pressure."
        description="Simulate recruiter screens, technical interviews, and behavioral rounds with a premium AI coach tuned for executive clarity and concise storytelling."
        action={<StitchBadge label="Studio Ready" variant="primary" />}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <StitchCard className="xl:col-span-7 p-8 md:p-10">
          <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#a88bff] font-bold mb-4">Live Studio</p>
            <h3 className="text-3xl md:text-4xl text-white font-bold mb-4">Your next answer starts here.</h3>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8">
              Use voice, timed responses, and targeted feedback to improve precision, confidence, and executive presence before your next interview.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="/mock-interview" className="inline-flex items-center rounded-xl bg-[#cafd00] px-5 py-3 text-sm font-bold text-[#0d0e12]">Start Mock Interview</a>
              <a href="/interview-prep" className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white">Open Question Bank</a>
            </div>
          </div>
        </StitchCard>

        <div className="xl:col-span-5 space-y-8">
          <StitchCard className="p-8">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#f3ffca] font-bold mb-3">Recent Insight</p>
            <p className="text-white text-lg font-bold mb-2">Behavioral answers need sharper business outcomes.</p>
            <p className="text-slate-400 text-sm">Use CAAR structure and close with measurable impact for stronger delivery.</p>
          </StitchCard>
          <StitchCard className="p-8 bg-gradient-to-br from-[#171821] to-[#0d0e12]">
            <div className="flex items-center gap-3 text-[#a88bff] mb-4"><Sparkles className="h-5 w-5" /><h4 className="text-white text-lg font-bold">Concierge Coaching</h4></div>
            <p className="text-slate-400 text-sm">We recommend a 20-minute mock focused on technical storytelling, system design summaries, and recruiter-style screening questions.</p>
          </StitchCard>
        </div>

        <div className="xl:col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <SessionCard title="Recruiter Screen" subtitle="Practice concise introductions, motivation, and compensation framing." icon={Mic} accent="bg-[#1d1729]" />
          <SessionCard title="Behavioral Depth" subtitle="Structure STAR/CAAR stories with executive-level clarity and metrics." icon={Brain} accent="bg-[#0f1f1b]" />
          <SessionCard title="Technical Round" subtitle="Sharpen architecture explanations, trade-offs, and data decisions." icon={TimerReset} accent="bg-[#1f1812]" />
          <SessionCard title="AI Feedback" subtitle="Receive targeted notes on confidence, pacing, and answer quality." icon={Sparkles} accent="bg-[#1c1824]" />
        </div>
      </div>
    </div>
  );
}
