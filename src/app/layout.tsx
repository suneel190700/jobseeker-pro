import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'JobSeeker Pro — Land Your Next Role',
  description:
    'AI-powered resume optimization, job matching, and application tracking for US job seekers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white font-sans" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
