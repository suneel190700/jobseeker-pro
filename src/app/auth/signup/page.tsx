'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Loader2, Sparkles } from 'lucide-react';
export default function SignupPage() {
  const [email,setEmail]=useState('');const [pw,setPw]=useState('');const [name,setName]=useState('');const [loading,setLoading]=useState(false);const [error,setError]=useState('');const [done,setDone]=useState(false);
  const handle=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);setError('');const s=createClient();const{error}=await s.auth.signUp({email,password:pw,options:{data:{full_name:name}}});if(error){setError(error.message);setLoading(false);}else setDone(true);};
  if(done)return(<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4"><div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center max-w-sm"><Sparkles className="h-8 w-8 text-emerald-400 mx-auto mb-3" /><h1 className="text-lg font-bold text-white">Check your email</h1><p className="mt-1 text-sm text-zinc-500">Confirmation sent to {email}</p><Link href="/auth/login" className="mt-3 inline-block text-sm text-emerald-400">Back to sign in</Link></div></div>);
  return(<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4"><div className="w-full max-w-sm">
    <div className="text-center mb-8"><div className="inline-flex h-10 w-10 rounded-xl items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600 mb-4"><Sparkles className="h-5 w-5 text-white" /></div><h1 className="text-xl font-bold text-white">Create account</h1><p className="mt-1 text-sm text-zinc-500">Start your job search</p></div>
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
      <form onSubmit={handle} className="space-y-3.5">
        <div><label className="label">Full Name</label><input type="text" value={name} onChange={e=>setName(e.target.value)} required className="inp" /></div>
        <div><label className="label">Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="inp" /></div>
        <div><label className="label">Password</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} required minLength={6} className="inp" /></div>
        {error&&<p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">{error}</p>}
        <button type="submit" disabled={loading} className="w-full text-sm font-semibold text-black bg-emerald-400 hover:bg-emerald-300 rounded-lg py-2.5 flex items-center justify-center gap-2 transition">{loading&&<Loader2 className="h-4 w-4 animate-spin"/>}Create account</button>
      </form>
    </div>
    <p className="mt-5 text-center text-sm text-zinc-600">Have an account? <Link href="/auth/login" className="text-emerald-400 font-medium hover:text-emerald-300">Sign in</Link></p>
  </div></div>);
}
