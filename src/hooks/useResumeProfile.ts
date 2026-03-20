'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBaseResume, saveBaseResume, deleteBaseResume } from '@/lib/db';

export interface ResumeProfile {
  fileName: string;
  text: string;
  uploadedAt: string;
}

export interface PersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
}

const LOCAL_KEY = 'jobseeker_base_resume';
const TITLES_KEY = 'jobseeker_target_titles';
const DETAILS_KEY = 'jobseeker_personal_details';

const DEFAULT_DETAILS: PersonalDetails = { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '' };

export function useResumeProfile() {
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [titles, setTitles] = useState<string[]>([]);
  const [details, setDetails] = useState<PersonalDetails>(DEFAULT_DETAILS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try { const db = await getBaseResume(); if (db) setProfile(db); } catch {}
      try { const r = localStorage.getItem(LOCAL_KEY); if (r && !profile) setProfile(JSON.parse(r)); } catch {}
      try { const t = localStorage.getItem(TITLES_KEY); if (t) setTitles(JSON.parse(t)); } catch {}
      try { const d = localStorage.getItem(DETAILS_KEY); if (d) setDetails(JSON.parse(d)); } catch {}
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

  const saveTitles = useCallback((t: string[]) => {
    setTitles(t);
    try { localStorage.setItem(TITLES_KEY, JSON.stringify(t)); } catch {}
  }, []);

  const addTitle = useCallback((t: string) => {
    if (!t.trim() || titles.includes(t.trim())) return;
    saveTitles([...titles, t.trim()]);
  }, [titles, saveTitles]);

  const removeTitle = useCallback((t: string) => saveTitles(titles.filter((x) => x !== t)), [titles, saveTitles]);

  const saveDetails = useCallback((d: PersonalDetails) => {
    setDetails(d);
    try { localStorage.setItem(DETAILS_KEY, JSON.stringify(d)); } catch {}
  }, []);

  return { profile, titles, details, loaded, saveResume, clearResume, saveTitles, addTitle, removeTitle, saveDetails };
}
