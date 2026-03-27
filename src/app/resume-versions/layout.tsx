import TopNav from '@/components/layout/TopNav';
export default function Layout({ children }: { children: React.ReactNode }) {
  return (<div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%)' }}><TopNav /><main className="mx-auto max-w-[1200px] px-6 py-6">{children}</main></div>);
}
