import { Sparkles } from 'lucide-react';

/**
 * Shown by Next.js `loading.tsx` while a route segment resolves.
 * `main` — inside AppShell `<main>` (nav stays visible).
 * `fullscreen` — whole viewport (marketing root, auth, or admin).
 */
type RouteLoadingVariant = 'main' | 'fullscreen' | 'admin';

export default function RouteLoading({ variant = 'main' }: { variant?: RouteLoadingVariant }) {
  const shell = (
    <div className="flex flex-col items-center justify-center gap-6 py-16 md:py-24" role="status" aria-live="polite" aria-busy="true">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span
          className="absolute inset-0 rounded-[var(--radius-md)] border-2 border-[var(--separator)] border-t-[var(--accent)] border-r-[var(--accent-secondary)] animate-spin"
          style={{ animationDuration: '0.85s' }}
        />
        <div
          className="relative flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] ring-1 ring-white/10"
          style={{ background: 'linear-gradient(145deg, var(--accent), var(--accent-secondary))' }}
        >
          <Sparkles className="h-4 w-4 text-[var(--bg-primary)]" strokeWidth={2.2} />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-[13px] font-semibold text-[var(--text-primary)] tracking-tight">Loading</p>
        <p className="text-[12px] text-[var(--text-tertiary)]">Preparing this page…</p>
      </div>
      {variant === 'main' && (
        <div className="w-full max-w-xl space-y-3 pt-2">
          <div className="skeleton h-8 w-2/3 max-w-sm rounded-[var(--radius-md)]" />
          <div className="skeleton h-4 w-full rounded-md opacity-70" />
          <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-3">
            <div className="skeleton h-24 rounded-[var(--radius-lg)]" />
            <div className="skeleton h-24 rounded-[var(--radius-lg)]" />
            <div className="skeleton hidden h-24 rounded-[var(--radius-lg)] sm:block" />
          </div>
        </div>
      )}
    </div>
  );

  if (variant === 'fullscreen') {
    return (
      <div className="app-root min-h-screen">
        <div className="app-ambient" aria-hidden />
        <div className="relative z-[1] flex min-h-screen flex-col items-center justify-center px-4">{shell}</div>
      </div>
    );
  }

  if (variant === 'admin') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
        {shell}
      </div>
    );
  }

  return shell;
}
