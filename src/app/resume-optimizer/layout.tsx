import TopNav from '@/components/layout/TopNav';
export default function Layout({ children }: { children: React.ReactNode }) {
  return (<div className="min-h-screen bg-bg-0"><TopNav /><main className="mx-auto max-w-[1200px] px-6 py-6">{children}</main></div>);
}
