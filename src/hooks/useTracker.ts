export type Stage = "saved" | "applied" | "screening" | "interview" | "offer" | "rejected";
'use client';
import { useState, useEffect, useCallback } from 'react';
import { getTrackerCards, saveTrackerCard, updateTrackerCard, deleteTrackerCard } from '@/lib/db';

export interface TrackerCard {
  id: string; title: string; company: string; stage: string;
  date: string; url: string; location: string; salary: string;
  notes: string; match_score?: number;
}

export function useTracker() {
  const [cards, setCards] = useState<TrackerCard[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try { const c = await getTrackerCards(); setCards(c); } catch (e) { console.error(e); }
      setLoaded(true);
    }
    load();
  }, []);

  const saveJob = useCallback(async (job: { title: string; company: string; url?: string; location?: string; salary?: string; match_score?: number }) => {
    const card = await saveTrackerCard({ ...job, stage: 'saved' });
    if (card) setCards(p => [card as any, ...p]);
  }, []);

  const unsaveJob = useCallback(async (url: string) => {
    const card = cards.find(c => c.url === url);
    if (card) { try { await deleteTrackerCard(card.id); } catch {} setCards(p => p.filter(c => c.url !== url)); }
  }, [cards]);

  const addCard = useCallback(async (card: Partial<TrackerCard>) => {
    const saved = await saveTrackerCard({ title: card.title || '', company: card.company || '', stage: card.stage, url: card.url, location: card.location, salary: card.salary, notes: card.notes, match_score: card.match_score });
    if (saved) setCards(p => [saved as any, ...p]);
  }, []);

  const moveCard = useCallback(async (id: string, stage: string) => {
    try { await updateTrackerCard(id, { stage }); } catch {}
    setCards(p => p.map(c => c.id === id ? { ...c, stage } : c));
  }, []);

  const editCard = useCallback(async (id: string, updates: Partial<TrackerCard>) => {
    try { await updateTrackerCard(id, updates); } catch {}
    setCards(p => p.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const removeCard = useCallback(async (id: string) => {
    try { await deleteTrackerCard(id); } catch {}
    setCards(p => p.filter(c => c.id !== id));
  }, []);

  return { cards, loaded, saveJob, unsaveJob, addCard, moveCard, editCard, removeCard };
}
