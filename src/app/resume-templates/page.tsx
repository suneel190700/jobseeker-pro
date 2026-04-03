'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const templates = [
  { id: 'classic', name: 'Classic Professional', desc: 'Clean single-column layout. Best for Workday and iCIMS.', color: '#bbc3ff', sections: ['Summary', 'Skills', 'Experience', 'Education', 'Certifications'], ats: 'Highest compatibility' },
  { id: 'modern', name: 'Modern Minimal', desc: 'Compact with grouped skills. Best for Greenhouse and Lever.', color: '#00daf3', sections: ['Profile', 'Core Competencies', 'Professional Experience', 'Education'], ats: 'High compatibility' },
  { id: 'technical', name: 'Technical Focus', desc: 'Skills-first layout for engineering roles. Projects section included.', color: '#cdbdff', sections: ['Summary', 'Technical Skills', 'Projects', 'Experience', 'Education'], ats: 'High compatibility' },
  { id: 'executive', name: 'Executive Brief', desc: 'Achievement-focused for senior roles. Leadership emphasis.', color: '#00daf3', sections: ['Executive Summary', 'Key Achievements', 'Experience', 'Education', 'Board & Advisory'], ats: 'Good compatibility' },
];

export default function ResumeTemplatesPage() {
  const [selected, setSelected] = useState<string|null>(null);
  const router = useRouter();

  const useTemplate = (id: string) => {
    sessionStorage.setItem('resume_template', id);
    toast.success(`${templates.find(t => t.id === id)?.name} template selected`);
    router.push('/resume-optimizer');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-extrabold tracking-tighter text-[#bbc3ff]">Resume Templates</h2>
      <p className="text-[#c4c5d9] mt-1 text-sm">ATS-friendly layouts optimized for major platforms.</p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map(t => (
          <div key={t.id} onClick={() => setSelected(t.id)} className={`glass-card rounded-2xl p-6 cursor-pointer transition-all ${selected === t.id ? 'ring-2' : ''}`} style={selected === t.id ? {borderColor: t.color + '40', boxShadow: `0 0 30px ${t.color}15`} : {}}>
            {/* Mini preview */}
            <div className="bg-white rounded-xl p-4 mb-4 h-48 overflow-hidden">
              <div className="space-y-2">
                <div className="h-3 rounded" style={{background: t.color, width: '60%', opacity: 0.3}} />
                <div className="h-1.5 bg-slate-200 rounded w-full" />
                <div className="h-1.5 bg-slate-200 rounded w-3/4" />
                <div className="h-2 bg-slate-100 rounded w-40 mt-3" />
                {t.sections.map((s, i) => (
                  <div key={i}>
                    <div className="h-1.5 rounded mt-2 mb-1" style={{background: t.color, width: '30%', opacity: 0.2}} />
                    <div className="h-1 bg-slate-100 rounded w-full" />
                    <div className="h-1 bg-slate-100 rounded w-5/6 mt-0.5" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-[#e1e2eb]">{t.name}</h3>
                <p className="text-xs text-[#c4c5d9] mt-1">{t.desc}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold border" style={{color: t.color, borderColor: t.color + '30', background: t.color + '10'}}>{t.ats}</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {t.sections.map(s => <span key={s} className="px-2 py-0.5 rounded text-[9px] text-[#8e90a2] bg-white/5">{s}</span>)}
            </div>

            <button onClick={(e) => { e.stopPropagation(); useTemplate(t.id); }} className="mt-4 kinetic-btn w-full py-2.5 text-sm">Use This Template</button>
          </div>
        ))}
      </div>
    </div>
  );
}
