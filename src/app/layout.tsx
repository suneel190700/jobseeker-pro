import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Toaster } from 'sonner';
export const metadata: Metadata = { title: 'JobSeeker Pro', description: 'AI-powered job search platform' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><head><link rel="icon" href="/icon.svg" type="image/svg+xml" /></head><body>{children}<Toaster position="bottom-right" richColors /></body></html>);
}
