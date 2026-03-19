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
}

const STORAGE_KEY = 'jobseeker_tracker_cards';

function loadCards(): AppCard[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCards(cards: AppCard[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch {
    // Storage full or unavailable
  }
}

export function useTracker() {
  const [cards, setCards] = useState<AppCard[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setCards(loadCards());
    setLoaded(true);
  }, []);

  // Persist on every change (after initial load)
  useEffect(() => {
    if (loaded) saveCards(cards);
  }, [cards, loaded]);

  // Listen for changes from other tabs/pages
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setCards(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const addCard = useCallback((card: Omit<AppCard, 'id'>) => {
    const newCard: AppCard = {
      ...card,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    };
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

  const isJobSaved = useCallback(
    (jobId: string) => cards.some((c) => c.url === jobId || c.id === jobId),
    [cards]
  );

  const saveJob = useCallback(
    (job: { title: string; company: string; url: string; location?: string; salary?: string }) => {
      // Check if already saved by URL
      if (cards.some((c) => c.url === job.url)) return null;
      return addCard({
        company: job.company,
        title: job.title,
        stage: 'saved',
        applied_date: new Date().toISOString().split('T')[0],
        notes: '',
        url: job.url,
        location: job.location,
        salary: job.salary,
      });
    },
    [cards, addCard]
  );

  const unsaveJob = useCallback(
    (url: string) => {
      const card = cards.find((c) => c.url === url);
      if (card) deleteCard(card.id);
    },
    [cards, deleteCard]
  );

  return {
    cards,
    loaded,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    isJobSaved,
    saveJob,
    unsaveJob,
    setCards,
  };
}
