import Sidebar from '@/components/layout/Sidebar';
export default function Layout({ children }: { children: React.ReactNode }) {
  return (<div className="min-h-screen" style={{ background: '#10131a' }}><Sidebar /><main className="md:ml-64 pt-14 md:pt-0 min-h-screen"><div className="px-6 md:px-8 py-8 max-w-[1400px] mx-auto">{children}</div></main></div>);
}
