'use client';

import { useState, useEffect, useCallback } from 'react';

const RESUME_KEY = 'jobseeker_base_resume';

export interface ResumeProfile {
  fileName: string;
  text: string;
  uploadedAt: string;
}

export function useResumeProfile() {
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RESUME_KEY);
      if (raw) setProfile(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (profile) {
      localStorage.setItem(RESUME_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(RESUME_KEY);
    }
  }, [profile, loaded]);

  const saveResume = useCallback((fileName: string, text: string) => {
    setProfile({ fileName, text, uploadedAt: new Date().toISOString() });
  }, []);

  const clearResume = useCallback(() => {
    setProfile(null);
  }, []);

  return { profile, loaded, saveResume, clearResume };
}
