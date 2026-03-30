'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { error } = await createClient().auth.signInWithPassword({ email, password: pw });
    if (error) { toast.error(error.message); setLoading(false); } else router.push('/dashboard');
  };

  const handleGoogle = async () => {
    setGLoading(true);
    const { error } = await createClient().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/api/auth/callback` } });
    if (error) { toast.error(error.message); setGLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 mesh-gradient" style={{ background: '#10131a' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#3c59fd] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-white text-2xl" style={{fontVariationSettings:"'FILL' 1"}}>rocket_launch</span>
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-[#c4c5d9] text-sm mt-1">Sign in to continue</p>
        </div>
        <div className="glass-card rounded-3xl p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div><label className="kinetic-label">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="kinetic-input" placeholder="you@email.com" /></div>
            <div><label className="kinetic-label">Password</label><input type="password" value={pw} onChange={e => setPw(e.target.value)} required className="kinetic-input" /></div>
            <button type="submit" disabled={loading} className="kinetic-btn w-full py-3 flex items-center justify-center gap-2">{loading && <Loader2 className="h-4 w-4 animate-spin" />}Sign in</button>
          </form>
          <button onClick={handleGoogle} disabled={gLoading} className="kinetic-btn-ghost w-full py-3 mt-3 flex items-center justify-center gap-2">{gLoading && <Loader2 className="h-4 w-4 animate-spin" />}Continue with Google</button>
        </div>
        <p className="text-center text-sm text-[#c4c5d9] mt-6">No account? <Link href="/auth/signup" className="text-[#bbc3ff] font-bold hover:underline">Sign up</Link></p>
      </div>
    </div>
  );
}
