'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Shield } from 'lucide-react';
import AuthShell from '@/components/layout/AuthShell';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const r = useRouter();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'login', email, password: pw }) });
    const d = await res.json();
    if (d.success) {
      localStorage.setItem('admin_token', d.token);
      r.push('/admin');
    } else {
      setError('Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="text-center mb-6">
        <div className="inline-flex h-12 w-12 rounded-[12px] items-center justify-center mx-auto mb-3" style={{ background: 'var(--surface-2)' }}>
          <Shield className="h-6 w-6" style={{ color: 'var(--accent)' }} />
        </div>
        <h1 className="title-3 text-[var(--text-primary)]">Admin Access</h1>
      </div>
      <div className="surface-elevated p-6 vibrancy" style={{ borderColor: 'var(--separator)' }}>
        <form onSubmit={handle} className="space-y-3.5">
          <div>
            <label className="input-label" htmlFor="admin-email">Email</label>
            <input id="admin-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-hig" />
          </div>
          <div>
            <label className="input-label" htmlFor="admin-pw">Password</label>
            <input id="admin-pw" type="password" value={pw} onChange={e => setPw(e.target.value)} required className="input-hig" />
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
      </div>
    </AuthShell>
  );
}
