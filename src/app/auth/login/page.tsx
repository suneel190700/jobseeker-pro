'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); } else router.push('/dashboard');
  };

  const handleGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/api/auth/callback` } });
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-zinc-100 text-center">Welcome back</h1>
        <p className="mt-2 text-sm text-zinc-500 text-center">Sign in to your account</p>
        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <div><label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none" /></div>
          <div><label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none" /></div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition flex items-center justify-center gap-2">{loading && <Loader2 className="h-4 w-4 animate-spin" />}Sign in</button>
        </form>
        <div className="mt-4"><button onClick={handleGoogle} className="w-full rounded-lg border border-zinc-800 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition">Continue with Google</button></div>
        <p className="mt-6 text-center text-sm text-zinc-600">No account? <Link href="/auth/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign up</Link></p>
      </div>
    </div>
  );
}
