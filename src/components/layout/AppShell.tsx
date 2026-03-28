import { BrainCircuit, ChevronRight, Sparkles } from 'lucide-react';
import TopNav from './TopNav';
import { APP_CONTENT_MAX } from './constants';
export { APP_CONTENT_MAX };

const insights = [
  { tone: 'cyan', title: 'Resume drift detected', body: 'Missing a few hard-skill matches against stronger job targets. Prioritize ATS tuning next.' },
  { tone: 'violet', title: 'Application timing window', body: 'Roles posted in the last 24 hours are most likely to reward immediate application.' },
  { tone: 'green', title: 'Interview momentum', body: 'Structured mock sessions can tighten delivery before recruiter screens.' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-root">
      <div className="app-ambient" aria-hidden />
      <TopNav />
      <main className="relative z-[1] px-4 pb-8 pt-6 sm:px-6 xl:ml-[84px] xl:px-8 xl:pt-8">
        <div className={`mx-auto ${APP_CONTENT_MAX}`}>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
            <div className="min-w-0">{children}</div>
            <aside className="hidden xl:block">
              <div className="sticky top-[98px] space-y-4">
                <div className="premium-panel overflow-hidden p-5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,194,255,0.12),transparent_26%),radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.12),transparent_24%)]" />
                  <div className="relative">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200"><BrainCircuit className="h-5 w-5" /></div>
                      <div><p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/32">AI feed</p><p className="text-sm font-semibold text-white">Persistent insights</p></div>
                    </div>
                    <div className="space-y-3">
                      {insights.map((item, idx) => (
                        <div key={idx} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <div className={['h-2.5 w-2.5 rounded-full', item.tone === 'cyan' ? 'bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.7)]' : item.tone === 'violet' ? 'bg-violet-300 shadow-[0_0_16px_rgba(167,139,250,0.7)]' : 'bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.7)]'].join(' ')} />
                            <p className="text-sm font-semibold text-white">{item.title}</p>
                          </div>
                          <p className="text-sm leading-6 text-white/58">{item.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="premium-card p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div><p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/32">System status</p><p className="text-sm font-semibold text-white">Command center health</p></div>
                    <Sparkles className="h-4 w-4 text-cyan-300" />
                  </div>
                  <div className="space-y-3">
                    {[['Resume engine', 'Operational'], ['Jobs intelligence', 'Live'], ['Tracker sync', 'Stable']].map(([label, status]) => (
                      <div key={label} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm"><span className="text-white/62">{label}</span><span className="flex items-center gap-2 font-medium text-white"><span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.65)]" />{status}</span></div>
                    ))}
                  </div>
                  <button type="button" className="mt-4 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/80 transition hover:border-cyan-400/20 hover:bg-cyan-400/8">Open command palette<ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
