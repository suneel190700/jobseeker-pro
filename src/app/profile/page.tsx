'use client';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { StitchCard, StitchBadge } from '@/components/ui/stitch';
import { StitchPageScaffold } from '@/components/ui/StitchPageScaffold';

export default function ProfilePage() {
  const { details, titles, profile } = useResumeProfile();
  return (
    <StitchPageScaffold eyebrow="Identity" title="Profile Control Center" description="Keep your personal details, target titles, and resume source aligned across the entire concierge system.">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <StitchCard className="p-8">
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-bold">Personal Details</p>
          <div className="mt-6 space-y-4 text-sm font-sans">
            {[['Full name', details.fullName], ['Email', details.email], ['Phone', details.phone], ['Location', details.location], ['LinkedIn', details.linkedin], ['GitHub', details.github]].map(([k,v]) => (
              <div key={String(k)}><p className="text-slate-500">{k}</p><p className="text-white mt-1">{String(v || '—')}</p></div>
            ))}
          </div>
        </StitchCard>
        <StitchCard className="p-8">
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-bold">Target Titles</p>
          <div className="mt-6 flex flex-wrap gap-2">{(titles.length ? titles : ['Add titles in profile tools']).map((t) => <StitchBadge key={t} label={t} variant={titles.length ? 'indigo' : 'secondary'} size="sm" />)}</div>
          <div className="mt-8"><p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-bold">Base Resume</p><p className="text-white mt-3">{profile?.fileName || 'No resume uploaded yet'}</p></div>
        </StitchCard>
      </div>
    </StitchPageScaffold>
  );
}
