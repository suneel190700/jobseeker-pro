import TopNav from './TopNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-root">
      <div className="premium-shell">
        <TopNav />
        <main className="mx-auto max-w-[1480px] px-4 pb-8 pt-6 sm:px-6 xl:px-8">
          <div className="grid gap-6 lg:grid-cols-[84px_minmax(0,1fr)]">
            <div className="hidden lg:block" />
            <div>{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
