'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ResumeVersion {
  id: string;
  label: string;
  jobTitle: string;
  company: string;
  resumeData: any;
  score: number;
  originalScore: number;
  createdAt: string;
}

const VERSIONS_KEY = 'jobseeker_resume_versions';
const HISTORY_KEY = 'jobseeker_score_history';

export function useResumeVersions() {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [history, setHistory] = useState<{ date: string; score: number; job: string }[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try { const v = localStorage.getItem(VERSIONS_KEY); if (v) setVersions(JSON.parse(v)); } catch {}
    try { const h = localStorage.getItem(HISTORY_KEY); if (h) setHistory(JSON.parse(h)); } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => { if (loaded) { try { localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions)); } catch {} } }, [versions, loaded]);
  useEffect(() => { if (loaded) { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch {} } }, [history, loaded]);

  const saveVersion = useCallback((label: string, jobTitle: string, company: string, resumeData: any, score: number, originalScore: number) => {
    const v: ResumeVersion = { id: Date.now().toString(36), label, jobTitle, company, resumeData, score, originalScore, createdAt: new Date().toISOString() };
    setVersions((p) => [v, ...p]);
    setHistory((p) => [{ date: new Date().toISOString(), score, job: `${jobTitle} at ${company}` }, ...p].slice(0, 50));
    return v;
  }, []);

  const deleteVersion = useCallback((id: string) => { setVersions((p) => p.filter((v) => v.id !== id)); }, []);

  return { versions, history, loaded, saveVersion, deleteVersion };
}
