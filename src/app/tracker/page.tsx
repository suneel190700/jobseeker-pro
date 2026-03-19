'use client';

import { useState } from 'react';
import {
  Plus, GripVertical, MoreHorizontal, X, Trash2,
  ChevronRight, Calendar, Building2, StickyNote,
} from 'lucide-react';

type Stage = 'saved' | 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';

interface AppCard {
  id: string;
  company: string;
  title: string;
  stage: Stage;
  applied_date: string;
  notes: string;
  url: string;
}

const STAGES: { key: Stage; label: string; color: string }[] = [
  { key: 'saved', label: 'Saved', color: 'bg-slate-100 text-slate-700' },
  { key: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-700' },
  { key: 'screening', label: 'Screening', color: 'bg-amber-100 text-amber-700' },
  { key: 'interview', label: 'Interview', color: 'bg-purple-100 text-purple-700' },
  { key: 'offer', label: 'Offer', color: 'bg-green-100 text-green-700' },
  { key: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
];

export default function TrackerPage() {
  const [cards, setCards] = useState<AppCard[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editCard, setEditCard] = useState<AppCard | null>(null);
  const [dragCard, setDragCard] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null);

  // Form state
  const [form, setForm] = useState({ company: '', title: '', stage: 'saved' as Stage, applied_date: '', notes: '', url: '' });

  const openAdd = () => {
    setForm({ company: '', title: '', stage: 'saved', applied_date: new Date().toISOString().split('T')[0], notes: '', url: '' });
    setEditCard(null);
    setShowModal(true);
  };

  const openEdit = (card: AppCard) => {
    setForm({ company: card.company, title: card.title, stage: card.stage, applied_date: card.applied_date, notes: card.notes, url: card.url });
    setEditCard(card);
    setShowModal(true);
  };

  const saveCard = () => {
    if (!form.company.trim() || !form.title.trim()) return;
    if (editCard) {
      setCards((prev) => prev.map((c) => c.id === editCard.id ? { ...c, ...form } : c));
    } else {
      const newCard: AppCard = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ...form };
      setCards((prev) => [...prev, newCard]);
    }
    setShowModal(false);
  };

  const deleteCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    setShowModal(false);
  };

  const moveCard = (id: string, newStage: Stage) => {
    setCards((prev) => prev.map((c) => c.id === id ? { ...c, stage: newStage } : c));
  };

  // Drag handlers
  const handleDragStart = (id: string) => setDragCard(id);
  const handleDragOver = (e: React.DragEvent, stage: Stage) => { e.preventDefault(); setDragOverStage(stage); };
  const handleDragLeave = () => setDragOverStage(null);
  const handleDrop = (stage: Stage) => {
    if (dragCard) { moveCard(dragCard, stage); setDragCard(null); setDragOverStage(null); }
  };
  const handleDragEnd = () => { setDragCard(null); setDragOverStage(null); };

  const getCardsForStage = (stage: Stage) => cards.filter((c) => c.stage === stage);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Application Tracker</h1>
          <p className="mt-1 text-sm text-slate-500">Drag cards between columns to update status. {cards.length} application{cards.length !== 1 ? 's' : ''}.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition">
          <Plus className="h-4 w-4" /> Add Application
        </button>
      </div>

      {/* Kanban Board */}
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
              className={['flex w-64 flex-shrink-0 flex-col rounded-xl p-2.5 transition-colors min-h-[300px]', isOver ? 'bg-brand-50 ring-2 ring-brand-200' : 'bg-slate-50'].join(' ')}
            >
              <div className="flex items-center justify-between px-1 pb-2">
                <div className="flex items-center gap-2">
                  <span className={['inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', color].join(' ')}>{label}</span>
                  <span className="text-xs text-slate-400 font-medium">{stageCards.length}</span>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                {stageCards.length === 0 ? (
                  <div className={['flex items-center justify-center py-10 text-xs rounded-lg border-2 border-dashed transition-colors', isOver ? 'border-brand-300 text-brand-400' : 'border-transparent text-slate-300'].join(' ')}>
                    {isOver ? 'Drop here' : 'No applications'}
                  </div>
                ) : (
                  stageCards.map((card) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card.id)}
                      onDragEnd={handleDragEnd}
                      className={['cursor-grab active:cursor-grabbing rounded-lg border bg-white p-3 shadow-sm hover:shadow-md transition', dragCard === card.id ? 'opacity-50 border-brand-300' : 'border-slate-200'].join(' ')}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 min-w-0">
                          <GripVertical className="mt-0.5 h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{card.company}</p>
                            <p className="text-xs text-slate-500 truncate">{card.title}</p>
                          </div>
                        </div>
                        <button onClick={() => openEdit(card)} className="text-slate-300 hover:text-slate-500 flex-shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                      {card.applied_date && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
                          <Calendar className="h-3 w-3" /> {card.applied_date}
                        </div>
                      )}
                      {card.notes && (
                        <div className="mt-1.5 flex items-start gap-1 text-[10px] text-slate-400">
                          <StickyNote className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{card.notes}</span>
                        </div>
                      )}
                      {/* Quick move buttons */}
                      <div className="mt-2 flex gap-1">
                        {STAGES.filter((s) => s.key !== key).slice(0, 3).map((s) => (
                          <button
                            key={s.key}
                            onClick={() => moveCard(card.id, s.key)}
                            className="rounded px-1.5 py-0.5 text-[9px] font-medium border border-slate-200 text-slate-400 hover:bg-slate-100 transition truncate"
                          >
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">{editCard ? 'Edit Application' : 'Add Application'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company *</label>
                <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. Google" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior ML Engineer" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stage</label>
                  <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                    {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input type="date" value={form.applied_date} onChange={(e) => setForm({ ...form, applied_date: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job URL</label>
                <input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Referral from..., interview prep notes..." className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between">
              {editCard ? (
                <button onClick={() => deleteCard(editCard.id)} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              ) : <div />}
              <div className="flex gap-2">
                <button onClick={() => setShowModal(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={saveCard} disabled={!form.company.trim() || !form.title.trim()} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition">
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
