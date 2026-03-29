'use client';

import { useState } from 'react';
import {
  Plus, GripVertical, MoreHorizontal, X, Trash2,
  Calendar, StickyNote, ExternalLink, MapPin,
} from 'lucide-react';
import { useTracker } from '@/hooks/useTracker';
import PageHeader from '@/components/layout/PageHeader';
type Stage = string;
type AppCard = { id: string; title: string; company: string; stage: string; date: string; url: string; location: string; salary: string; notes: string; match_score?: number; };

const STAGES: { key: Stage; label: string; color: string }[] = [
  { key: 'saved', label: 'Saved', color: 'bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--separator)]' },
  { key: 'applied', label: 'Applied', color: 'bg-[rgba(96,165,250,0.15)] text-[var(--info)] border-[rgba(96,165,250,0.28)]' },
  { key: 'screening', label: 'Screening', color: 'bg-[rgba(251,191,36,0.12)] text-[var(--warning)] border-[rgba(251,191,36,0.25)]' },
  { key: 'interview', label: 'Interview', color: 'bg-[rgba(139,157,255,0.15)] text-[var(--accent-secondary)] border-[rgba(139,157,255,0.28)]' },
  { key: 'offer', label: 'Offer', color: 'bg-[rgba(74,222,128,0.14)] text-[var(--success)] border-[rgba(74,222,128,0.28)]' },
  { key: 'rejected', label: 'Rejected', color: 'bg-[rgba(251,113,133,0.12)] text-[var(--destructive)] border-[rgba(251,113,133,0.25)]' },
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
    return <div className="flex items-center justify-center py-20 text-sm text-[var(--text-tertiary)]">Loading tracker…</div>;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Pipeline"
        title="Application tracker"
        description={`Drag cards between stages. ${tracker.cards.length} application${tracker.cards.length !== 1 ? 's' : ''}.`}
        action={
          <button type="button" onClick={openAdd} className="btn-filled btn-sm gap-2 !min-h-0 py-2.5">
            <Plus className="h-4 w-4" /> Add
          </button>
        }
      />

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
              className={['flex w-64 flex-shrink-0 flex-col rounded-[var(--radius-lg)] p-2.5 transition-colors min-h-[300px] border', isOver ? 'bg-[var(--accent-dim)] ring-2 ring-[var(--accent)]/35 border-[var(--accent-dim-strong)]' : 'bg-[var(--surface-2)] border-[var(--separator)]'].join(' ')}
            >
              <div className="flex items-center justify-between px-1 pb-2">
                <div className="flex items-center gap-2">
                  <span className={['inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border', color].join(' ')}>{label}</span>
                  <span className="text-xs text-[var(--text-tertiary)] font-semibold">{stageCards.length}</span>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                {stageCards.length === 0 ? (
                  <div className={['flex items-center justify-center py-10 text-xs rounded-[var(--radius-lg)] border-2 border-dashed transition-colors', isOver ? 'border-[var(--accent)]/35 text-[var(--accent)]' : 'border-transparent text-[var(--text-tertiary)]'].join(' ')}>
                    {isOver ? 'Drop here' : 'No applications'}
                  </div>
                ) : (
                  stageCards.map((card) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card.id)}
                      onDragEnd={handleDragEnd}
                      className={['cursor-grab active:cursor-grabbing rounded-[var(--radius-lg)] border bg-white p-3 transition hover:border-[var(--accent-dim-strong)]', dragCard === card.id ? 'opacity-50 border-[var(--accent)]/35' : 'border-[var(--separator)]'].join(' ')}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 min-w-0">
                          <GripVertical className="mt-0.5 h-3.5 w-3.5 text-[var(--text-tertiary)] flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{card.company}</p>
                            <p className="text-xs text-[var(--text-secondary)] truncate">{card.title}</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => openEdit(card)} className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] flex-shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                      {card.location && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-[var(--text-tertiary)]">
                          <MapPin className="h-3 w-3" /> {card.location}
                        </div>
                      )}
                      {card.date && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-[var(--text-tertiary)]">
                          <Calendar className="h-3 w-3" /> {card.date}
                        </div>
                      )}
                      {card.notes && (
                        <div className="mt-1.5 flex items-start gap-1 text-[10px] text-[var(--text-tertiary)]">
                          <StickyNote className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{card.notes}</span>
                        </div>
                      )}
                      {card.url && card.url !== '#' && (
                        <a href={card.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--accent)] hover:opacity-90">
                          <ExternalLink className="h-3 w-3" /> View posting
                        </a>
                      )}
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {STAGES.filter((s) => s.key !== key).slice(0, 3).map((s) => (
                          <button type="button" key={s.key} onClick={() => tracker.moveCard(card.id, s.key)} className="rounded px-1.5 py-0.5 text-[9px] font-medium border border-[var(--separator)] text-[var(--text-tertiary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-secondary)] transition truncate">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm px-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--separator)] bg-white p-6 shadow-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editCard ? 'Edit application' : 'Add application'}</h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="input-label !normal-case !tracking-normal">Company *</label>
                <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. Google" className="input-hig" />
              </div>
              <div>
                <label className="input-label !normal-case !tracking-normal">Job title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior ML Engineer" className="input-hig" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label !normal-case !tracking-normal">Stage</label>
                  <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })} className="w-full rounded-[var(--radius-md)] border border-[var(--separator)] bg-white px-3 py-2 text-sm text-[var(--text-primary)]">
                    {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label !normal-case !tracking-normal">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-[var(--radius-md)] border border-[var(--separator)] bg-white px-3 py-2 text-sm text-[var(--text-primary)]" />
                </div>
              </div>
              <div>
                <label className="input-label !normal-case !tracking-normal">Job URL</label>
                <input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." className="input-hig" />
              </div>
              <div>
                <label className="input-label !normal-case !tracking-normal">Notes</label>
                <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Referral from..., interview prep notes..." className="input-hig" />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between">
              {editCard ? (
                <button type="button" onClick={() => { tracker.removeCard(editCard.id); setShowModal(false); }} className="flex items-center gap-1 text-sm text-[var(--destructive)] hover:opacity-90">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              ) : <div />}
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-gray btn-sm !min-h-0">Cancel</button>
                <button type="button" onClick={saveCard} disabled={!form.company.trim() || !form.title.trim()} className="btn-filled btn-sm !min-h-0 disabled:opacity-40">
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
