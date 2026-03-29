'use client';
import { useTracker } from '@/hooks/useTracker';
import { StitchBadge, StitchCard } from '@/components/ui/stitch';
import { StitchPageScaffold } from '@/components/ui/StitchPageScaffold';

export default function TrackerPage() {
  const { cards } = useTracker();
  const stages = ['saved', 'applied', 'screening', 'interview', 'offer'];
  return (
    <StitchPageScaffold eyebrow="Pipeline" title="Application Tracker" description="Move opportunities through a clean, executive pipeline without losing context.">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {stages.map((stage) => {
          const list = cards.filter((c) => c.stage === stage).slice(0, 4);
          return (
            <StitchCard key={stage} className="p-5 min-h-[320px]">
              <div className="flex items-center justify-between mb-4"><p className="text-sm font-bold capitalize text-white">{stage}</p><StitchBadge label={String(list.length)} variant="secondary" /></div>
              <div className="space-y-3">
                {list.length ? list.map((c) => (
                  <div key={c.id} className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <p className="text-sm font-bold text-white">{c.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{c.company}</p>
                    <p className="text-[11px] text-slate-500 mt-3">{c.location || 'Remote'}</p>
                  </div>
                )) : <p className="text-sm text-slate-500">No roles in this stage.</p>}
              </div>
            </StitchCard>
          );
        })}
      </div>
    </StitchPageScaffold>
  );
}
