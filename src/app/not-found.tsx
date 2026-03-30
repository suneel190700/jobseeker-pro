import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'#10131a'}}>
      <div className="text-center space-y-6">
        <div className="text-[120px] font-black text-white/[0.03] leading-none">404</div>
        <h1 className="text-3xl font-bold text-[#e1e2eb] -mt-16 relative z-10">Page not found</h1>
        <p className="text-[#c4c5d9] max-w-md mx-auto">The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/" className="kinetic-btn inline-flex px-8 py-3">Back to Home</Link>
      </div>
    </div>
  );
}
