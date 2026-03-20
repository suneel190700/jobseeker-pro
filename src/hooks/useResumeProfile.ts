'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBaseResume, saveBaseResume, deleteBaseResume } from '@/lib/db';

export interface ResumeProfile {
  fileName: string;
  text: string;
  uploadedAt: string;
}

const LOCAL_KEY = 'jobseeker_base_resume';

export function useResumeProfile() {
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      // Try Supabase first
      try {
        const db = await getBaseResume();
        if (db) { setProfile(db); setLoaded(true); return; }
      } catch {}

      // Fallback to localStorage
      try {
        const raw = localStorage.getItem(LOCAL_KEY);
        if (raw) setProfile(JSON.parse(raw));
      } catch {}
      setLoaded(true);
    }
    load();
  }, []);

  const saveResume = useCallback(async (fileName: string, text: string) => {
    const p: ResumeProfile = { fileName, text, uploadedAt: new Date().toISOString() };
    setProfile(p);

    // Save to localStorage immediately
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(p)); } catch {}

    // Save to Supabase in background
    try { await saveBaseResume(fileName, text); } catch {}
  }, []);

  const clearResume = useCallback(async () => {
    setProfile(null);
    try { localStorage.removeItem(LOCAL_KEY); } catch {}
    try { await deleteBaseResume(); } catch {}
  }, []);

  return { profile, loaded, saveResume, clearResume };
}
