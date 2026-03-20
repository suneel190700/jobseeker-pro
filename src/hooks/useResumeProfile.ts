'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBaseResume, saveBaseResume, deleteBaseResume } from '@/lib/db';

export interface ResumeProfile {
  fileName: string;
  text: string;
  uploadedAt: string;
}

const LOCAL_KEY = 'jobseeker_base_resume';
const TITLES_KEY = 'jobseeker_target_titles';

export function useResumeProfile() {
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [titles, setTitles] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const db = await getBaseResume();
        if (db) { setProfile(db); }
      } catch {}
      try {
        const raw = localStorage.getItem(LOCAL_KEY);
        if (raw && !profile) setProfile(JSON.parse(raw));
      } catch {}
      try {
        const t = localStorage.getItem(TITLES_KEY);
        if (t) setTitles(JSON.parse(t));
      } catch {}
      setLoaded(true);
    }
    load();
  }, []);

  const saveResume = useCallback(async (fileName: string, text: string) => {
    const p: ResumeProfile = { fileName, text, uploadedAt: new Date().toISOString() };
    setProfile(p);
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(p)); } catch {}
    try { await saveBaseResume(fileName, text); } catch {}
  }, []);

  const clearResume = useCallback(async () => {
    setProfile(null);
    try { localStorage.removeItem(LOCAL_KEY); } catch {}
    try { await deleteBaseResume(); } catch {}
  }, []);

  const saveTitles = useCallback((newTitles: string[]) => {
    setTitles(newTitles);
    try { localStorage.setItem(TITLES_KEY, JSON.stringify(newTitles)); } catch {}
  }, []);

  const addTitle = useCallback((title: string) => {
    if (!title.trim() || titles.includes(title.trim())) return;
    const updated = [...titles, title.trim()];
    saveTitles(updated);
  }, [titles, saveTitles]);

  const removeTitle = useCallback((title: string) => {
    saveTitles(titles.filter((t) => t !== title));
  }, [titles, saveTitles]);

  return { profile, titles, loaded, saveResume, clearResume, saveTitles, addTitle, removeTitle };
}
