'use client';

import { useState } from 'react';
import {
  Plus, GripVertical, MoreHorizontal, X, Trash2,
  Calendar, StickyNote, ExternalLink, MapPin,
} from 'lucide-react';
import { useTracker } from '@/hooks/useTracker';
type Stage = string;
type AppCard = { id: string; title: string; company: string; stage: string; date: string; url: string; location: string; salary: string; notes: string; match_score?: number; };

const STAGES: { key: Stage; label: string; color: string }[] = [
  { key: 'saved', label: 'Saved', color: 'bg-[var(--surface-1)] text-white/70' },
  { key: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-700' },
  { key: 'screening', label: 'Screening', color: 'bg-amber-100 text-[#ff9f0a]' },
  { key: 'interview', label: 'Interview', color: 'bg-purple-100 text-purple-400' },
  { key: 'offer', label: 'Offer', color: 'bg-green-100 text-green-400' },
  { key: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
];

export default function TrackerPage() {
  const tracker = useTracker();
  const [showModal, setShowModal] = useState(false);
  const [editCard, setEditCard] = useState<AppCard | null>(null);
  const [dragCard, setDragCard] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null);
  const [form, setForm] = useState({ company: '', title: '', stage: 'saved' as Stage, date: '', notes: '', url: '', location: '', salary: '' });

  const openAdd = () => {
    setForm({ company: '', title: '', stage: 'saved', date: new Date().toISOString().split('T')[0], notes: '', url: '', location: '', salary: '' });
    setEditCard(null);
    setShowModal(true);
  };

  const openEdit = (card: AppCard) => {
    setForm({ company: card.company, title: card.title, stage: card.stage, date: card.date, notes: card.notes, url: card.url, location: card.location || '', salary: card.salary || '' });
    setEditCard(card);
    setShowModal(true);
  };

  const saveCard = () => {
    if (!form.company.trim() || !form.title.trim()) return;
    if (editCard) {
      tracker.editCard(editCard.id, form);
    } else {
      tracker.addCard(form);
    }
    setShowModal(false);
  };

  const handleDragStart = (id: string) => setDragCard(id);
  const handleDragOver = (e: React.DragEvent, stage: Stage) => { e.preventDefault(); setDragOverStage(stage); };
  const handleDragLeave = () => setDragOverStage(null);
  const handleDrop = (stage: Stage) => {
    if (dragCard) { tracker.moveCard(dragCard, stage); setDragCard(null); setDragOverStage(null); }
  };
  const handleDragEnd = () => { setDragCard(null); setDragOverStage(null); };

  const getCardsForStage = (stage: Stage) => tracker.cards.filter((c) => c.stage === stage);

  if (!tracker.loaded) {
    return <div className="flex items-center justify-center py-20 text-sm text-white/25">Loading tracker...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white/90">Application Tracker</h1>
          <p className="mt-1 text-sm text-white/35">Drag cards between columns to update status. {tracker.cards.length} application{tracker.cards.length !== 1 ? 's' : ''}.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white/90 hover:bg-brand-700 transition">
          <Plus className="h-4 w-4" /> Add Application
        </button>
      </div>

      {/* Kanban */}
      <div className="mt-6 flex gap-3 overflow-x-auto pb-4">
        {STAGES.map(({ key, label, color }) => {
          const stageCards = getCardsForStage(key);
          const isOver = dragOverStage === key;
          return (
            <div
              key={key}
              onDragOver={(e) => handleDragOver(e, key)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(key)}
              className={['flex w-64 flex-shrink-0 flex-col rounded-2xl p-2.5 transition-colors min-h-[300px]', isOver ? 'bg-[#30d158]/10 ring-2 ring-brand-200' : 'bg-[var(--surface-1)]'].join(' ')}
            >
              <div className="flex items-center justify-between px-1 pb-2">
                <div className="flex items-center gap-2">
                  <span className={['inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', color].join(' ')}>{label}</span>
                  <span className="text-xs text-white/25 font-medium">{stageCards.length}</span>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                {stageCards.length === 0 ? (
                  <div className={['flex items-center justify-center py-10 text-xs rounded-2xl border-2 border-dashed transition-colors', isOver ? 'border-emerald-500/30 text-emerald-300' : 'border-transparent text-white/25'].join(' ')}>
                    {isOver ? 'Drop here' : 'No applications'}
                  </div>
                ) : (
                  stageCards.map((card) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card.id)}
                      onDragEnd={handleDragEnd}
                      className={['cursor-grab active:cursor-grabbing rounded-2xl border bg-[var(--surface-1)] p-3 shadow-sm hover:shadow-md transition', dragCard === card.id ? 'opacity-50 border-emerald-500/30' : 'border-[var(--separator)]'].join(' ')}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 min-w-0">
                          <GripVertical className="mt-0.5 h-3.5 w-3.5 text-white/25 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white/90 truncate">{card.company}</p>
                            <p className="text-xs text-white/35 truncate">{card.title}</p>
                          </div>
                        </div>
                        <button onClick={() => openEdit(card)} className="text-white/25 hover:text-white/35 flex-shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                      {card.location && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-white/25">
                          <MapPin className="h-3 w-3" /> {card.location}
                        </div>
                      )}
                      {card.date && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-white/25">
                          <Calendar className="h-3 w-3" /> {card.date}
                        </div>
                      )}
                      {card.notes && (
                        <div className="mt-1.5 flex items-start gap-1 text-[10px] text-white/25">
                          <StickyNote className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{card.notes}</span>
                        </div>
                      )}
                      {card.url && card.url !== '#' && (
                        <a href={card.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="mt-2 inline-flex items-center gap-1 text-[10px] text-[#30d158] hover:text-[#30d158]">
                          <ExternalLink className="h-3 w-3" /> View posting
                        </a>
                      )}
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {STAGES.filter((s) => s.key !== key).slice(0, 3).map((s) => (
                          <button key={s.key} onClick={() => tracker.moveCard(card.id, s.key)} className="rounded px-1.5 py-0.5 text-[9px] font-medium border border-[var(--separator)] text-white/25 hover:bg-[var(--surface-1)] transition truncate">
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-[var(--surface-1)] p-6 shadow-xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white/90">{editCard ? 'Edit Application' : 'Add Application'}</h2>
              <button onClick={() => setShowModal(false)} className="text-white/25 hover:text-white/50"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Company *</label>
                <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. Google" className="input-hig" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Job Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior ML Engineer" className="input-hig" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Stage</label>
                  <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })} className="w-full rounded-2xl border border-[var(--separator)] px-3 py-2 text-sm">
                    {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-2xl border border-[var(--separator)] px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Job URL</label>
                <input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." className="input-hig" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Notes</label>
                <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Referral from..., interview prep notes..." className="input-hig" />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between">
              {editCard ? (
                <button onClick={() => { tracker.removeCard(editCard.id); setShowModal(false); }} className="flex items-center gap-1 text-sm text-[#ff453a] hover:text-red-700">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              ) : <div />}
              <div className="flex gap-2">
                <button onClick={() => setShowModal(false)} className="rounded-2xl border border-[var(--separator)] px-4 py-2 text-sm text-white/50 hover:bg-[var(--surface-1)]">Cancel</button>
                <button onClick={saveCard} disabled={!form.company.trim() || !form.title.trim()} className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-brand-700 disabled:opacity-50 transition">
                  {editCard ? 'Save Changes' : 'Add Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
