export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'#10131a'}}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#3c59fd] flex items-center justify-center animate-pulse">
          <span className="material-symbols-outlined text-white" style={{fontVariationSettings:"'FILL' 1"}}>rocket_launch</span>
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-[#bbc3ff] animate-bounce" style={{animationDelay:'0s'}} />
          <div className="w-2 h-2 rounded-full bg-[#cdbdff] animate-bounce" style={{animationDelay:'0.15s'}} />
          <div className="w-2 h-2 rounded-full bg-[#00daf3] animate-bounce" style={{animationDelay:'0.3s'}} />
        </div>
      </div>
    </div>
  );
}
