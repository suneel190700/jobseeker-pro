'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Sparkles } from 'lucide-react';
import AuthShell from '@/components/layout/AuthShell';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const r = useRouter();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const s = createClient();
    const { error } = await s.auth.signInWithPassword({ email, password: pw });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      r.push('/dashboard');
    }
  };

  const google = async () => {
    const s = createClient();
    await s.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/api/auth/callback` } });
  };

  return (
    <AuthShell>
      <div className="text-center mb-8">
        <div
          className="inline-flex h-10 w-10 rounded-[10px] items-center justify-center mb-4"
          style={{ background: 'var(--accent)' }}
        >
          <Sparkles className="h-5 w-5 text-[var(--text-primary)]" />
        </div>
        <h1 className="title-3 text-[var(--text-primary)]">Welcome back</h1>
        <p className="subhead mt-1">Sign in to continue</p>
      </div>
      <div className="surface-elevated p-6 vibrancy" style={{ borderColor: 'var(--separator)' }}>
        <form onSubmit={handle} className="space-y-3.5">
          <div>
            <label className="input-label" htmlFor="login-email">Email</label>
            <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-hig" placeholder="you@email.com" />
          </div>
          <div>
            <label className="input-label" htmlFor="login-pw">Password</label>
            <input id="login-pw" type="password" value={pw} onChange={e => setPw(e.target.value)} required className="input-hig" />
          </div>
          {error && (
            <p className="footnote rounded-[12px] p-2.5 border" style={{ color: 'var(--destructive)', background: 'rgba(255,69,58,0.08)', borderColor: 'rgba(255,69,58,0.2)' }}>
              {error}
            </p>
          )}
          <button type="submit" disabled={loading} className="btn-filled w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>
        </form>
        <div className="mt-3">
          <button type="button" onClick={google} className="btn-gray w-full">
            Continue with Google
          </button>
        </div>
      </div>
      <p className="mt-5 text-center subhead">
        No account?{' '}
        <Link href="/auth/signup" className="font-medium" style={{ color: 'var(--accent)' }}>
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}
