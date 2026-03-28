import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Toaster } from 'sonner';
export const metadata: Metadata = { title: 'JobSeeker Pro', description: 'AI-powered career platform' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="bottom-center"
          theme="dark"
          richColors
          toastOptions={{
            style: {
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontFamily: 'inherit',
              background: 'rgba(14, 16, 22, 0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--separator)',
              color: 'var(--text-primary)',
            },
          }}
        />
      </body>
    </html>
  );
}
