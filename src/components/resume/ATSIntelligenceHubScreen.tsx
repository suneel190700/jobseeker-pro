'use client';
import { FileText, Sparkles } from 'lucide-react';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { EmptyConcierge, StitchCard, StitchSectionHeading } from '@/components/ui/stitch';

export default function ATSIntelligenceHubScreen() {
  const { profile, titles } = useResumeProfile();

  if (!profile) {
    return <EmptyConcierge title="ATS audit center is waiting for your resume" description="Upload a base resume to make this page fully account-linked and unlock platform-specific ATS simulations." ctaLabel="Upload Resume" href="/profile" />;
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-serif">
      <StitchSectionHeading
        title="ATS Audit Center"
        description="Your connected resume is linked. The next live step is running job-specific ATS analysis so this page shows true account-based scores instead of template audit blocks."
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        <div className="xl:col-span-8 space-y-6">
          <StitchCard className="p-8">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-bold">Connected Resume</p>
            <div className="mt-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-[#f3ffca]" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{profile.fileName}</p>
                <p className="text-slate-400 text-sm mt-1">Uploaded {new Date(profile.uploadedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </StitchCard>

          <StitchCard className="p-8">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-bold">Target Alignment</p>
            <p className="mt-4 text-slate-300 text-sm leading-relaxed">
              {titles.length ? `Current target titles on this account: ${titles.join(', ')}.` : 'No target titles saved yet on this account.'}
            </p>
          </StitchCard>
        </div>

        <div className="xl:col-span-4 space-y-8">
          <StitchCard className="p-8">
            <div className="flex items-center gap-3 mb-4 text-[#a88bff]">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-lg font-bold text-white">Next Live Action</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Run a real ATS analysis with a job description to replace generic audit content with actual Workday, Lever, iCIMS, and Greenhouse results for this account.
            </p>
          </StitchCard>
        </div>
      </div>
    </div>
  );
}
