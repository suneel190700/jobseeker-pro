import Sidebar from '@/components/layout/Sidebar';
export default function Layout({ children }: { children: React.ReactNode }) {
  return (<div className="flex h-screen overflow-hidden bg-[#f3f2ef]"><Sidebar /><main className="flex-1 overflow-y-auto"><div className="mx-auto max-w-5xl px-6 py-6">{children}</div></main></div>);
}
