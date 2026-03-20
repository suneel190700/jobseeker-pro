'use client';

import { useState, useEffect, useCallback } from 'react';

export type Stage = 'saved' | 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';

export interface AppCard {
  id: string;
  company: string;
  title: string;
  stage: Stage;
  applied_date: string;
  notes: string;
  url: string;
  location?: string;
  salary?: string;
  match_score?: number;
  match_reason?: string;
}

const STORAGE_KEY = 'jobseeker_tracker_cards';

function loadLocal(): AppCard[] {
  if (typeof window === 'undefined') return [];
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}

function saveLocal(cards: AppCard[]) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cards)); } catch {}
}

export function useTracker() {
  const [cards, setCards] = useState<AppCard[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCards(loadLocal());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveLocal(cards);
  }, [cards, loaded]);

  // Cross-tab sync
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try { setCards(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const addCard = useCallback((card: Omit<AppCard, 'id'>) => {
    const newCard: AppCard = { ...card, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) };
    setCards((prev) => [...prev, newCard]);
    return newCard;
  }, []);

  const updateCard = useCallback((id: string, updates: Partial<AppCard>) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const deleteCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const moveCard = useCallback((id: string, newStage: Stage) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, stage: newStage } : c)));
  }, []);

  const saveJob = useCallback((job: { title: string; company: string; url: string; location?: string; salary?: string; match_score?: number; match_reason?: string }) => {
    if (cards.some((c) => c.url === job.url)) return null;
    return addCard({
      company: job.company, title: job.title, stage: 'saved',
      applied_date: new Date().toISOString().split('T')[0],
      notes: '', url: job.url, location: job.location, salary: job.salary,
      match_score: job.match_score, match_reason: job.match_reason,
    });
  }, [cards, addCard]);

  const unsaveJob = useCallback((url: string) => {
    const card = cards.find((c) => c.url === url);
    if (card) deleteCard(card.id);
  }, [cards, deleteCard]);

  return { cards, loaded, addCard, updateCard, deleteCard, moveCard, saveJob, unsaveJob, setCards };
}
