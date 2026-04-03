'use client';
import { useState } from 'react';
import { useTracker, Stage } from '@/hooks/useTracker';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const STAGES: { key: Stage; label: string; color: string; dot: string }[] = [
  { key: 'saved', label: 'Saved', color: 'text-[#8e90a2]', dot: 'bg-[#434656]' },
  { key: 'applied', label: 'Applied', color: 'text-[#bbc3ff]', dot: 'bg-[#bbc3ff]' },
  { key: 'screening', label: 'Screening', color: 'text-[#00daf3]', dot: 'bg-[#00daf3]' },
  { key: 'interview', label: 'Interview', color: 'text-[#cdbdff]', dot: 'bg-[#cdbdff]' },
  { key: 'offer', label: 'Offer', color: 'text-[#00daf3]', dot: 'bg-green-400' },
  { key: 'rejected', label: 'Rejected', color: 'text-[#ffb4ab]', dot: 'bg-[#ffb4ab]' },
];

export default function TrackerPage() {
  const tracker = useTracker();
  const [showModal, setShowModal] = useState(false);
  const [editCard, setEditCard] = useState<any>(null);
  const [form, setForm] = useState({ title: '', company: '', url: '', location: '', salary: '', stage: 'saved' as Stage });

  const openNew = () => { setForm({ title: '', company: '', url: '', location: '', salary: '', stage: 'saved' }); setEditCard(null); setShowModal(true); };
  const openEdit = (card: any) => { setForm({ title: card.title, company: card.company, url: card.url || '', location: card.location || '', salary: card.salary || '', stage: card.stage }); setEditCard(card); setShowModal(true); };
  const save = () => { if (!form.title.trim() || !form.company.trim()) { toast.error('Title & company required'); return; } if (editCard) { tracker.moveCard(editCard.id, form.stage); } else { tracker.saveJob(form); } setShowModal(false); toast.success(editCard ? 'Updated' : 'Added'); };
  const del = () => { if (editCard) { tracker.removeCard(editCard.id); setShowModal(false); toast.success('Deleted'); } };

  const exportCSV = () => {
    const csv = 'Title,Company,Stage,Location,Salary,URL\n' + tracker.cards.map(c => `"${c.title}","${c.company}","${c.stage}","${c.location||''}","${c.salary||''}","${c.url||''}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'applications.csv'; a.click();
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <span className="text-[#cdbdff] text-[10px] tracking-[0.2em] uppercase font-bold mb-2 block">Application Lifecycle</span>
          <h2 className="text-4xl font-extrabold tracking-tighter">Active <span className="text-[#bbc3ff]">Tracker</span></h2>
          <p className="mt-2 text-[#c4c5d9] text-sm max-w-lg">Manage your career trajectory with real-time stage visualization.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="kinetic-btn-ghost px-5 py-2.5 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-sm">download</span>Export CSV</button>
          <button onClick={openNew} className="kinetic-btn px-6 py-2.5 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-sm">add</span>Add Application</button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto flex gap-5 pb-6 items-start" style={{scrollbarWidth:'thin'}}>
        {STAGES.map(stage => {
          const stageCards = tracker.cards.filter(c => c.stage === stage.key);
          return (
            <div key={stage.key} className={`min-w-[310px] max-w-[310px] rounded-3xl p-4 flex flex-col gap-3 ${stage.key==='rejected'?'opacity-60 hover:opacity-100 transition-all':''}`} style={{background:'rgba(29,32,38,0.4)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,0.03)'}}>
              <div className="flex items-center justify-between px-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
                  <h3 className={`text-sm font-bold uppercase tracking-widest ${stage.color}`}>{stage.label}</h3>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${stage.color}`} style={{background:'rgba(255,255,255,0.05)'}}>{stageCards.length}</span>
              </div>
              {stageCards.map(card => (
                <div key={card.id} onClick={() => openEdit(card)} className="p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:bg-white/[0.06] group" style={{background:'rgba(255,255,255,0.03)',backdropFilter:'blur(16px)',border:'1px solid rgba(255,255,255,0.1)',boxShadow:'0 4px 24px -1px rgba(0,0,0,0.2)'}}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                      <span className="material-symbols-outlined text-[#bbc3ff] text-lg">apartment</span>
                    </div>
                    {card.match_score && <div className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#cdbdff]" style={{background:'rgba(82,3,213,0.3)',border:'1px solid rgba(205,189,255,0.4)',boxShadow:'0 0 15px rgba(205,189,255,0.2)'}}>{card.match_score} ATS</div>}
                  </div>
                  <h4 className="font-bold text-sm text-[#e1e2eb] leading-tight group-hover:text-[#bbc3ff] transition-colors">{card.title}</h4>
                  <p className="text-[#c4c5d9] text-xs mt-1">{card.company}{card.location ? ` • ${card.location}` : ''}</p>
                  {card.salary && <p className="text-xs text-[#8e90a2] mt-1">{card.salary}</p>}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]" onClick={() => setShowModal(false)}>
          <div className="glass-card rounded-3xl p-8 w-[440px] max-w-[90vw]" onClick={e => e.stopPropagation()} style={{boxShadow:'0 25px 60px rgba(0,0,0,0.5)'}}>
            <h3 className="text-xl font-bold mb-6">{editCard ? 'Edit Application' : 'Add Application'}</h3>
            <div className="space-y-4">
              <div><label className="kinetic-label">Job Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="kinetic-input" placeholder="e.g. Senior Engineer" /></div>
              <div><label className="kinetic-label">Company</label><input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="kinetic-input" placeholder="e.g. Google" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="kinetic-label">Location</label><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="kinetic-input" placeholder="Remote" /></div>
                <div><label className="kinetic-label">Salary</label><input value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} className="kinetic-input" placeholder="$150k" /></div>
              </div>
              <div><label className="kinetic-label">Stage</label>
                <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value as Stage })} className="kinetic-input">
                  {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <div><label className="kinetic-label">URL</label><input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className="kinetic-input" placeholder="https://..." /></div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={save} className="kinetic-btn flex-1 py-3">Save</button>
              {editCard && <button onClick={del} className="px-6 py-3 rounded-xl text-sm font-bold text-[#ffb4ab] bg-[#93000a]/10 border border-[#ffb4ab]/20 hover:bg-[#93000a]/20 transition-all">Delete</button>}
              <button onClick={() => setShowModal(false)} className="kinetic-btn-ghost px-6 py-3">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
