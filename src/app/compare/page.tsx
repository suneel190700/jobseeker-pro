'use client';
import { useState, useEffect } from 'react';

interface Job { title:string; company:string; location:string; salary:string; remote:string; description:string; }

export default function ComparePage() {
  const [jobs, setJobs] = useState<Job[]>([{title:'',company:'',location:'',salary:'',remote:'',description:''},{title:'',company:'',location:'',salary:'',remote:'',description:''}]);

  useEffect(() => { try { const s = sessionStorage.getItem('compare_jobs'); if (s) setJobs(JSON.parse(s)); } catch {} }, []);

  const update = (i: number, field: string, val: string) => { const n = [...jobs]; (n[i] as any)[field] = val; setJobs(n); };
  const addJob = () => { if (jobs.length < 3) setJobs([...jobs, {title:'',company:'',location:'',salary:'',remote:'',description:''}]); };

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tighter">Job <span className="text-[#bbc3ff]">Comparison</span></h2>
          <p className="text-[#c4c5d9] mt-1 text-sm">Compare up to 3 jobs side by side</p>
        </div>
        {jobs.length<3 && <button onClick={addJob} className="kinetic-btn px-5 py-2 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-sm">add</span>Add Job</button>}
      </div>

      <div className={`grid gap-6 ${jobs.length===3?'grid-cols-1 md:grid-cols-3':'grid-cols-1 md:grid-cols-2'}`}>
        {jobs.map((job, i) => (
          <div key={i} className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#bbc3ff] uppercase tracking-widest">Job {i+1}</span>
              {jobs.length>2 && <button onClick={() => setJobs(jobs.filter((_,j) => j!==i))} className="text-[#8e90a2] hover:text-[#ffb4ab] transition"><span className="material-symbols-outlined text-sm">close</span></button>}
            </div>
            <input value={job.title} onChange={e=>update(i,'title',e.target.value)} placeholder="Job Title" className="kinetic-input" />
            <input value={job.company} onChange={e=>update(i,'company',e.target.value)} placeholder="Company" className="kinetic-input" />
            <div className="grid grid-cols-2 gap-3">
              <input value={job.location} onChange={e=>update(i,'location',e.target.value)} placeholder="Location" className="kinetic-input" />
              <input value={job.salary} onChange={e=>update(i,'salary',e.target.value)} placeholder="Salary" className="kinetic-input" />
            </div>
            <select value={job.remote} onChange={e=>update(i,'remote',e.target.value)} className="kinetic-input"><option value="">Work Type</option><option value="Remote">Remote</option><option value="Hybrid">Hybrid</option><option value="On-site">On-site</option></select>
            <textarea value={job.description} onChange={e=>update(i,'description',e.target.value)} rows={5} placeholder="Paste JD..." className="kinetic-input resize-none text-sm" />
          </div>
        ))}
      </div>

      {jobs.some(j=>j.title) && <div className="mt-8 glass-card rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-white/5">
            <th className="p-4 text-left text-[10px] font-bold uppercase tracking-widest text-[#8e90a2]">Criteria</th>
            {jobs.map((j,i) => <th key={i} className="p-4 text-left text-sm font-bold text-[#bbc3ff]">{j.title||`Job ${i+1}`}</th>)}
          </tr></thead>
          <tbody>
            {[{k:'company',l:'Company'},{k:'location',l:'Location'},{k:'salary',l:'Salary'},{k:'remote',l:'Work Type'}].map(field => (
              <tr key={field.k} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="p-4 text-xs font-bold uppercase text-[#8e90a2]">{field.l}</td>
                {jobs.map((j,i) => <td key={i} className="p-4 text-sm text-[#c4c5d9]">{(j as any)[field.k]||'—'}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
    </div>
  );
}
