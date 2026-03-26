'use client';
import { useState, useEffect } from 'react';
import { Users, BarChart3, Shield, LogOut, Search, Download, Settings, ChevronDown, Loader2, Bell, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<any>(null);
  const [announcement, setAnnouncement] = useState('');
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { window.location.href = '/admin/login'; return; }
    fetchData(token);
  }, []);

  const fetchData = async (token?: string) => {
    const t = token || localStorage.getItem('admin_token');
    try {
      const [uRes, sRes] = await Promise.all([
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${t}` } }),
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${t}` } }),
      ]);
      if (!uRes.ok) { localStorage.removeItem('admin_token'); window.location.href = '/admin/login'; return; }
      setUsers(await uRes.json());
      if (sRes.ok) setStats(await sRes.json());
      setAuth(true);
    } catch { window.location.href = '/admin/login'; }
    finally { setLoading(false); }
  };

  const updateUser = async (userId: string, data: any) => {
    const t = localStorage.getItem('admin_token');
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }, body: JSON.stringify({ userId, ...data }) });
    setEditUser(null);
    fetchData();
  };

  const exportCSV = () => {
    const csv = 'Name,Email,Tier,AI Used,Joined\n' + users.map(u => `${u.name},${u.email},${u.tier},${u.ai_used}/${u.ai_limit},${u.joined}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'users.csv'; a.click();
  };

  const logout = () => { localStorage.removeItem('admin_token'); window.location.href = '/admin/login'; };

  const filtered = users.filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>;
  if (!auth) return null;

  return (
    <div>
      {/* Admin Nav */}
      <header className="h-12 border-b border-zinc-800/80 bg-[#0a0a0a]/80 backdrop-blur-xl flex items-center px-6 justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-indigo-500" /><span className="text-sm font-bold text-white">Admin Panel</span></div>
          <nav className="flex gap-0.5 ml-4">
            {[{id:'users',l:'Users',i:Users},{id:'stats',l:'Analytics',i:BarChart3},{id:'controls',l:'Controls',i:Settings}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${tab===t.id?'bg-zinc-800 text-white':'text-zinc-500 hover:text-zinc-300'}`}><t.i className="h-3 w-3"/>{t.l}</button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>fetchData()} className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-300 transition"><RefreshCw className="h-3.5 w-3.5"/></button>
          <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-500 hover:text-red-400 transition"><LogOut className="h-3 w-3"/>Logout</button>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 py-6">
        {/* Stats cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            {l:'Total Users',v:stats?.totalUsers||users.length,c:'text-indigo-400'},
            {l:'Paid Users',v:stats?.paidUsers||0,c:'text-emerald-400'},
            {l:'Active Today',v:stats?.activeToday||0,c:'text-blue-400'},
            {l:'Cached Jobs',v:stats?.cachedJobs||0,c:'text-amber-400'},
          ].map(s=>(<div key={s.l} className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4"><p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">{s.l}</p><p className={`text-2xl font-bold mt-1 ${s.c}`}>{s.v}</p></div>))}
        </div>

        {/* Users Tab */}
        {tab==='users'&&(<div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800/60">
            <h2 className="text-sm font-bold text-white flex items-center gap-2"><Users className="h-4 w-4 text-indigo-400"/>Users ({filtered.length})</h2>
            <div className="flex gap-2">
              <div className="relative"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-600"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="rounded-md border border-zinc-800 bg-zinc-900 pl-7 pr-3 py-1.5 text-xs text-zinc-300 w-48 focus:outline-none focus:border-zinc-700"/></div>
              <button onClick={exportCSV} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-500 border border-zinc-800 hover:text-white hover:border-zinc-700 transition"><Download className="h-3 w-3"/>CSV</button>
            </div>
          </div>
          <table className="w-full">
            <thead><tr className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 border-b border-zinc-800/40">
              <th className="text-left p-3">User</th><th className="text-left p-3">Tier</th><th className="text-left p-3">AI Used</th><th className="text-left p-3">Searches</th><th className="text-left p-3">Joined</th><th className="text-right p-3">Action</th>
            </tr></thead>
            <tbody>{filtered.map(u=>(<tr key={u.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20">
              <td className="p-3"><p className="text-sm font-medium text-zinc-200">{u.name||'—'}</p><p className="text-xs text-zinc-600">{u.email}</p></td>
              <td className="p-3"><span className={`badge ${u.tier==='paid'?'bg-emerald-500/10 text-emerald-400':u.tier==='custom'?'bg-violet-500/10 text-violet-400':'bg-zinc-800 text-zinc-400'}`}>{u.tier}</span></td>
              <td className="p-3 text-xs text-zinc-400">{u.ai_used}/{u.ai_limit}</td>
              <td className="p-3 text-xs text-zinc-400">{u.search_used}/{u.search_limit}</td>
              <td className="p-3 text-xs text-zinc-600">{u.joined?new Date(u.joined).toLocaleDateString():'-'}</td>
              <td className="p-3 text-right"><button onClick={()=>setEditUser(u)} className="text-xs font-medium text-indigo-400 hover:text-indigo-300">Edit</button></td>
            </tr>))}</tbody>
          </table>
        </div>)}

        {/* Stats Tab */}
        {tab==='stats'&&(<div className="space-y-4">
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6">
            <h2 className="text-sm font-bold text-white mb-4">Usage Overview</h2>
            <div className="grid grid-cols-3 gap-4">
              {[{l:'AI Calls Today',v:stats?.aiCallsToday||0},{l:'Job Searches Today',v:stats?.searchesToday||0},{l:'Mock Interviews Today',v:stats?.mockToday||0}].map(s=>(<div key={s.l} className="rounded-lg bg-zinc-800/30 p-4"><p className="text-xs text-zinc-500">{s.l}</p><p className="text-xl font-bold text-white mt-1">{s.v}</p></div>))}
            </div>
          </div>
        </div>)}

        {/* Controls Tab */}
        {tab==='controls'&&(<div className="space-y-4">
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6">
            <h2 className="text-sm font-bold text-white mb-4">Feature Controls</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2"><div><p className="text-sm text-zinc-200">Maintenance Mode</p><p className="text-xs text-zinc-600">Show maintenance page to all users</p></div><button onClick={()=>setMaintenance(!maintenance)} className={`${maintenance?'text-emerald-400':'text-zinc-600'}`}>{maintenance?<ToggleRight className="h-6 w-6"/>:<ToggleLeft className="h-6 w-6"/>}</button></div>
              <div className="border-t border-zinc-800/40 pt-3">
                <p className="text-sm text-zinc-200 mb-2">Announcement Banner</p>
                <div className="flex gap-2"><input value={announcement} onChange={e=>setAnnouncement(e.target.value)} placeholder="Type announcement..." className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 flex-1 focus:outline-none focus:border-zinc-700"/><button className="px-3 py-2 rounded-md text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition">Publish</button></div>
              </div>
              <div className="border-t border-zinc-800/40 pt-3">
                <p className="text-sm text-zinc-200 mb-2">Default Free Tier Limits</p>
                <div className="grid grid-cols-4 gap-3">
                  {[{l:'AI Calls/Day',v:5},{l:'Searches/Day',v:10},{l:'Mock/Day',v:3},{l:'Downloads/Day',v:2}].map(x=>(<div key={x.l}><p className="text-[10px] text-zinc-600 mb-1">{x.l}</p><input defaultValue={x.v} className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 w-full focus:outline-none focus:border-zinc-700"/></div>))}
                </div>
              </div>
            </div>
          </div>
        </div>)}

        {/* Edit Modal */}
        {editUser&&(<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={()=>setEditUser(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-96" onClick={e=>e.stopPropagation()}>
            <h3 className="text-sm font-bold text-white mb-4">Edit {editUser.name||editUser.email}</h3>
            <div className="space-y-3">
              <div><p className="label">Tier</p><select defaultValue={editUser.tier} id="edit-tier" className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 w-full"><option value="free">Free</option><option value="paid">Paid</option><option value="custom">Custom</option></select></div>
              <div><p className="label">AI Limit/Day</p><input defaultValue={editUser.ai_limit} id="edit-ai" type="number" className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 w-full"/></div>
              <div><p className="label">Search Limit/Day</p><input defaultValue={editUser.search_limit} id="edit-search" type="number" className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 w-full"/></div>
              <div><p className="label">Notes</p><input defaultValue={editUser.notes||''} id="edit-notes" className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 w-full"/></div>
              <div className="flex gap-2 pt-2">
                <button onClick={()=>{const tier=(document.getElementById('edit-tier')as HTMLSelectElement).value;const ai=parseInt((document.getElementById('edit-ai')as HTMLInputElement).value);const sr=parseInt((document.getElementById('edit-search')as HTMLInputElement).value);const notes=(document.getElementById('edit-notes')as HTMLInputElement).value;updateUser(editUser.id,{tier,daily_ai_limit:ai,daily_search_limit:sr,notes});}} className="flex-1 px-4 py-2 rounded-md text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition">Save</button>
                <button onClick={()=>setEditUser(null)} className="px-4 py-2 rounded-md text-xs font-medium text-zinc-400 border border-zinc-800 hover:border-zinc-700 transition">Cancel</button>
              </div>
            </div>
          </div>
        </div>)}
      </div>
    </div>
  );
}
