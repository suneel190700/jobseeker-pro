import { ReactNode } from 'react';
import { ArrowUpRight, BriefcaseBusiness, Sparkles } from 'lucide-react';

export function StitchCard({ children, className = '', variant = 'glass' }: { children: ReactNode; className?: string; variant?: 'glass' | 'solid' }) {
  const variantClass = variant === 'solid' ? 'bg-[#0d0e12]' : 'bg-[#111218]/60 backdrop-blur-xl';
  return <div className={`rounded-[28px] overflow-hidden border border-white/10 ${variantClass} ${className}`}>{children}</div>;
}

export function StitchBadge({ label, variant = 'primary', size = 'xs' }: { label: string; variant?: 'primary' | 'secondary' | 'outline' | 'lime' | 'indigo'; size?: 'xs' | 'sm' }) {
  const styles = {
    primary: 'bg-[#f3ffca]/10 text-[#f3ffca] border border-[#f3ffca]/20',
    secondary: 'bg-white/5 text-slate-400 border border-white/10',
    outline: 'border border-white/20 text-white',
    lime: 'bg-[#cafd00] text-[#0d0e12] font-bold',
    indigo: 'bg-[#a88bff]/10 text-[#a88bff] border border-[#a88bff]/20',
  } as const;
  const sizes = { xs: 'px-3 py-1 text-[10px]', sm: 'px-3 py-1.5 text-[11px]' } as const;
  return <span className={`inline-flex items-center rounded-full uppercase tracking-[0.22em] font-bold ${sizes[size]} ${styles[variant]}`}>{label}</span>;
}

export function StitchSectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
      <div>
        {eyebrow && <p className="text-[10px] uppercase tracking-[0.3em] text-[#f3ffca] mb-2 font-sans font-bold">{eyebrow}</p>}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">{title}</h1>
        {description && <p className="text-slate-400 max-w-3xl mt-3 text-sm md:text-base">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyConcierge({ title, description, ctaLabel = 'Get Started', href = '/jobs' }: { title: string; description: string; ctaLabel?: string; href?: string }) {
  return (
    <StitchCard className="p-8 md:p-10 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
        <Sparkles className="h-7 w-7 text-[#a88bff]" />
      </div>
      <h3 className="text-2xl font-bold text-white">{title}</h3>
      <p className="text-slate-400 mt-3 max-w-xl mx-auto">{description}</p>
      <a href={href} className="inline-flex mt-6 items-center gap-2 rounded-xl bg-[#cafd00] px-5 py-3 text-sm font-bold text-[#0d0e12]">
        {ctaLabel}
        <ArrowUpRight className="h-4 w-4" />
      </a>
    </StitchCard>
  );
}

export function CompanyGlyph() {
  return (
    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
      <BriefcaseBusiness className="h-5 w-5 text-slate-400" />
    </div>
  );
}
