import TopNav from '@/components/layout/TopNav';
export default function Layout({ children }: { children: React.ReactNode }) {
  return (<div className="min-h-screen" style={{background:'var(--bg-primary)'}}><TopNav /><main className="mx-auto max-w-[1200px] px-5 py-8">{children}</main></div>);
}
