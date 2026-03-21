'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
export default function SignupPage() {
  const [email,setEmail]=useState('');const [pw,setPw]=useState('');const [name,setName]=useState('');const [loading,setLoading]=useState(false);const [error,setError]=useState('');const [done,setDone]=useState(false);
  const handle=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);setError('');const s=createClient();const{error}=await s.auth.signUp({email,password:pw,options:{data:{full_name:name}}});if(error){setError(error.message);setLoading(false);}else setDone(true);};
  if(done)return(<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4"><div className="text-center bg-white rounded-xl shadow-lg p-8"><h1 className="text-xl font-bold text-gray-900">Check your email</h1><p className="mt-2 text-sm text-gray-500">Confirmation link sent to {email}</p><Link href="/auth/login" className="mt-4 inline-block text-sm text-brand-600 font-semibold hover:underline">Back to sign in</Link></div></div>);
  return(<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4"><div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8">
    <h1 className="text-2xl font-bold text-gray-900 text-center">Join JobSeeker Pro</h1><p className="mt-1 text-sm text-gray-500 text-center">Start your job search journey</p>
    <form onSubmit={handle} className="mt-6 space-y-4">
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" value={name} onChange={e=>setName(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none" /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none" /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} required minLength={6} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none" /></div>
      {error&&<p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="w-full rounded-full bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition flex items-center justify-center gap-2">{loading&&<Loader2 className="h-4 w-4 animate-spin"/>}Join</button>
    </form>
    <p className="mt-6 text-center text-sm text-gray-500">Already have an account? <Link href="/auth/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link></p>
  </div></div>);
}
