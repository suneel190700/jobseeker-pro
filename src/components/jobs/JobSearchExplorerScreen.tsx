'use client';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useTracker } from '@/hooks/useTracker';
import { CompanyGlyph, EmptyConcierge, StitchBadge, StitchCard, StitchSectionHeading } from '@/components/ui/stitch';

function SavedRoleCard({ title, company, location, salary, stage }: { title: string; company: string; location: string; salary: string; stage: string }) {
  return (
    <StitchCard className="p-8 flex gap-6 items-start hover:bg-white/[0.02] transition-all">
      <CompanyGlyph />
      <div className="flex-grow min-w-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start mb-4">
          <div className="min-w-0">
            <h3 className="text-2xl font-bold mb-1 text-white truncate">{title}</h3>
            <p className="text-slate-400 truncate">{company} • {location || 'Location not set'}</p>
          </div>
          <div className="text-left lg:text-right shrink-0">
            <p className="text-lg font-bold text-white">{salary || 'Salary not saved'}</p>
            <p className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">{stage}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <StitchBadge label="From your tracker" variant="secondary" />
        </div>
      </div>
    </StitchCard>
  );
}

export default function JobSearchExplorerScreen() {
  const { cards, loaded } = useTracker();

  return (
    <div className="min-h-screen bg-transparent text-white font-serif">
      <StitchSectionHeading
        title="Opportunity Explorer"
        description="This screen now prioritizes jobs connected to your account state. Saved and tracked roles appear here first; search expansion can layer on top next."
      />

      <div className="flex gap-4 mb-12 flex-wrap">
        <StitchBadge label="Tracker Linked" variant="lime" />
        <StitchBadge label={`${cards.length} Saved/Tracked`} variant="secondary" />
      </div>

      {!loaded ? (
        <StitchCard className="p-8 text-slate-400">Loading your tracked roles…</StitchCard>
      ) : cards.length === 0 ? (
        <EmptyConcierge title="No saved jobs in your account yet" description="Use the jobs search flow or save roles into the tracker. This page will then render your real opportunity set instead of demo cards." ctaLabel="Open Tracker" href="/tracker" />
      ) : (
        <div className="space-y-6">
          {cards.map((job) => (
            <SavedRoleCard key={job.id} title={job.title} company={job.company} location={job.location} salary={job.salary} stage={job.stage} />
          ))}
          <div className="flex justify-end">
            <Link href="/tracker" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white">
              <Search className="h-4 w-4" />
              Manage in Tracker
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
