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
      {subtext && <span className="text-[10px] text-slate-400 mt-1 text-center">{subtext}</span>}
    </div>
  );
}

function TopMatchCard({ title, company, location, salary, score, href = '/jobs' }: { title: string; company: string; location: string; salary: string; score?: number; href?: string }) {
  return (
    <Link href={href} className="block">
      <StitchCard className="p-6 hover:border-[#f3ffca]/30 transition-all cursor-pointer group h-full">
        <div className="flex justify-between items-start mb-6">
          <CompanyGlyph />
          {typeof score === 'number' ? (
            <div className="text-right">
              <p className="text-2xl font-bold text-[#f3ffca]">{score}%</p>
              <p className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">Match Score</p>
            </div>
          ) : <StitchBadge label="Tracked" variant="secondary" />}
        </div>
        <h4 className="text-xl font-bold mb-1 text-white">{title}</h4>
        <p className="text-slate-400 text-sm mb-6">{company} • {location}</p>
        <div className="flex justify-between items-center">
          <p className="text-white font-bold">{salary || 'Salary not saved'}</p>
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#f3ffca] group-hover:text-[#0d0e12] transition-all">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </StitchCard>
    </Link>
  );
}

export default function ProDashboardScreen() {
  const { profile, titles, details } = useResumeProfile();
  const { cards, loaded } = useTracker();

  const stats = useMemo(() => {
    const interviews = cards.filter((c) => c.stage === 'interview').length;
    const offers = cards.filter((c) => c.stage === 'offer').length;
    return { applications: cards.length, interviews, offers };
  }, [cards]);

  const trackedRoles = cards.slice(0, 3).map((c) => ({
    title: c.title,
    company: c.company,
    location: c.location || 'Location not set',
    salary: c.salary || '',
    score: c.match_score,
  }));

  const resumeMessage = profile
    ? `Base resume connected: ${profile.fileName}${details.fullName ? ` • ${details.fullName}` : ''}`
    : 'No base resume connected to this account yet.';

  return (
    <div className="min-h-screen bg-transparent text-white px-1 pb-8 font-serif">
      <StitchSectionHeading
        eyebrow="Concierge Overview"
        title="Your Career Trajectory."
        description="This dashboard is now driven by your saved profile, uploaded resume, and tracked applications."
        action={<StitchBadge label={profile ? 'Resume Linked' : 'Resume Missing'} variant={profile ? 'primary' : 'secondary'} />}
      />

      {!loaded ? (
        <StitchCard className="p-8 text-slate-400">Loading your dashboard…</StitchCard>
      ) : cards.length === 0 && !profile ? (
        <EmptyConcierge title="Connect your account data to activate the dashboard" description="Upload a base resume and save some roles to populate funnel analytics, tracked opportunities, and AI notes with your real account data." ctaLabel="Open Profile" href="/profile" />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <StitchCard className="xl:col-span-8 p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center mb-12">
              <h3 className="text-2xl font-bold text-white">Career Funnel</h3>
              <div className="flex gap-2 flex-wrap">
                <StitchBadge label="Live Tracker" variant="secondary" />
                {titles[0] && <StitchBadge label={titles[0]} variant="secondary" />}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end min-h-[260px]">
              <MetricCard label="Tracked Roles" value={stats.applications} />
              <MetricCard label="Interviews" value={stats.interviews} />
              <MetricCard label="Offers" value={stats.offers} subtext={stats.offers ? 'Active close signal' : 'No offers yet'} />
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
              <p className="text-[#cafd00] text-xs">Heuristic guidance until account-specific timing history grows.</p>
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
              <h2 className="text-3xl font-bold text-white">Tracked Opportunities</h2>
              <Link href="/tracker" className="text-slate-400 text-sm hover:text-white transition-colors">Open full tracker</Link>
            </div>
            {trackedRoles.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {trackedRoles.map((match) => <TopMatchCard key={`${match.company}-${match.title}`} {...match} href="/tracker" />)}
              </div>
            ) : (
              <EmptyConcierge title="No tracked roles yet" description="Save roles from the jobs page to replace placeholders with your real tracked opportunities." ctaLabel="Explore Jobs" href="/jobs" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
