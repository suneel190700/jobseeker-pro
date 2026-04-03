'use client';
import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface WorkExp { company:string; title:string; location:string; startDate:string; endDate:string; current:boolean; }
interface Edu { university:string; degree:string; graduationYear:string; gpa:string; }

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [p, setP] = useState<any>({});
  const [resume, setResume] = useState<any>(null);
  const [workExps, setWorkExps] = useState<WorkExp[]>([{company:'',title:'',location:'',startDate:'',endDate:'',current:false}]);
  const [edus, setEdus] = useState<Edu[]>([{university:'',degree:'',graduationYear:'',gpa:''}]);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const { data: prof } = await sb.from('profiles').select('*').eq('id', user.id).single();
    const { data: res } = await sb.from('resumes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1);
    if (prof) { setP({ ...prof, email: user.email }); if (prof.work_experience?.length) setWorkExps(prof.work_experience); if (prof.education?.length) setEdus(prof.education); }
    if (res?.[0]) setResume(res[0]);
    setLoading(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) throw new Error('Not logged in');
      const { error } = await sb.from('profiles').upsert({
        id: user.id, full_name: p.full_name||'', email: p.email||user.email,
        phone: p.phone||'', location: p.location||'', city: p.city||'', state: p.state||'',
        country: p.country||'US', linkedin_url: p.linkedin_url||'', github_url: p.github_url||'',
        website: p.website||'', current_company: p.current_company||'', current_title: p.current_title||'',
        experience_years: p.experience_years||0, target_role: p.target_role||'',
        target_titles: p.target_titles||[], salary_expectation: p.salary_expectation||'',
        work_authorization: p.work_authorization||'', skills: p.skills||[],
        university: p.university||'', degree: p.degree||'', graduation_year: p.graduation_year||'', gpa: p.gpa||'',
        work_experience: workExps.filter(w => w.company||w.title),
        education: edus.filter(e => e.university||e.degree),
      });
      if (error) throw error;
      toast.success('Profile saved!');
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  const uploadResume = useCallback(async (files: File[]) => {
    if (!files[0]) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('resume', files[0]);
      const r = await fetch('/api/resume/parse', { method: 'POST', body: fd });
      if (!r.ok) throw new Error('Parse failed');
      const { text } = await r.json();
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) throw new Error('Not logged in');
      // Delete old resume first, then insert new
      await sb.from('resumes').delete().eq('user_id', user.id).eq('version_label', 'base');
      const { error } = await sb.from('resumes').insert({ user_id: user.id, file_name: files[0].name, file_url: '', raw_text: text, version_label: 'base', status: 'parsed' });
      if (error) throw error;
      setResume({ file_name: files[0].name, raw_text: text });
      toast.success('Resume uploaded!');
    } catch (e: any) { toast.error(e.message); } finally { setUploading(false); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: uploadResume, accept: { 'application/pdf':['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':['.docx'] }, maxFiles: 1 });
  const up = (f:string, v:any) => setP((prev:any) => ({...prev,[f]:v}));
  const upW = (i:number, f:string, v:any) => { const n=[...workExps]; (n[i] as any)[f]=v; setWorkExps(n); };
  const upE = (i:number, f:string, v:any) => { const n=[...edus]; (n[i] as any)[f]=v; setEdus(n); };
  const addSkill = () => { if (skillInput.trim()) { up('skills', [...(p.skills||[]), skillInput.trim()]); setSkillInput(''); } };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-[#bbc3ff]"/></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold tracking-tighter text-[#bbc3ff]">Profile</h2>
        <button onClick={save} disabled={saving} className="kinetic-btn px-6 py-2.5 text-sm flex items-center gap-2">{saving?<Loader2 className="h-4 w-4 animate-spin"/>:<span className="material-symbols-outlined text-sm">save</span>}Save</button>
      </div>

      {/* Resume */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-bold text-[#e1e2eb] flex items-center gap-2 mb-3"><span className="material-symbols-outlined text-[#bbc3ff]">upload_file</span>Resume</h3>
        {resume && <div className="flex items-center justify-between mb-3 p-3 rounded-xl bg-[#007886]/10 border border-[#00daf3]/20">
          <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[#00daf3] text-sm" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span><span className="text-sm text-[#00daf3]">{resume.file_name}</span></div>
          <button onClick={() => setResume(null)} className="text-xs text-[#8e90a2] hover:text-[#ffb4ab]">Change</button>
        </div>}
        <div {...getRootProps()} className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 cursor-pointer transition ${isDragActive?'border-[#bbc3ff]/40 bg-[#3c59fd]/10':'border-[#434656] hover:border-[#bbc3ff]/20'}`}>
          <input {...getInputProps()} />
          {uploading?<Loader2 className="h-5 w-5 animate-spin text-[#bbc3ff]"/>:<>
            <span className="material-symbols-outlined text-2xl text-[#8e90a2] mb-2">cloud_upload</span>
            <p className="text-xs text-[#8e90a2]">{resume ? 'Drop new resume to replace' : 'Drop PDF or DOCX to upload'}</p>
          </>}
        </div>
      </div>

      {/* Personal */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-[#e1e2eb] flex items-center gap-2"><span className="material-symbols-outlined text-[#bbc3ff]">person</span>Personal</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="kinetic-label">Full Name</label><input value={p.full_name||''} onChange={e=>up('full_name',e.target.value)} className="kinetic-input"/></div>
          <div><label className="kinetic-label">Email</label><input value={p.email||''} onChange={e=>up('email',e.target.value)} className="kinetic-input"/></div>
          <div><label className="kinetic-label">Phone</label><input value={p.phone||''} onChange={e=>up('phone',e.target.value)} className="kinetic-input" placeholder="+1 (xxx) xxx-xxxx"/></div>
          <div><label className="kinetic-label">Location</label><input value={p.location||''} onChange={e=>up('location',e.target.value)} className="kinetic-input" placeholder="Dallas, TX"/></div>
          <div><label className="kinetic-label">City</label><input value={p.city||''} onChange={e=>up('city',e.target.value)} className="kinetic-input"/></div>
          <div><label className="kinetic-label">State</label><input value={p.state||''} onChange={e=>up('state',e.target.value)} className="kinetic-input"/></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="kinetic-label">LinkedIn</label><input value={p.linkedin_url||''} onChange={e=>up('linkedin_url',e.target.value)} className="kinetic-input"/></div>
          <div><label className="kinetic-label">GitHub</label><input value={p.github_url||''} onChange={e=>up('github_url',e.target.value)} className="kinetic-input"/></div>
          <div><label className="kinetic-label">Website</label><input value={p.website||''} onChange={e=>up('website',e.target.value)} className="kinetic-input"/></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="kinetic-label">Work Authorization</label><select value={p.work_authorization||''} onChange={e=>up('work_authorization',e.target.value)} className="kinetic-select w-full"><option value="">Select</option><option>US Citizen</option><option>Green Card</option><option>H1B</option><option>EAD / OPT</option><option>Need Sponsorship</option></select></div>
          <div><label className="kinetic-label">Salary Expectation</label><input value={p.salary_expectation||''} onChange={e=>up('salary_expectation',e.target.value)} className="kinetic-input" placeholder="$150,000"/></div>
        </div>
      </div>

      {/* Professional */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-[#e1e2eb] flex items-center gap-2"><span className="material-symbols-outlined text-[#bbc3ff]">work</span>Professional</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="kinetic-label">Current Title</label><input value={p.current_title||''} onChange={e=>up('current_title',e.target.value)} className="kinetic-input"/></div>
          <div><label className="kinetic-label">Current Company</label><input value={p.current_company||''} onChange={e=>up('current_company',e.target.value)} className="kinetic-input"/></div>
          <div><label className="kinetic-label">Years Experience</label><input type="number" value={p.experience_years||''} onChange={e=>up('experience_years',parseInt(e.target.value)||0)} className="kinetic-input"/></div>
          <div><label className="kinetic-label">Target Role</label><input value={p.target_role||''} onChange={e=>up('target_role',e.target.value)} className="kinetic-input"/></div>
        </div>
      </div>

      {/* Work Experience */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-[#e1e2eb] flex items-center gap-2"><span className="material-symbols-outlined text-[#bbc3ff]">business_center</span>Work Experience</h3><button onClick={()=>setWorkExps([...workExps,{company:'',title:'',location:'',startDate:'',endDate:'',current:false}])} className="text-xs text-[#bbc3ff] hover:underline">+ Add</button></div>
        {workExps.map((w,i) => (
          <div key={i} className="p-3 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
            <div className="flex justify-between"><span className="text-[10px] font-bold text-[#8e90a2]">#{i+1}</span>{workExps.length>1&&<button onClick={()=>setWorkExps(workExps.filter((_,j)=>j!==i))} className="text-[10px] text-[#ffb4ab]">Remove</button>}</div>
            <div className="grid grid-cols-2 gap-2">
              <input value={w.company} onChange={e=>upW(i,'company',e.target.value)} className="kinetic-input" placeholder="Company"/>
              <input value={w.title} onChange={e=>upW(i,'title',e.target.value)} className="kinetic-input" placeholder="Title"/>
              <input value={w.location} onChange={e=>upW(i,'location',e.target.value)} className="kinetic-input" placeholder="Location"/>
              <div className="flex gap-2">
                <input value={w.startDate} onChange={e=>upW(i,'startDate',e.target.value)} className="kinetic-input" placeholder="Start"/>
                <input value={w.current?'Present':w.endDate} onChange={e=>upW(i,'endDate',e.target.value)} disabled={w.current} className="kinetic-input" placeholder="End"/>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs text-[#c4c5d9]"><input type="checkbox" checked={w.current} onChange={e=>upW(i,'current',e.target.checked)}/>Current</label>
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-[#e1e2eb] flex items-center gap-2"><span className="material-symbols-outlined text-[#bbc3ff]">school</span>Education</h3><button onClick={()=>setEdus([...edus,{university:'',degree:'',graduationYear:'',gpa:''}])} className="text-xs text-[#bbc3ff] hover:underline">+ Add</button></div>
        {edus.map((e,i) => (
          <div key={i} className="p-3 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
            <div className="flex justify-between"><span className="text-[10px] font-bold text-[#8e90a2]">#{i+1}</span>{edus.length>1&&<button onClick={()=>setEdus(edus.filter((_,j)=>j!==i))} className="text-[10px] text-[#ffb4ab]">Remove</button>}</div>
            <div className="grid grid-cols-2 gap-2">
              <input value={e.university} onChange={ev=>upE(i,'university',ev.target.value)} className="kinetic-input" placeholder="University"/>
              <input value={e.degree} onChange={ev=>upE(i,'degree',ev.target.value)} className="kinetic-input" placeholder="Degree"/>
              <input value={e.graduationYear} onChange={ev=>upE(i,'graduationYear',ev.target.value)} className="kinetic-input" placeholder="Grad Year"/>
              <input value={e.gpa} onChange={ev=>upE(i,'gpa',ev.target.value)} className="kinetic-input" placeholder="GPA"/>
            </div>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-[#e1e2eb] flex items-center gap-2"><span className="material-symbols-outlined text-[#bbc3ff]">code</span>Skills</h3>
        <div className="flex gap-2"><input value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addSkill();}}} className="kinetic-input flex-1" placeholder="Type skill + Enter"/><button onClick={addSkill} className="kinetic-btn px-4 py-2 text-sm">Add</button></div>
        <div className="flex flex-wrap gap-2">{(p.skills||[]).map((s:string)=><span key={s} className="px-3 py-1 rounded-lg text-xs bg-[#3c59fd]/15 text-[#bbc3ff] border border-[#bbc3ff]/20 flex items-center gap-1">{s}<button onClick={()=>up('skills',(p.skills||[]).filter((x:string)=>x!==s))} className="text-[#bbc3ff]/40 hover:text-[#ffb4ab]">×</button></span>)}</div>
      </div>

      <button onClick={save} disabled={saving} className="kinetic-btn w-full py-3 text-sm flex items-center justify-center gap-2">{saving?<Loader2 className="h-4 w-4 animate-spin"/>:<span className="material-symbols-outlined text-sm">save</span>}Save Profile</button>
    </div>
  );
}
