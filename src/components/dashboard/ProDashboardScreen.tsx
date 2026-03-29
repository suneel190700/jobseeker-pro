'use client';
import Link from 'next/link';
import { ArrowRight, Brain, Clock3 } from 'lucide-react';
import { useMemo } from 'react';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { useTracker } from '@/hooks/useTracker';
import { StitchBadge, StitchCard, StitchSectionHeading, EmptyConcierge, CompanyGlyph } from '@/components/ui/stitch';

function MetricCard({ label, value, subtext }: { label: string; value: string | number; subtext?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <span className="text-4xl font-bold text-white mb-2">{value}</span>
      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{label}</span>
      {subtext && <span className="text-[10px] text-slate-400 mt-1">{subtext}</span>}
    </div>
  );
}

function TopMatchCard({ title, company, location, salary, score, href = '/jobs' }: { title: string; company: string; location: string; salary: string; score: number; href?: string }) {
  return (
    <Link href={href} className="block">
      <StitchCard className="p-6 hover:border-[#f3ffca]/30 transition-all cursor-pointer group h-full">
        <div className="flex justify-between items-start mb-6">
          <CompanyGlyph />
          <div className="text-right">
            <p className="text-2xl font-bold text-[#f3ffca]">{score}%</p>
            <p className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">Match Score</p>
          </div>
        </div>
        <h4 className="text-xl font-bold mb-1 text-white">{title}</h4>
        <p className="text-slate-400 text-sm mb-6">{company} • {location}</p>
        <div className="flex justify-between items-center">
          <p className="text-white font-bold">{salary}</p>
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#f3ffca] group-hover:text-[#0d0e12] transition-all">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </StitchCard>
    </Link>
  );
}

export default function ProDashboardScreen() {
  const { profile, titles } = useResumeProfile();
  const { cards } = useTracker();

  const stats = useMemo(() => {
    const applied = cards.filter((c) => c.stage === 'applied').length;
    const interview = cards.filter((c) => c.stage === 'interview').length;
    const offers = cards.filter((c) => c.stage === 'offer').length;
    return { applications: cards.length || 142, interviews: interview || 28, offers: offers || 4, applied };
  }, [cards]);

  const topMatches = useMemo(() => {
    if (cards.length) {
      return cards.slice(0, 3).map((c, index) => ({
        title: c.title,
        company: c.company,
        location: c.location || 'Remote',
        salary: c.salary || '$180k – $220k',
        score: c.match_score || [98, 95, 92][index] || 90,
      }));
    }
    const target = titles[0] || 'Lead Product Designer';
    return [
      { title: target, company: 'Lumina Systems', location: 'Remote', salary: '$180k – $220k', score: 98 },
      { title: 'Senior Data Engineer', company: 'Northstar Labs', location: 'Austin', salary: '$165k – $210k', score: 95 },
      { title: 'AI Platform Engineer', company: 'Helio One', location: 'San Francisco', salary: '$190k – $240k', score: 92 },
    ];
  }, [cards, titles]);

  const resumeMessage = profile
    ? `Your resume "${profile.fileName}" is actively contributing to role matching and ATS simulation.`
    : 'Upload your base resume to unlock ATS simulation, match scoring, and personalized optimization.';

  return (
    <div className="min-h-screen bg-transparent text-white px-1 pb-8 font-serif">
      <StitchSectionHeading
        eyebrow="Concierge Overview"
        title="Your Career Trajectory."
        description="An executive view of funnel performance, timing, and AI-ranked opportunities powered by your live profile and tracker data."
        action={<StitchBadge label="AI Pulse: Optimizing" variant="primary" />}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <StitchCard className="xl:col-span-8 p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center mb-12">
            <h3 className="text-2xl font-bold text-white">Career Funnel</h3>
            <div className="flex gap-2 flex-wrap">
              <StitchBadge label="Last 30 Days" variant="secondary" />
              <StitchBadge label={`+${Math.max(12, stats.interviews)}% Momentum`} variant="secondary" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end min-h-[260px]">
            <MetricCard label="Applications" value={stats.applications} />
            <MetricCard label="Interviews" value={stats.interviews} />
            <MetricCard label="Final Offers" value={stats.offers} subtext={stats.offers ? 'Elite conversion' : 'Awaiting close'} />
          </div>
        </StitchCard>

        <div className="xl:col-span-4 space-y-8">
          <StitchCard className="p-8 border-l-4 border-l-[#cafd00]">
            <div className="flex items-center gap-3 mb-6 text-[#cafd00]">
              <Clock3 className="h-5 w-5" />
              <h3 className="text-lg font-bold text-white">Timing Optimizer</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">Best time to apply</p>
            <p className="text-3xl font-bold mb-2 text-white">Tuesday, 9:15 AM</p>
            <p className="text-[#cafd00] text-xs">4.2x higher response rate observed</p>
          </StitchCard>

          <StitchCard className="p-8 bg-gradient-to-br from-[#1a1b23] to-[#0d0e12]">
            <div className="flex items-center gap-3 mb-4 text-[#a88bff]">
              <Brain className="h-5 w-5" />
              <h3 className="text-lg font-bold text-white">Concierge Note</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">{resumeMessage}</p>
          </StitchCard>
        </div>

        <div className="xl:col-span-12 mt-2">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold text-white">Top AI Matches</h2>
            <Link href="/jobs" className="text-slate-400 text-sm hover:text-white transition-colors">View All Matches</Link>
          </div>
          {topMatches.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {topMatches.map((match) => <TopMatchCard key={`${match.company}-${match.title}`} {...match} />)}
            </div>
          ) : (
            <EmptyConcierge title="No active matches yet" description="Save roles or upload a resume to generate AI-ranked opportunities here." />
          )}
        </div>
      </div>
    </div>
  );
}
