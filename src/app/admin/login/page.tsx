'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Shield } from 'lucide-react';
export default function AdminLoginPage() {
  const [email,setEmail]=useState('');const [pw,setPw]=useState('');const [loading,setLoading]=useState(false);const [error,setError]=useState('');const r=useRouter();
  const handle=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);setError('');
    const res=await fetch('/api/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'login',email,password:pw})});
    const d=await res.json();
    if(d.success){localStorage.setItem('admin_token',d.token);r.push('/admin');}else{setError('Invalid credentials');setLoading(false);}
  };
  return(<div className="min-h-screen bg-bg-0 flex items-center justify-center px-4"><div className="w-full max-w-sm">
    <div className="text-center mb-6"><Shield className="h-10 w-10 text-accent-400 mx-auto mb-3"/><h1 className="text-xl font-bold text-white">Admin Access</h1></div>
    <div className="card p-6"><form onSubmit={handle} className="space-y-3.5">
      <div><label className="label">Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="inp"/></div>
      <div><label className="label">Password</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} required className="inp"/></div>
      {error&&<p className="text-xs text-red-400 bg-red-500/10 rounded-lg p-2">{error}</p>}
      <button type="submit" disabled={loading} className="btn-p w-full py-2.5 flex items-center justify-center gap-2">{loading&&<Loader2 className="h-4 w-4 animate-spin"/>}Sign in</button>
    </form></div>
  </div></div>);
}
