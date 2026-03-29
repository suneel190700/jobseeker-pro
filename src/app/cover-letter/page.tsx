import { StitchCard } from '@/components/ui/stitch';
import { StitchPageScaffold } from '@/components/ui/StitchPageScaffold';

export default function CoverLetterPage() {
  return (
    <StitchPageScaffold eyebrow="Narrative" title="Cover Letter Studio" description="Generate focused, high-signal cover letters aligned to role, company, and tone.">
      <StitchCard className="p-8">
        <p className="text-slate-300 font-sans leading-relaxed">This workspace should be the Stitch-styled home for your generated letters, job context, and revision controls.</p>
      </StitchCard>
    </StitchPageScaffold>
  );
}
