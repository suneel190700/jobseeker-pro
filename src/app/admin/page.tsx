'use client';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const [auth,setAuth]=useState(false);const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState('users');const [users,setUsers]=useState<any[]>([]);const [stats,setStats]=useState<any>(null);
  const [search,setSearch]=useState('');const [editUser,setEditUser]=useState<any>(null);
  const [announcement,setAnnouncement]=useState('');const [maintenance,setMaintenance]=useState(false);

  useEffect(()=>{const t=localStorage.getItem('admin_token');if(!t){window.location.href='/admin/login';return;}fetchData(t);},[]);

  const fetchData=async(token?:string)=>{const t=token||localStorage.getItem('admin_token');
    try{const [uRes,sRes]=await Promise.all([fetch('/api/admin/users',{headers:{Authorization:`Bearer ${t}`}}),fetch('/api/admin/stats',{headers:{Authorization:`Bearer ${t}`}})]);
      if(!uRes.ok){localStorage.removeItem('admin_token');window.location.href='/admin/login';return;}
      setUsers(await uRes.json());if(sRes.ok)setStats(await sRes.json());setAuth(true);
    }catch{window.location.href='/admin/login';}finally{setLoading(false);}};

  const updateUser=async(userId:string,data:any)=>{const t=localStorage.getItem('admin_token');
    await fetch('/api/admin/users',{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${t}`},body:JSON.stringify({userId,...data})});setEditUser(null);fetchData();};

  const exportCSV=()=>{const csv='Name,Email,Tier,AI Used,Joined\n'+users.map(u=>`${u.name},${u.email},${u.tier},${u.ai_used}/${u.ai_limit},${u.joined}`).join('\n');
    const blob=new Blob([csv],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='users.csv';a.click();};

  const publishAnnouncement=async()=>{if(!announcement.trim())return;
    await fetch('/api/admin/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:'announcement',value:announcement})});toast('Published');};
  const toggleMaintenance=async()=>{const next=!maintenance;setMaintenance(next);
    await fetch('/api/admin/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:'maintenance',value:String(next)})});};
  const toast=(m:string)=>{/* simple */};

  const logout=()=>{localStorage.removeItem('admin_token');window.location.href='/admin/login';};
  const filtered=users.filter(u=>!search||u.name?.toLowerCase().includes(search.toLowerCase())||u.email?.toLowerCase().includes(search.toLowerCase()));

  if(loading)return<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#bbc3ff]"/></div>;
  if(!auth)return null;

  return(<div>
    {/* Admin Nav */}
    <header className="h-14 flex items-center px-8 justify-between" style={{background:'rgba(16,19,26,0.6)',backdropFilter:'blur(24px)',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[#3c59fd]">shield</span><span className="text-sm font-bold text-[#e1e2eb]">Admin Panel</span></div>
        <nav className="flex gap-1 ml-4">
          {[{id:'users',l:'Users',i:'group'},{id:'stats',l:'Analytics',i:'insights'},{id:'controls',l:'Controls',i:'settings'}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition ${tab===t.id?'bg-[#3c59fd]/15 text-[#bbc3ff]':'text-[#8e90a2] hover:text-[#c4c5d9]'}`}>
              <span className="material-symbols-outlined text-base">{t.i}</span>{t.l}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={()=>fetchData()} className="p-2 rounded-lg text-[#8e90a2] hover:text-[#c4c5d9] hover:bg-white/5 transition"><span className="material-symbols-outlined text-base">refresh</span></button>
        <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#8e90a2] hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/5 transition"><span className="material-symbols-outlined text-base">logout</span>Logout</button>
      </div>
    </header>

    <div className="max-w-[1200px] mx-auto px-8 py-8">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[{l:'Total Users',v:stats?.totalUsers||users.length,c:'text-[#bbc3ff]',i:'group'},{l:'Paid Users',v:stats?.paidUsers||0,c:'text-[#00daf3]',i:'workspace_premium'},{l:'Active Today',v:stats?.activeToday||0,c:'text-[#cdbdff]',i:'trending_up'},{l:'Cached Jobs',v:stats?.cachedJobs||0,c:'text-[#e1e2eb]',i:'work'}].map(s=>(
          <div key={s.l} className="glass-card rounded-2xl p-6">
            <div className="flex justify-between items-start"><span className="text-[10px] font-bold uppercase tracking-widest text-[#8e90a2]">{s.l}</span><span className={`material-symbols-outlined ${s.c}`}>{s.i}</span></div>
            <p className={`text-3xl font-black mt-2 tracking-tighter ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Users */}
      {tab==='users'&&<div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-sm font-bold flex items-center gap-2"><span className="material-symbols-outlined text-[#bbc3ff] text-base">group</span>Users ({filtered.length})</h2>
          <div className="flex gap-3">
            <div className="relative"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8e90a2] text-sm">search</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="rounded-xl bg-white/5 border border-white/10 pl-8 pr-3 py-2 text-xs text-[#e1e2eb] w-48 focus:outline-none focus:border-[#bbc3ff]/20"/></div>
            <button onClick={exportCSV} className="kinetic-btn-ghost px-4 py-2 text-xs flex items-center gap-1"><span className="material-symbols-outlined text-sm">download</span>CSV</button>
          </div>
        </div>
        <table className="w-full">
          <thead><tr className="text-[10px] font-bold uppercase tracking-widest text-[#8e90a2] border-b border-white/5">
            <th className="text-left p-4">User</th><th className="text-left p-4">Tier</th><th className="text-left p-4">AI Used</th><th className="text-left p-4">Searches</th><th className="text-left p-4">Joined</th><th className="text-right p-4">Action</th>
          </tr></thead>
          <tbody>{filtered.map(u=>(<tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition">
            <td className="p-4"><p className="text-sm font-medium text-[#e1e2eb]">{u.name||'—'}</p><p className="text-xs text-[#8e90a2]">{u.email}</p></td>
            <td className="p-4"><span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${u.tier==='paid'?'bg-[#00daf3]/10 text-[#00daf3]':u.tier==='custom'?'bg-[#cdbdff]/10 text-[#cdbdff]':'bg-white/5 text-[#8e90a2]'}`}>{u.tier}</span></td>
            <td className="p-4 text-xs text-[#c4c5d9]">{u.ai_used}/{u.ai_limit}</td>
            <td className="p-4 text-xs text-[#c4c5d9]">{u.search_used}/{u.search_limit}</td>
            <td className="p-4 text-xs text-[#8e90a2]">{u.joined?new Date(u.joined).toLocaleDateString():'-'}</td>
            <td className="p-4 text-right"><button onClick={()=>setEditUser(u)} className="text-xs font-bold text-[#bbc3ff] hover:text-[#e1e2eb] transition">Edit</button></td>
          </tr>))}</tbody>
        </table>
      </div>}

      {/* Stats Tab */}
      {tab==='stats'&&<div className="glass-card rounded-2xl p-8">
        <h2 className="text-lg font-bold mb-6">Usage Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          {[{l:'AI Calls Today',v:stats?.aiCallsToday||0,c:'text-[#bbc3ff]'},{l:'Searches Today',v:stats?.searchesToday||0,c:'text-[#00daf3]'},{l:'Mock Interviews',v:stats?.mockToday||0,c:'text-[#cdbdff]'}].map(s=>(<div key={s.l} className="rounded-2xl p-5" style={{background:'rgba(255,255,255,0.03)'}}><p className="text-xs text-[#8e90a2]">{s.l}</p><p className={`text-2xl font-black mt-1 ${s.c}`}>{s.v}</p></div>))}
        </div>
      </div>}

      {/* Controls Tab */}
      {tab==='controls'&&<div className="glass-card rounded-2xl p-8 space-y-6">
        <h2 className="text-lg font-bold">Feature Controls</h2>
        <div className="flex items-center justify-between py-3 border-b border-white/5">
          <div><p className="text-sm text-[#e1e2eb]">Maintenance Mode</p><p className="text-xs text-[#8e90a2]">Show maintenance page to all users</p></div>
          <button onClick={toggleMaintenance} className={`w-10 h-5 rounded-full relative transition-all ${maintenance?'bg-[#3c59fd]':'bg-[#434656]'}`}>
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${maintenance?'right-1':'left-1'}`}/>
          </button>
        </div>
        <div>
          <p className="text-sm text-[#e1e2eb] mb-2">Announcement Banner</p>
          <div className="flex gap-2"><input value={announcement} onChange={e=>setAnnouncement(e.target.value)} placeholder="Type announcement..." className="kinetic-input flex-1"/><button onClick={publishAnnouncement} className="kinetic-btn px-4 py-2 text-xs">Publish</button></div>
        </div>
        <div>
          <p className="text-sm text-[#e1e2eb] mb-3">Default Free Tier Limits</p>
          <div className="grid grid-cols-4 gap-3">
            {[{l:'AI Calls/Day',v:5},{l:'Searches/Day',v:10},{l:'Mock/Day',v:3},{l:'Downloads/Day',v:2}].map(x=>(<div key={x.l}><p className="kinetic-label">{x.l}</p><input defaultValue={x.v} className="kinetic-input"/></div>))}
          </div>
        </div>
      </div>}

      {/* Edit Modal */}
      {editUser&&<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={()=>setEditUser(null)}>
        <div className="glass-card rounded-3xl p-8 w-[420px]" onClick={e=>e.stopPropagation()} style={{boxShadow:'0 25px 60px rgba(0,0,0,0.5)'}}>
          <h3 className="text-lg font-bold mb-6">Edit {editUser.name||editUser.email}</h3>
          <div className="space-y-4">
            <div><label className="kinetic-label">Tier</label><select defaultValue={editUser.tier} id="edit-tier" className="kinetic-input"><option value="free">Free</option><option value="paid">Paid</option><option value="custom">Custom</option></select></div>
            <div><label className="kinetic-label">AI Limit/Day</label><input defaultValue={editUser.ai_limit} id="edit-ai" type="number" className="kinetic-input"/></div>
            <div><label className="kinetic-label">Search Limit/Day</label><input defaultValue={editUser.search_limit} id="edit-search" type="number" className="kinetic-input"/></div>
            <div><label className="kinetic-label">Notes</label><input defaultValue={editUser.notes||''} id="edit-notes" className="kinetic-input"/></div>
          </div>
          <div className="flex gap-3 mt-8">
            <button onClick={()=>{const tier=(document.getElementById('edit-tier')as HTMLSelectElement).value;const ai=parseInt((document.getElementById('edit-ai')as HTMLInputElement).value);const sr=parseInt((document.getElementById('edit-search')as HTMLInputElement).value);const notes=(document.getElementById('edit-notes')as HTMLInputElement).value;updateUser(editUser.id,{tier,daily_ai_limit:ai,daily_search_limit:sr,notes});}} className="kinetic-btn flex-1 py-3">Save</button>
            <button onClick={()=>setEditUser(null)} className="kinetic-btn-ghost px-6 py-3">Cancel</button>
          </div>
        </div>
      </div>}
    </div>
  </div>);
}
