'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState('');
  const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const [done, setDone] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    if (error) { setError(error.message); setLoading(false); } else setDone(true);
  };

  if (done) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center"><h1 className="text-xl font-bold text-zinc-100">Check your email</h1><p className="mt-2 text-sm text-zinc-500">We sent a confirmation link to {email}</p><Link href="/auth/login" className="mt-4 inline-block text-sm text-indigo-400 hover:text-indigo-300">Back to login</Link></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-zinc-100 text-center">Create account</h1>
        <p className="mt-2 text-sm text-zinc-500 text-center">Get started with JobSeeker Pro</p>
        <form onSubmit={handleSignup} className="mt-8 space-y-4">
          <div><label className="block text-xs font-medium text-zinc-400 mb-1.5">Full Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none" /></div>
          <div><label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none" /></div>
          <div><label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none" /></div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition flex items-center justify-center gap-2">{loading && <Loader2 className="h-4 w-4 animate-spin" />}Create account</button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-600">Have an account? <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link></p>
      </div>
    </div>
  );
}
