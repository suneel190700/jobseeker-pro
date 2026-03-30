'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [email,setEmail]=useState('');const [pw,setPw]=useState('');const [loading,setLoading]=useState(false);const [error,setError]=useState('');const r=useRouter();
  const handle=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);setError('');
    const res=await fetch('/api/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'login',email,password:pw})});
    const d=await res.json();
    if(d.success){localStorage.setItem('admin_token',d.token);r.push('/admin');}else{setError('Invalid credentials');setLoading(false);}
  };
  return(
    <div className="min-h-screen flex items-center justify-center px-4 mesh-gradient" style={{background:'#10131a'}}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#3c59fd] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-white text-2xl" style={{fontVariationSettings:"'FILL' 1"}}>shield</span>
          </div>
          <h1 className="text-2xl font-bold text-[#e1e2eb]">Admin Access</h1>
          <p className="text-[#c4c5d9] text-sm mt-1">Restricted area</p>
        </div>
        <div className="glass-card rounded-3xl p-8">
          <form onSubmit={handle} className="space-y-4">
            <div><label className="kinetic-label">Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="kinetic-input" /></div>
            <div><label className="kinetic-label">Password</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} required className="kinetic-input" /></div>
            {error&&<p className="text-xs text-[#ffb4ab] bg-[#93000a]/10 rounded-xl p-3">{error}</p>}
            <button type="submit" disabled={loading} className="kinetic-btn w-full py-3 flex items-center justify-center gap-2">{loading&&<Loader2 className="h-4 w-4 animate-spin"/>}Sign in</button>
          </form>
        </div>
      </div>
    </div>
  );
}
