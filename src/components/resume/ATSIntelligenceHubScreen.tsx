'use client';
import { FileText, Sparkles } from 'lucide-react';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { EmptyConcierge, StitchCard, StitchSectionHeading } from '@/components/ui/stitch';

function ScoreCard({ name, tier, score, status, color }: { name: string; tier: string; score: number; status: string; color: string }) {
  return (
    <StitchCard className="p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-2xl font-bold text-white">{name}</p>
          <p className="text-slate-500 text-sm mt-1">{tier}</p>
        </div>
        <div className={`text-5xl font-bold ${color}`}>{score}</div>
      </div>
      <p className="text-slate-300 text-sm">{status}</p>
    </StitchCard>
  );
}

export default function ATSIntelligenceHubScreen() {
  const { profile, titles } = useResumeProfile();
  const scores = [
    { name: 'Workday', tier: 'Enterprise Standard', score: 80, status: 'Optimization Complete', color: 'text-[#cafd00]' },
    { name: 'Lever', tier: 'Fast-Growth Hybrid', score: 40, status: 'Critical Format Fix Needed', color: 'text-red-400' },
    { name: 'iCIMS', tier: 'Legacy High-Volume', score: 92, status: 'Elite Alignment', color: 'text-[#a88bff]' },
    { name: 'Greenhouse', tier: 'Modern Narrative', score: 65, status: 'Moderate Optimization Required', color: 'text-orange-400' },
  ];

  if (!profile) {
    return <EmptyConcierge title="ATS audit center is waiting for your resume" description="Upload a base resume to run platform-specific ATS simulations and narrative optimization." ctaLabel="Upload Resume" href="/profile" />;
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-serif">
      <StitchSectionHeading
        title="ATS Audit Center"
        description="Our proprietary Obsidian Lens simulates aggressive applicant tracking systems and surfaces the narrative, keyword, and formatting adjustments you need."
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {scores.map((ats) => <ScoreCard key={ats.name} {...ats} />)}
        </div>

        <div className="xl:col-span-4 space-y-8">
          <StitchCard className="p-8">
            <div className="flex items-center gap-3 mb-4 text-[#a88bff]">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-lg font-bold text-white">Narrative Priority</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your strongest current target alignment is for <span className="text-white">{titles[0] || 'senior-level roles'}</span>. Increase ATS resilience by rewriting the top third of your resume with job-specific language.
            </p>
          </StitchCard>

          <StitchCard className="p-8 bg-gradient-to-br from-[#15161d] to-[#0d0e12]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-[#f3ffca]" />
              </div>
              <div>
                <p className="text-lg font-bold text-white mb-2">Source Resume</p>
                <p className="text-slate-400 text-sm">{profile.fileName}</p>
                <p className="text-slate-500 text-xs mt-2">Uploaded {new Date(profile.uploadedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </StitchCard>
        </div>
      </div>
    </div>
  );
}
