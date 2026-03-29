import { ReactNode } from 'react';
import { StitchSectionHeading, StitchCard } from '@/components/ui/stitch';

export function StitchPageScaffold({ eyebrow, title, description, sidebar, children }: { eyebrow?: string; title: string; description?: string; sidebar?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen text-white font-serif">
      <StitchSectionHeading eyebrow={eyebrow} title={title} description={description} />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className={sidebar ? 'xl:col-span-8 space-y-8' : 'xl:col-span-12 space-y-8'}>{children}</div>
        {sidebar && <div className="xl:col-span-4 space-y-8">{sidebar}</div>}
      </div>
    </div>
  );
}

export function MetricStrip({ items }: { items: { label: string; value: string | number; hint?: string }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((item) => (
        <StitchCard key={item.label} className="p-6">
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-bold">{item.label}</p>
          <p className="text-4xl text-white font-bold mt-3">{item.value}</p>
          {item.hint && <p className="text-slate-400 text-sm mt-2">{item.hint}</p>}
        </StitchCard>
      ))}
    </div>
  );
}
