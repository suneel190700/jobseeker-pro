'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTracker } from '@/hooks/useTracker';
import { CompanyGlyph, EmptyConcierge, StitchBadge, StitchCard, StitchSectionHeading } from '@/components/ui/stitch';

function JobListingCard({ title, company, location, salary, notes }: { title: string; company: string; location: string; salary: string; notes?: string }) {
  return (
    <StitchCard className="p-8 flex gap-6 items-start hover:bg-white/[0.02] transition-all">
      <CompanyGlyph />
      <div className="flex-grow min-w-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start mb-4">
          <div className="min-w-0">
            <h3 className="text-2xl font-bold mb-1 text-white truncate">{title}</h3>
            <p className="text-slate-400 truncate">{company} • {location}</p>
          </div>
          <div className="text-left lg:text-right shrink-0">
            <p className="text-2xl font-bold text-white">{salary}</p>
            <p className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">Annual Base</p>
          </div>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
          {notes || 'A curated opportunity aligned to your target roles, current skills, and market timing signal. Open the detail view to review fit, salary, and match signals.'}
        </p>
        <div className="flex gap-2 flex-wrap">
          <StitchBadge label="AI Systems" variant="secondary" />
          <StitchBadge label="Product Strategy" variant="secondary" />
        </div>
      </div>
      <button className="w-12 h-12 rounded-xl bg-[#a88bff] text-white flex items-center justify-center self-center hover:scale-110 transition-transform shrink-0">
        <ArrowRight className="h-5 w-5" />
      </button>
    </StitchCard>
  );
}

export default function JobSearchExplorerScreen() {
  const { cards } = useTracker();
  const jobs = useMemo(() => {
    if (cards.length) return cards.slice(0, 5).map((c) => ({ title: c.title, company: c.company, location: c.location || 'Remote', salary: c.salary || '$180k – $240k', notes: c.notes }));
    return [
      { title: 'Principal Product Designer', company: 'Lumina Technologies', location: 'San Francisco, CA (Remote)', salary: '$210k – $280k' },
      { title: 'Senior Data Engineer', company: 'Northstar Labs', location: 'New York, NY', salary: '$170k – $220k' },
      { title: 'AI Platform Engineer', company: 'Helio One', location: 'Austin, TX', salary: '$185k – $240k' },
    ];
  }, [cards]);

  const insights = [
    { label: 'AI Design Strategy', change: '+12.4%', up: true },
    { label: 'Platform Engineering', change: '+8.9%', up: true },
    { label: 'Legacy ETL Migration', change: '-4.2%', up: false },
  ];

  return (
    <div className="min-h-screen bg-transparent text-white font-serif">
      <StitchSectionHeading
        title="Curated Opportunities"
        description="Precision matching for your elite career trajectory. Powered by Obsidian AI and your live tracker history."
      />

      <div className="flex gap-4 mb-12 flex-wrap">
        <StitchBadge label="All Roles" variant="lime" />
        <StitchBadge label="Remote" variant="secondary" />
        <StitchBadge label="Full-time" variant="secondary" />
        <StitchBadge label="$180k+ Salary" variant="secondary" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        <div className="xl:col-span-8 space-y-6">
          {jobs.length ? jobs.map((job) => <JobListingCard key={`${job.company}-${job.title}`} {...job} />) : <EmptyConcierge title="No curated roles yet" description="Search and save jobs to populate your opportunity explorer." />}
        </div>

        <aside className="xl:col-span-4 space-y-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#a88bff] mb-6 font-bold">Market Insights</p>
            <h4 className="text-3xl font-bold mb-8 text-white">Role Volatility</h4>
            <div className="space-y-8">
              {insights.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-2 font-sans">
                    <span className="text-white">{item.label}</span>
                    <span className={item.up ? 'text-[#cafd00]' : 'text-red-400'}>{item.change}</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${item.up ? 'bg-[#cafd00]' : 'bg-red-400'}`} style={{ width: '70%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <StitchCard className="p-8 bg-[#1a1b23]/40">
            <div className="flex items-center gap-2 mb-4 text-[#a88bff]">
              <Sparkles className="h-4 w-4" />
              <p className="text-[10px] uppercase tracking-widest font-bold">Concierge Prediction</p>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Demand for AI, platform, and data-intensive roles is expected to remain elevated through the next hiring cycle.
            </p>
          </StitchCard>
        </aside>
      </div>
    </div>
  );
}
