export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-root min-h-screen flex items-center justify-center px-4 py-12">
      <div className="app-ambient" aria-hidden />
      <div className="relative z-[1] w-full max-w-sm">{children}</div>
    </div>
  );
}
