'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Loader2, Sparkles } from 'lucide-react';
import AuthShell from '@/components/layout/AuthShell';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const s = createClient();
    const { error } = await s.auth.signUp({ email, password: pw, options: { data: { full_name: name } } });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <AuthShell>
        <div className="surface-elevated p-6 text-center vibrancy" style={{ borderColor: 'var(--separator)' }}>
          <Sparkles className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--accent)' }} />
          <h1 className="title-3 text-white">Check your email</h1>
          <p className="subhead mt-1">Confirmation sent to {email}</p>
          <Link href="/auth/login" className="mt-4 inline-block btn-plain font-medium">
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="text-center mb-8">
        <div className="inline-flex h-10 w-10 rounded-[10px] items-center justify-center mb-4" style={{ background: 'var(--accent)' }}>
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <h1 className="title-3 text-white">Create account</h1>
        <p className="subhead mt-1">Start your job search</p>
      </div>
      <div className="surface-elevated p-6 vibrancy" style={{ borderColor: 'var(--separator)' }}>
        <form onSubmit={handle} className="space-y-3.5">
          <div>
            <label className="input-label" htmlFor="signup-name">Full Name</label>
            <input id="signup-name" type="text" value={name} onChange={e => setName(e.target.value)} required className="input-hig" />
          </div>
          <div>
            <label className="input-label" htmlFor="signup-email">Email</label>
            <input id="signup-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-hig" />
          </div>
          <div>
            <label className="input-label" htmlFor="signup-pw">Password</label>
            <input id="signup-pw" type="password" value={pw} onChange={e => setPw(e.target.value)} required minLength={6} className="input-hig" />
          </div>
          {error && (
            <p className="footnote rounded-[12px] p-2.5 border" style={{ color: 'var(--destructive)', background: 'rgba(255,69,58,0.08)', borderColor: 'rgba(255,69,58,0.2)' }}>
              {error}
            </p>
          )}
          <button type="submit" disabled={loading} className="btn-filled w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Create account
          </button>
        </form>
      </div>
      <p className="mt-5 text-center subhead">
        Have an account?{' '}
        <Link href="/auth/login" className="font-medium" style={{ color: 'var(--accent)' }}>
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
