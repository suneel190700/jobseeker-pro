import Link from 'next/link';
import { ArrowRight, Sparkles, Target, Brain, BriefcaseBusiness } from 'lucide-react';
import { StitchBadge, StitchCard } from '@/components/ui/stitch';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#06070a] text-white font-serif">
      <section className="max-w-[1280px] mx-auto px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-10 items-start">
          <div>
            <StitchBadge label="Exclusive AI Concierge" variant="primary" />
            <h1 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight leading-[0.95]">
              Job search intelligence, <span className="italic font-normal text-slate-400">reframed</span> for elite execution.
            </h1>
            <p className="mt-6 max-w-2xl text-slate-400 text-lg leading-relaxed font-sans">
              JobSeeker Pro combines ATS simulation, curated role matching, interview coaching, and application tracking into a single obsidian workspace built for serious operators.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-[#cafd00] px-6 py-3 text-sm font-bold text-[#0d0e12] font-sans">
                Enter Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/resume-optimizer" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white font-sans">
                Run ATS Audit
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                ['ATS Intelligence', 'Workday, Greenhouse, iCIMS, and Lever scoring with narrative guidance.', Target],
                ['Curated Matches', 'AI-ranked opportunity feed using your target titles and current resume.', BriefcaseBusiness],
                ['Interview Studio', 'Mock interviews, recruiter-style prompts, and coaching loops.', Brain],
              ].map(([title, text, Icon]: any) => (
                <StitchCard key={title} className="p-6">
                  <Icon className="h-5 w-5 text-[#a88bff]" />
                  <h3 className="mt-4 text-xl font-bold">{title}</h3>
                  <p className="mt-2 text-sm text-slate-400 font-sans">{text}</p>
                </StitchCard>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <StitchCard className="p-8 bg-gradient-to-br from-[#15161d] via-[#0d0e12] to-[#101118]">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#f3ffca] font-bold">Command Surface</p>
              <div className="mt-6 space-y-5">
                <div className="rounded-2xl bg-white/5 p-5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-bold">Top Match Momentum</p>
                    <Sparkles className="h-4 w-4 text-[#a88bff]" />
                  </div>
                  <p className="mt-3 text-4xl font-bold text-[#f3ffca]">98%</p>
                  <p className="mt-2 text-sm text-slate-400 font-sans">Lead Product Designer • Lumina Systems</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/5 p-5 border border-white/10">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-bold">Interviews</p>
                    <p className="mt-3 text-3xl font-bold">28</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-5 border border-white/10">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-bold">Offers</p>
                    <p className="mt-3 text-3xl font-bold">4</p>
                  </div>
                </div>
              </div>
            </StitchCard>
            <StitchCard className="p-8">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#a88bff] font-bold">Why this product exists</p>
              <p className="mt-4 text-slate-300 leading-relaxed font-sans">
                Most job tools are fragmented and reactive. JobSeeker Pro is built as a private digital estate: one place to optimize your narrative, evaluate fit, and move with precision.
              </p>
            </StitchCard>
          </div>
        </div>
      </section>
    </div>
  );
}
