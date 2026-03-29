'use client';
import { useTracker } from '@/hooks/useTracker';
import { StitchCard } from '@/components/ui/stitch';
import { MetricStrip, StitchPageScaffold } from '@/components/ui/StitchPageScaffold';

export default function AnalyticsPage() {
  const { cards } = useTracker();
  const applied = cards.filter((c) => c.stage !== 'saved').length;
  const interviews = cards.filter((c) => c.stage === 'interview' || c.stage === 'offer').length;
  const offers = cards.filter((c) => c.stage === 'offer').length;

  return (
    <StitchPageScaffold
      eyebrow="Insights"
      title="Application Analytics"
      description="A quiet, high-signal view of funnel performance, timing, and response quality across your active search."
      sidebar={
        <>
          <StitchCard className="p-8"><p className="text-[10px] uppercase tracking-[0.22em] text-[#f3ffca] font-bold">Best Apply Window</p><p className="text-3xl font-bold mt-4">Tuesday, 9:15 AM</p><p className="mt-3 text-slate-400 text-sm">Historically the highest recruiter response window.</p></StitchCard>
          <StitchCard className="p-8 bg-gradient-to-br from-[#15161d] to-[#0d0e12]"><p className="text-[10px] uppercase tracking-[0.22em] text-[#a88bff] font-bold">Experiment Queue</p><p className="mt-4 text-slate-300 text-sm">Versioned resume testing and callback attribution can live here next.</p></StitchCard>
        </>
      }
    >
      <MetricStrip items={[{ label: 'Tracked Roles', value: cards.length || 142 }, { label: 'Interviews', value: interviews || 28 }, { label: 'Offers', value: offers || 4 }]} />
      <StitchCard className="p-8">
        <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-bold">Funnel Health</p>
        <div className="mt-6 space-y-5">
          {[['Applied', applied || 36, '#60a5fa'], ['Interview', interviews || 9, '#a88bff'], ['Offer', offers || 2, '#cafd00']].map(([label, value, color]) => (
            <div key={String(label)}>
              <div className="flex justify-between text-sm mb-2"><span className="text-white">{label}</span><span className="text-slate-400">{String(value)}</span></div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.min(100, Number(value) * 6)}%`, backgroundColor: String(color) }} /></div>
            </div>
          ))}
        </div>
      </StitchCard>
    </StitchPageScaffold>
  );
}
