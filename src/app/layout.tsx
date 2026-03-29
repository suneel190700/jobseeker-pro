import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Toaster } from 'sonner';
export const metadata: Metadata = { title: 'JobSeeker Pro', description: 'AI-powered career platform' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}<Toaster position="bottom-center" theme="dark" richColors toastOptions={{style:{borderRadius:'14px',fontSize:'15px',background:'rgba(30,30,30,0.9)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.08)'}}} /></body></html>);
}
