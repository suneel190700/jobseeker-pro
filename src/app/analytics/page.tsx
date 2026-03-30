'use client';
import { useState } from 'react';
import { BarChart3, TrendingUp, Clock, Target, ArrowRight, Zap, FileText, Calendar, ChevronDown } from 'lucide-react';
import { useTracker } from '@/hooks/useTracker';

const bestTimes = [
  { day: 'Monday', time: '9-11 AM', score: 72, note: 'Hiring managers review over weekend' },
  { day: 'Tuesday', time: '8-10 AM', score: 95, note: 'Best day — highest open rates' },
  { day: 'Wednesday', time: '9-11 AM', score: 88, note: 'Strong mid-week momentum' },
  { day: 'Thursday', time: '10 AM-12 PM', score: 80, note: 'Good but less than Tue/Wed' },
  { day: 'Friday', time: '8-9 AM', score: 45, note: 'Avoid afternoon — weekend mode' },
  { day: 'Saturday', time: 'Avoid', score: 15, note: 'Very low recruiter activity' },
  { day: 'Sunday', time: '8 PM', score: 35, note: 'Queue for Monday morning review' },
];

export default function AnalyticsPage() {
  const tracker = useTracker();
  const [abTab, setAbTab] = useState<'info'|'active'>('info');

  const stages = ['saved','applied','screening','interview','offer','rejected'];
  const stageCounts = stages.map(s => ({ stage: s, count: tracker.cards.filter(c => c.stage === s).length }));
  const total = tracker.cards.length;
  const applied = tracker.cards.filter(c => c.stage !== 'saved').length;
  const interviews = tracker.cards.filter(c => c.stage === 'interview' || c.stage === 'offer').length;
  const offers = tracker.cards.filter(c => c.stage === 'offer').length;

  const benchmarks = { screening: 15, interview: 8, offer: 3 };
  const myRates = {
    screening: applied > 0 ? Math.round((tracker.cards.filter(c => ['screening','interview','offer'].includes(c.stage)).length / applied) * 100) : 0,
    interview: applied > 0 ? Math.round((interviews / applied) * 100) : 0,
    offer: applied > 0 ? Math.round((offers / applied) * 100) : 0,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#e1e2eb] tracking-tight">Analytics</h1>
      <p className="mt-1 text-sm text-[#434656]">Application funnel, timing insights & resume testing</p>

      {/* Funnel */}
      <div className="mt-6 surface p-6">
        <h2 className="text-sm font-bold text-[#c4c5d9] flex items-center gap-2"><BarChart3 className="h-4 w-4 text-[#00daf3]" />Application Funnel</h2>
        <div className="mt-4 flex items-end gap-3">
          {stageCounts.map((s, i) => {
            const maxC = Math.max(...stageCounts.map(x => x.count), 1);
            const h = Math.max((s.count / maxC) * 140, 8);
            const colors: Record<string,string> = { saved:'bg-gray-300', applied:'bg-blue-400', screening:'bg-brand-400', interview:'bg-[#5203d5]/100', offer:'bg-[#007886]/100', rejected:'bg-red-400' };
            return (
              <div key={s.stage} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs font-bold text-[#c4c5d9]">{s.count}</span>
                <div className={`w-full rounded-[16px] ${colors[s.stage] || 'bg-gray-300'} transition-all`} style={{ height: `${h}px` }} />
                <span className="text-[10px] font-semibold text-[#434656] capitalize">{s.stage}</span>
              </div>
            );
          })}
        </div>
        {applied > 0 && (
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[{label:'Screen Rate',mine:myRates.screening,bench:benchmarks.screening},{label:'Interview Rate',mine:myRates.interview,bench:benchmarks.interview},{label:'Offer Rate',mine:myRates.offer,bench:benchmarks.offer}].map(r => (
              <div key={r.label} className="bg-[var(--surface-1)] rounded-2xl p-3">
                <p className="text-[10px] font-semibold text-[#434656] uppercase">{r.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-xl font-bold ${r.mine >= r.bench ? 'text-[#00daf3]' : 'text-[#cdbdff]'}`}>{r.mine}%</span>
                  <span className="text-xs text-[#434656]">vs {r.bench}% avg</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {applied === 0 && <p className="mt-4 text-sm text-[#434656] text-center py-4">Start tracking applications to see your funnel analytics</p>}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-5">
        {/* Timing Optimizer */}
        <div className="surface p-6">
          <h2 className="text-sm font-bold text-[#c4c5d9] flex items-center gap-2"><Clock className="h-4 w-4 text-violet-500" />Best Time to Apply</h2>
          <p className="text-xs text-[#434656] mt-1">Based on recruiter activity patterns</p>
          <div className="mt-4 space-y-2">
            {bestTimes.map(t => (
              <div key={t.day} className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[#c4c5d9] w-16">{t.day.slice(0, 3)}</span>
                <div className="flex-1 bg-[var(--surface-2)] rounded-full h-5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${t.score >= 80 ? 'bg-emerald-400' : t.score >= 50 ? 'bg-amber-400' : 'bg-red-300'}`} style={{ width: `${t.score}%` }} />
                </div>
                <span className="text-[10px] text-[#8e90a2] w-20 text-right">{t.time}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-[#007886]/10 rounded-2xl p-3 border border-[#30d158]/20">
            <p className="text-xs font-semibold text-[#00daf3]">💡 Optimal: Tuesday–Wednesday, 8–10 AM local time</p>
          </div>
        </div>

        {/* Resume A/B Testing */}
        <div className="surface p-6">
          <h2 className="text-sm font-bold text-[#c4c5d9] flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500" />Resume A/B Testing</h2>
          <p className="text-xs text-[#434656] mt-1">Track which resume version performs better</p>
          <div className="mt-4 bg-[var(--surface-1)] rounded-2xl p-4 text-center">
            <Zap className="h-8 w-8 text-[#434656] mx-auto" />
            <p className="mt-2 text-sm font-semibold text-[#c4c5d9]">Coming Soon</p>
            <p className="text-xs text-[#434656] mt-1">Generate 2 resume versions for a job, track which gets more callbacks. Assign versions A/B in tracker.</p>
            <div className="mt-3 flex gap-2 justify-center">
              <div className="pill bg-[#3c59fd]/10 text-[#bbc3ff] border border-[#0a84ff]/20">Version A</div>
              <span className="text-xs text-[#434656] self-center">vs</span>
              <div className="pill bg-purple-500/10 text-purple-400 border border-purple-500/20">Version B</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
