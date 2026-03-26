import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Toaster } from 'sonner';
export const metadata: Metadata = { title: 'JobSeeker Pro', description: 'AI-powered career platform' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" className="dark"><body>{children}<Toaster position="bottom-right" theme="dark" richColors toastOptions={{style:{borderRadius:'10px',fontSize:'13px',background:'#18181b',border:'1px solid #27272a'}}} /></body></html>);
}
