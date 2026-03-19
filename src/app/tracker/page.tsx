'use client';

import { useState } from 'react';
import { Plus, GripVertical, MoreHorizontal } from 'lucide-react';
import { cn, getStageColor } from '@/lib/utils';
import type { ApplicationStage } from '@/types';

interface TrackerCard {
  id: string;
  company: string;
  title: string;
  stage: ApplicationStage;
  applied_date?: string;
  notes?: string;
}

const STAGES: { key: ApplicationStage; label: string }[] = [
  { key: 'saved', label: 'Saved' },
  { key: 'applied', label: 'Applied' },
  { key: 'screening', label: 'Screening' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'rejected', label: 'Rejected' },
];

// Placeholder data for scaffold
const SAMPLE_CARDS: TrackerCard[] = [];

export default function TrackerPage() {
  const [cards, setCards] = useState<TrackerCard[]>(SAMPLE_CARDS);
  const [showAddModal, setShowAddModal] = useState(false);

  const getCardsForStage = (stage: ApplicationStage) =>
    cards.filter((c) => c.stage === stage);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Application Tracker
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Drag cards between columns to update status. {cards.length} applications.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition"
        >
          <Plus className="h-4 w-4" />
          Add Application
        </button>
      </div>

      {/* Kanban Board */}
      <div className="mt-8 flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(({ key, label }) => {
          const stageCards = getCardsForStage(key);
          return (
            <div
              key={key}
              className="flex w-72 flex-shrink-0 flex-col rounded-xl bg-slate-50 p-3"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      getStageColor(key)
                    )}
                  >
                    {label}
                  </span>
                  <span className="text-xs text-slate-400">
                    {stageCards.length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-2 min-h-[200px]">
                {stageCards.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-xs text-slate-300">
                    Drop here
                  </div>
                ) : (
                  stageCards.map((card) => (
                    <div
                      key={card.id}
                      className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <GripVertical className="mt-0.5 h-3.5 w-3.5 text-slate-300" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {card.company}
                            </p>
                            <p className="text-xs text-slate-500">
                              {card.title}
                            </p>
                          </div>
                        </div>
                        <button className="text-slate-300 hover:text-slate-500">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                      {card.applied_date && (
                        <p className="mt-2 text-[10px] text-slate-400">
                          Applied {card.applied_date}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
