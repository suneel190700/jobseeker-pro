'use client';
export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'#10131a'}}>
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#93000a]/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-[#ffb4ab] text-3xl">error</span>
        </div>
        <h1 className="text-3xl font-bold text-[#e1e2eb]">Something went wrong</h1>
        <p className="text-[#c4c5d9] max-w-md mx-auto text-sm">{error.message || 'An unexpected error occurred.'}</p>
        <button onClick={reset} className="kinetic-btn px-8 py-3">Try Again</button>
      </div>
    </div>
  );
}
