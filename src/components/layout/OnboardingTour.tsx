'use client';
import { useState, useEffect } from 'react';

const steps = [
  { title: 'Upload Your Resume', desc: 'Start by uploading your resume in Profile to unlock AI features.', icon: 'upload_file', target: '/profile' },
  { title: 'Search Jobs', desc: 'Find jobs from 323K+ sources. AI matches based on your resume.', icon: 'work', target: '/jobs' },
  { title: 'Optimize with AI', desc: 'Get ATS scores and AI-rewritten resumes that score 95+.', icon: 'psychology', target: '/resume-optimizer' },
  { title: 'Practice Interviews', desc: 'Voice-powered mock interviews with real-time scoring.', icon: 'record_voice_over', target: '/mock-interview' },
  { title: 'Track Applications', desc: 'Kanban board to manage your entire pipeline.', icon: 'assignment', target: '/tracker' },
];

export default function OnboardingTour() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const dismissed = localStorage.getItem('tour_dismissed');
    if (!dismissed) setShow(true);
  }, []);

  const dismiss = () => { setShow(false); localStorage.setItem('tour_dismissed', 'true'); };
  const next = () => { if (step < steps.length - 1) setStep(step + 1); else dismiss(); };

  if (!show) return null;

  const s = steps[step];
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center" onClick={dismiss}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md" onClick={e => e.stopPropagation()} style={{background:'rgba(29,32,38,0.95)',backdropFilter:'blur(40px)',border:'1px solid rgba(187,195,255,0.15)',borderRadius:'24px',boxShadow:'0 25px 80px rgba(0,0,0,0.6)'}}>
        <div className="p-8 text-center">
          <div className="flex justify-center gap-1.5 mb-6">
            {steps.map((_, i) => <div key={i} className={`h-1 rounded-full transition-all ${i === step ? 'w-8 bg-[#3c59fd]' : i < step ? 'w-4 bg-[#bbc3ff]/40' : 'w-4 bg-white/10'}`} />)}
          </div>
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6" style={{background:'rgba(60,89,253,0.15)'}}>
            <span className="material-symbols-outlined text-[#bbc3ff] text-3xl">{s.icon}</span>
          </div>
          <h3 className="text-xl font-bold text-[#e1e2eb] mb-2">{s.title}</h3>
          <p className="text-sm text-[#c4c5d9] leading-relaxed mb-8">{s.desc}</p>
          <div className="flex gap-3">
            <button onClick={dismiss} className="kinetic-btn-ghost flex-1 py-3 text-sm">Skip Tour</button>
            <button onClick={next} className="kinetic-btn flex-1 py-3 text-sm">{step === steps.length - 1 ? 'Get Started' : 'Next'}</button>
          </div>
          <p className="text-[10px] text-[#8e90a2] mt-4">{step + 1} of {steps.length}</p>
        </div>
      </div>
    </div>
  );
}
