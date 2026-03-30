'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Sparkles } from 'lucide-react';
export default function LoginPage() {
  const [email,setEmail]=useState('');const [pw,setPw]=useState('');const [loading,setLoading]=useState(false);const [error,setError]=useState('');const r=useRouter();
  const handle=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);setError('');const s=createClient();const{error}=await s.auth.signInWithPassword({email,password:pw});if(error){setError(error.message);setLoading(false);}else r.push('/dashboard');};
  const google=async()=>{const s=createClient();await s.auth.signInWithOAuth({provider:'google',options:{redirectTo:`${window.location.origin}/api/auth/callback`}});};
  return(<div className="min-h-screen bg-[#10131a] flex items-center justify-center px-4"><div className="w-full max-w-sm">
    <div className="text-center mb-8"><div className="inline-flex h-10 w-10 rounded-[16px] items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600 mb-4"><Sparkles className="h-5 w-5 text-white" /></div><h1 className="text-xl font-bold text-white">Welcome back</h1><p className="mt-1 text-sm text-white/500">Sign in to continue</p></div>
    <div className="rounded-[16px] border border-white/5 bg-[var(--surface-1)] p-6">
      <form onSubmit={handle} className="space-y-3.5">
        <div><label className="label">Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="input-hig" placeholder="you@email.com" /></div>
        <div><label className="label">Password</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} required className="input-hig" /></div>
        {error&&<p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-[12px] p-2.5">{error}</p>}
        <button type="submit" disabled={loading} className="w-full text-sm font-semibold text-black bg-emerald-400 hover:bg-emerald-300 rounded-[12px] py-2.5 flex items-center justify-center gap-2 transition">{loading&&<Loader2 className="h-4 w-4 animate-spin"/>}Sign in</button>
      </form>
      <div className="mt-3"><button onClick={google} className="btn-gray w-full py-2.5">Continue with Google</button></div>
    </div>
    <p className="mt-5 text-center text-sm text-white/600">No account? <Link href="/auth/signup" className="text-emerald-400 font-medium hover:text-emerald-300">Sign up</Link></p>
  </div></div>);
}
