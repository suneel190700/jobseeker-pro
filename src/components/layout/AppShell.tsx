import TopNav from './TopNav';

/** Matches TopNav inner width for edge-aligned content */
export const APP_CONTENT_MAX = 'max-w-[1280px]';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <TopNav />
      <main className={`mx-auto ${APP_CONTENT_MAX} px-5 py-8`}>{children}</main>
    </div>
  );
}
