import { createClient } from '@supabase/supabase-js';

export default async function SharedResumePage({ params }: { params: { id: string } }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return <div className="min-h-screen bg-black flex items-center justify-center text-white/50">Not configured</div>;
  
  const sb = createClient(url, key);
  const { data } = await sb.from('shared_resumes').select('resume_data').eq('id', params.id).single();
  if (!data) return <div className="min-h-screen bg-black flex items-center justify-center text-white/50">Resume not found</div>;
  
  const r = data.resume_data;
  return (
    <div className="min-h-screen bg-black py-12 px-6">
      <div className="max-w-[700px] mx-auto apple-card p-10">
        <div className="text-center border-b border-white/[0.06] pb-6 mb-6">
          <h1 className="text-2xl font-bold text-white">{r.name}</h1>
          <p className="text-sm text-white/40 mt-1">{[r.email, r.phone, r.location].filter(Boolean).join(' • ')}</p>
        </div>
        {r.summary && <div className="mb-6"><p className="apple-section mb-2">Summary</p><p className="text-sm text-white/60 leading-relaxed">{r.summary}</p></div>}
        {r.skills_grouped && <div className="mb-6"><p className="apple-section mb-2">Skills</p>{Object.entries(r.skills_grouped).map(([c,s]:any) => Array.isArray(s) && s.length ? <p key={c} className="text-sm text-white/60"><span className="font-semibold text-white/80">{c}:</span> {s.join(', ')}</p> : null)}</div>}
        {r.experience?.map((exp: any, i: number) => (
          <div key={i} className="mb-5"><p className="text-sm font-semibold text-white/90">{exp.title} — {exp.company}</p><p className="text-xs text-white/30">{exp.dates}</p>{exp.bullets?.map((b: string, j: number) => <p key={j} className="text-sm text-white/50 mt-1 pl-3 border-l border-white/[0.06]">{b}</p>)}</div>
        ))}
        {r.education?.map((ed: any, i: number) => (
          <div key={i} className="mb-3"><p className="text-sm font-semibold text-white/90">{ed.degree} — {ed.institution}</p><p className="text-xs text-white/30">{ed.dates}</p></div>
        ))}
      </div>
    </div>
  );
}
