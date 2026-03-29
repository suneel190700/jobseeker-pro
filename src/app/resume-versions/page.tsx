'use client';
import { useResumeVersions } from '@/hooks/useResumeVersions';
import { StitchCard, StitchBadge } from '@/components/ui/stitch';
import { StitchPageScaffold } from '@/components/ui/StitchPageScaffold';

export default function ResumeVersionsPage() {
  const { versions, loaded } = useResumeVersions();
  return (
    <StitchPageScaffold eyebrow="Archive" title="Saved Resume Versions" description="Browse your tailored variants, compare fit, and keep a clean record of what was generated.">
      <div className="space-y-4">
        {!loaded ? <StitchCard className="p-8 text-slate-400">Loading saved versions…</StitchCard> : versions.length ? versions.map((v) => (
          <StitchCard key={v.id} className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xl font-bold text-white">{v.label || 'Untitled version'}</p>
                <p className="text-slate-400 text-sm mt-1">{v.jobTitle} {v.company ? `• ${v.company}` : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <StitchBadge label={`${v.score || 0}%`} variant="lime" size="sm" />
                <StitchBadge label={new Date(v.createdAt).toLocaleDateString()} variant="secondary" size="sm" />
              </div>
            </div>
          </StitchCard>
        )) : <StitchCard className="p-8 text-slate-400">No saved resume versions yet.</StitchCard>}
      </div>
    </StitchPageScaffold>
  );
}
