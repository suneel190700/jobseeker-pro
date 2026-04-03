import Sidebar from '@/components/layout/Sidebar';
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#10131a' }}>
      <Sidebar />
      <main className="md:ml-56 pt-16 min-h-screen">
        <div className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
