import '@/styles/globals.css';
import { Toaster } from 'sonner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JobSeeker Pro — AI Career Suite',
  description: 'AI-powered resume optimization, job matching across 323K+ sources, voice mock interviews, and smart networking tools. Land your dream job with precision.',
  keywords: ['AI resume', 'ATS optimization', 'job search', 'mock interview', 'career tools', 'resume builder'],
  authors: [{ name: 'JobSeeker Pro' }],
  openGraph: {
    title: 'JobSeeker Pro — AI Career Suite',
    description: 'AI-driven resume optimization, mock interviews, and job matching. 323K+ sources. 95+ ATS scores.',
    type: 'website',
    siteName: 'JobSeeker Pro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JobSeeker Pro — AI Career Suite',
    description: 'Land your dream job with AI precision.',
  },
};

import CommandPalette from '@/components/layout/CommandPalette';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <CommandPalette />
        <Toaster position="bottom-right" theme="dark" richColors toastOptions={{ style: { background: '#1d2026', border: '1px solid rgba(255,255,255,0.08)', color: '#e1e2eb' } }} />
      </body>
    </html>
  );
}
